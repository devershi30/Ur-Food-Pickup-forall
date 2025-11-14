package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DistanceResult {
    private double distanceMeters;
    private double durationMinutes;
    private String provider;
}
