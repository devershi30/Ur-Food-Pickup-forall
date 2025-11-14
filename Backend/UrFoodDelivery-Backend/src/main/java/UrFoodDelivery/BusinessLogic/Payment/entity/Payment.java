package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.entity;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.Order;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.entity.enums.PaymentMethod;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.entity.enums.PaymentStatus;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder

public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID uid;

    @JsonIgnore
    @ManyToOne
    private Order order;

    @ManyToOne
    private Account student;

    private double amount;

    private String currency;

    private PaymentMethod paymentMethod;

    private PaymentStatus status;

    private String transactionId;

    private String stripeChargeId;

    @Column(columnDefinition = "TEXT")
    private String failureReason;


    private ZonedDateTime createdAt;

    private ZonedDateTime updatedAt;

    private ZonedDateTime refundedAt;

}
