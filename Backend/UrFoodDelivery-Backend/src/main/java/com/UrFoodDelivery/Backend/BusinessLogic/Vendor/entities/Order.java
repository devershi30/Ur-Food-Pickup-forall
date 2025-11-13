package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

import com.UrFoodDelivery.UrFoodDelivery.Backend.UsersAccounts.Entity.Account;  //  Correct import
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;  //  For Vendor relationship

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Account student; // Changed user class to Account class

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "total_cents")
    private Long totalCents;

    private String status;
    @Column(name = "created_at")
    private Instant createdAt;
}
