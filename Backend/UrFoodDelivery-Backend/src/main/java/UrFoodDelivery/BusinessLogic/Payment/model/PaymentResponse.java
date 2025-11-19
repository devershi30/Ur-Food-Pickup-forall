package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.model;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.entity.Payment;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse extends Payment {

    private String paymentStatus;

    private String paymentMessage;

}