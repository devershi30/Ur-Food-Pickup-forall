package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.repository;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
}
