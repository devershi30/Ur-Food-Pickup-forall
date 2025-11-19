package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.service;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.Order;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.DeliveryType;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.OrderStatus;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.repository.OrderRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.Utils.PaymentException;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.entity.Payment;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.entity.enums.PaymentMethod;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.entity.enums.PaymentStatus;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.model.PaymentRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.model.PaymentResponse;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.repository.PaymentRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository.AccountRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Service.AccountService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.WebSocket.service.WebSocketService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private AccountRepository userRepository;
    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private AccountService accountService;


    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${payment.test.mode:true}")
    private boolean testMode;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        Account user = accountService.currentAccount();

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getStudent().getUid().equals(user.getUid())) {
            throw new PaymentException("Unauthorized to process payment for this order");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setStudent(user);
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setCreatedAt(ZonedDateTime.now());

        if (request.getPaymentMethod().equals("CASH")) {
            // Cash payment - mark as pending
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId("CASH-" + UUID.randomUUID().toString());
            payment = paymentRepository.save(payment);

            // Update order status
            order.setStatus(OrderStatus.RECEIVED);
//            order.setPayment(payment);
            orderRepository.save(order);

            return mapToResponse(payment, "SUCCESS", "Order placed. Pay with cash on " + 
                    (order.getDeliveryType() == DeliveryType.DELIVERY ? "delivery" : "pickup"));
        }

        // Card payment processing
        if (request.getCardDetails() == null) {
            throw new PaymentException("Card details are required");
        }

        try {
            // In test mode, simulate Stripe API behavior
            if (testMode || isTestCard(request.getCardDetails().getCardNumber())) {
                payment = processTestPayment(payment, request);
            } else {
                // In production, call actual Stripe API
                payment = processStripePayment(payment, request);
            }

            payment = paymentRepository.save(payment);

            // Update order based on payment status
            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                order.setStatus(OrderStatus.RECEIVED);
                try {
                    if(order.getPayments()==null)
                        order.setPayments(new ArrayList<>());
                    order.getPayments().add(payment);
                }catch (Exception es){}
                orderRepository.save(order);

                // Notify vendor
                webSocketService.sendOrderNotification(
                        order.getVendor().getUid(),
                        "New paid order received: #" + order.getUid()
                );
            }

            return mapToResponse(payment, 
                    payment.getStatus() == PaymentStatus.COMPLETED ? "SUCCESS" : "FAILED",
                    payment.getStatus() == PaymentStatus.COMPLETED ? "Payment successful" : payment.getFailureReason());

        } catch (Exception e) {
            log.error("Payment processing failed", e);
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());
            paymentRepository.save(payment);

            throw new PaymentException("Payment processing failed: " + e.getMessage());
        }
    }

    private Payment processTestPayment(Payment payment, PaymentRequest request) {
        String cardNumber = request.getCardDetails().getCardNumber().replace(" ", "");
        
        // Simulate Stripe test card behavior
        switch (cardNumber) {
            case "4242424242424242":
                // Success card
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setTransactionId("ch_test_" + UUID.randomUUID().toString());
                payment.setStripeChargeId("ch_test_" + System.currentTimeMillis());
                break;
                
            case "4000000000000002":
                // Decline card
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Your card was declined");
                payment.setTransactionId("ch_test_declined_" + UUID.randomUUID().toString());
                break;
                
            case "4000000000009995":
                // Insufficient funds
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Your card has insufficient funds");
                payment.setTransactionId("ch_test_insufficient_" + UUID.randomUUID().toString());
                break;
                
            case "4000000000000069":
                // Expired card
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Your card has expired");
                payment.setTransactionId("ch_test_expired_" + UUID.randomUUID().toString());
                break;
                
            case "4000000000000127":
                // Incorrect CVC
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Your card's security code is incorrect");
                payment.setTransactionId("ch_test_cvc_" + UUID.randomUUID().toString());
                break;
                
            default:
                // Treat any other card as success in test mode
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setTransactionId("ch_test_" + UUID.randomUUID().toString());
                payment.setStripeChargeId("ch_test_" + System.currentTimeMillis());
        }

        payment.setUpdatedAt(ZonedDateTime.now());
        return payment;
    }

    private Payment processStripePayment(Payment payment, PaymentRequest request) {
        // This would integrate with actual Stripe API
        // For now, keeping it simple for test purposes
        
        // Example Stripe integration (commented out - requires stripe-java dependency):
        /*
        Stripe.apiKey = stripeApiKey;
        
        Map<String, Object> params = new HashMap<>();
        params.put("amount", payment.getAmount().multiply(new BigDecimal("100")).longValue());
        params.put("currency", payment.getCurrency().toLowerCase());
        params.put("source", createStripeToken(request.getCardDetails()));
        params.put("description", "Order #" + payment.getOrder().getUid());
        
        try {
            Charge charge = Charge.create(params);
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(charge.getUid());
            payment.setStripeChargeId(charge.getUid());
        } catch (CardException e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());
        }
        */
        
        throw new PaymentException("Production Stripe integration not configured. Please use test mode.");
    }

    private boolean isTestCard(String cardNumber) {
        String cleanCard = cardNumber.replace(" ", "");
        return cleanCard.startsWith("4242") || 
               cleanCard.startsWith("4000") ||
               cleanCard.startsWith("5555");
    }

    public PaymentResponse getPaymentStatus(UUID orderId) {
        Account user = accountService.currentAccount();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getStudent().getUid().equals(user.getUid())) {
            throw new PaymentException("Unauthorized to view payment for this order");
        }

        List<Payment> payments = order.getPayments();
        if (payments.isEmpty()) {
            throw new ResourceNotFoundException("No payment found for this order");
        }

        Payment payment = payments.getLast();
        return mapToResponse(payment,
                payment.getStatus() == PaymentStatus.COMPLETED ? "SUCCESS" : "FAILED",
                payment.getStatus() == PaymentStatus.COMPLETED ? "Payment completed" : payment.getFailureReason());
    }

    @Transactional
    public PaymentResponse refundPayment(UUID orderId) {
        Account user = accountService.currentAccount();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        List<Payment> payments = order.getPayments();
        if (payments .isEmpty()) {
            throw new ResourceNotFoundException("No payment found for this order");
        }

        Payment payment = payments.getLast();
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new PaymentException("Only completed payments can be refunded");
        }

        if (payment.getPaymentMethod() == PaymentMethod.CASH) {
            throw new PaymentException("Cash payments cannot be refunded through the system");
        }

        // In test mode, simulate refund
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundedAt(ZonedDateTime.now());
        payment.setUpdatedAt(ZonedDateTime.now());
        paymentRepository.save(payment);

        // Update order status
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        return mapToResponse(payment, "SUCCESS", "Payment refunded successfully");
    }

    private PaymentResponse mapToResponse(Payment payment, String status, String message) {
        PaymentResponse response = new PaymentResponse();

        BeanUtils.copyProperties(payment,response);

        response.setPaymentMessage(message);
        response.setPaymentStatus(status);


        return response;
    }
}