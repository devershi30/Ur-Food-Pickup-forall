package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.controller;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.model.PaymentRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.model.PaymentResponse;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(
            @Valid @RequestBody PaymentRequest paymentRequest)
    {
        
        PaymentResponse response = paymentService.processPayment(paymentRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentStatus(
            @PathVariable UUID orderId) {
        
        PaymentResponse response = paymentService.getPaymentStatus(orderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refund/{orderId}")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable UUID orderId) {
        
        PaymentResponse response = paymentService.refundPayment(orderId);
        return ResponseEntity.ok(response);
    }
}