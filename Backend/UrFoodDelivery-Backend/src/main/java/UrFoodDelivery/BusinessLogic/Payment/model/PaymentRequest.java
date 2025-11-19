package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PaymentRequest {
    
    @NotNull(message = "Order ID is required")
    private UUID orderId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private double amount;
    
    private String currency;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CARD, CASH, MOBILE_MONEY
    
    private CardDetails cardDetails;
    
    @Data
    public static class CardDetails {
        @NotBlank(message = "Card number is required")
        private String cardNumber;
        
        @NotBlank(message = "Expiry month is required")
        private String expiryMonth;
        
        @NotBlank(message = "Expiry year is required")
        private String expiryYear;
        
        @NotBlank(message = "CVC is required")
        private String cvc;
        
        @NotBlank(message = "Cardholder name is required")
        private String cardHolderName;
    }
}