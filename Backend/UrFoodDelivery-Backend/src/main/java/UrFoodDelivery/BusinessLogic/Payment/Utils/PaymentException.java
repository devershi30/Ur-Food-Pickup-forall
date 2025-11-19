package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.Utils;

public class PaymentException extends RuntimeException {
    public PaymentException(String message) {
        super(message);
    }
    
    public PaymentException(String message, Throwable cause) {
        super(message, cause);
    }
}