package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DistanceRequest {
    private double fromLat;
    private double fromLon;
    private double toLat;
    private double toLon;
    private String mode;  // car, bike, foot
}
