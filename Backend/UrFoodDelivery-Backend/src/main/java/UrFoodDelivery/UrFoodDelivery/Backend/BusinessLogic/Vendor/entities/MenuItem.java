package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "menu_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    private String name;
    private String description;
    @Column(name = "price_cents")
    private Long priceCents;
    private Boolean available;
    @Column(name = "created_at")
    private Instant createdAt;
}
