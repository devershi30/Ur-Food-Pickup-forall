package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.application;


import lombok.Data;

@Data
public class VendorApplicationRequest {

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
