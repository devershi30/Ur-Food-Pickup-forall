package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.service;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.entity.MenuFood;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.repository.MenuFoodRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.Utils.UnauthorizedException;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.Order;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.OrderItem;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.DeliveryType;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.OrderStatus;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.models.OrderRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.models.OrderResponse;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.repository.OrderRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository.AccountRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Service.AccountService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.WebSocket.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AccountRepository userRepository;
    @Autowired
    private MenuFoodRepository foodItemRepository;
    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private AccountService accountService;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Account user = accountService.currentAccount();

        // Create order
        Order order = new Order();
        order.setStudent(user);
        order.setDeliveryType(DeliveryType.valueOf(request.getOrderType()));
        order.setDeliveryLocation(request.getDeliveryLocation());
        order.setSpecialInstructions(request.getSpecialInstructions());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(ZonedDateTime.now());

        // Calculate total
        double subtotal = 0.0;

        // Create order items
        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            MenuFood foodItem = foodItemRepository.findById(itemRequest.getFoodItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuFood(foodItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(foodItem.getPrice());

            try {
                if(order.getOrderItems()==null)
                    order.setOrderItems(new ArrayList<>());
                order.getOrderItems().add(orderItem);
            }catch (Exception es){}

            subtotal = subtotal+foodItem.getPrice()
                    *(itemRequest.getQuantity());
        }

        // Get vendor from first item (assuming all items from same vendor)
        if (!order.getOrderItems().isEmpty()) {
            order.setVendor(order.getOrderItems().get(0).getMenuFood().getMenu().getVendor());
        }

        // Calculate fees and total
        double deliveryFee = order.getDeliveryType() == DeliveryType.DELIVERY
                ? 2.99
                : 0.0;
        double tax = subtotal*(0.08);
        double total = subtotal+(deliveryFee)+(tax);

        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTax(tax);
        order.setTotal(total);

        // Set estimated time
        order.setEstimatedTime("20-30 mins");

        order = orderRepository.save(order);

        // Send WebSocket notification to vendor
        webSocketService.sendOrderNotification(order.getVendor().getUid(),
                "New order received: #" + order.getUid());

        return mapToResponse(order);
    }

    public List<OrderResponse> getUserOrders() {
        Account user = accountService.currentAccount();

        List<Order> orders = orderRepository.findByStudentUidOrderByCreatedAtDesc(user.getUid());
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(UUID orderId) {
        Account user = accountService.currentAccount();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getStudent().getUid().equals(user.getUid())) {
            throw new UnauthorizedException("You don't have permission to view this order");
        }

        return mapToResponse(order);
    }

    public List<OrderResponse> getActiveOrders() {
        Account user = accountService.currentAccount();

        List<OrderStatus> activeStatuses = List.of(
                OrderStatus.PENDING,
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.OUT_FOR_DELIVERY
        );

        List<Order> orders = orderRepository.findByStudentUidAndStatusInOrderByCreatedAtDesc(
                user.getUid(), activeStatuses);

        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrderHistory() {
        Account user = accountService.currentAccount();

        List<OrderStatus> completedStatuses = List.of(
                OrderStatus.COMPLETED,
                OrderStatus.CANCELLED
        );

        List<Order> orders = orderRepository.findByStudentUidAndStatusInOrderByCreatedAtDesc(
                user.getUid(), completedStatuses);

        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify user is vendor of this order
        Account user = accountService.currentAccount();

        if (!order.getVendor().getVendorAccount().getUid().equals(user.getUid())) {
            throw new UnauthorizedException("You don't have permission to update this order");
        }

        OrderStatus newStatus = OrderStatus.valueOf(status);
        order.setStatus(newStatus);
        order.setUpdatedAt(ZonedDateTime.now());

        if (newStatus == OrderStatus.COMPLETED) {
            order.setCompletedAt(ZonedDateTime.now());
        }

        order = orderRepository.save(order);

        // Send WebSocket update to customer
        webSocketService.sendOrderStatusUpdate(
                order.getStudent().getUid(),
                orderId,
                status
        );

        return mapToResponse(order);
    }

    @Transactional
    public void cancelOrder(UUID orderId) {
        Account user = accountService.currentAccount();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getStudent().getUid().equals(user.getUid())) {
            throw new UnauthorizedException("You don't have permission to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.RECEIVED) {
            throw new IllegalStateException("Order cannot be cancelled at this stage");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(ZonedDateTime.now());
        orderRepository.save(order);

        // Send notification to vendor
        webSocketService.sendOrderNotification(order.getVendor().getUid(),
                "Order #" + orderId + " has been cancelled");
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        BeanUtils.copyProperties(order,response);
        return response;
    }
}