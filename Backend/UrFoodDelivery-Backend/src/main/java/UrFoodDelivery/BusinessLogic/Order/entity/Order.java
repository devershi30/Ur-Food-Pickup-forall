package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.Utils.Location;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.DeliveryType;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.OrderStatus;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Payment.entity.Payment;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "all_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID uid;

    @ManyToOne
    private Account student;

    @ManyToOne
    private Vendor vendor;


    @OneToMany(mappedBy = "order",cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;


    private DeliveryType deliveryType;

    private Location deliveryLocation;


    private OrderStatus status;

    @Column(columnDefinition = "TEXT")
    private String specialInstructions;

    private double subtotal;

    private double deliveryFee;

    private double tax;

    private double total;

    private String estimatedTime;

    private ZonedDateTime createdAt;

    private ZonedDateTime updatedAt;

    private ZonedDateTime completedAt;

    @OneToMany(mappedBy = "order",cascade = CascadeType.ALL)
    private List<Payment> payments;


}
