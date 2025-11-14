package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.model;


import lombok.Data;

@Data
public class UpdateVendorRequest {

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
