package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.settings;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int orderTimeout; // minutes
    private double defaultRadius; // km
    private boolean autoApproveVendors;
}
