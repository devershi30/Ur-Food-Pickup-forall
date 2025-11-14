package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder

@Entity
public class VendorLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID uid;

    private double longitude;

    private double latitude;

    private String state;

    private String address;

    private String restaurantName;

    private String cuisine;

    private String description;

    private String phone;

    private String openingHours;


}
