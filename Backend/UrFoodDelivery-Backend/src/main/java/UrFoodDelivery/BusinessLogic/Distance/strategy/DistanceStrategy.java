package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.strategy;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceResult;

public interface DistanceStrategy {
    DistanceResult calculate(DistanceRequest req) throws Exception;
}
