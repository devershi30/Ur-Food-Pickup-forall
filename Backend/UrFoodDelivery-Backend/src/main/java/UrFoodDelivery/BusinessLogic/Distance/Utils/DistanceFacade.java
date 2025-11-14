package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.Utils;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceResult;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.strategy.OpenRouteRestStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DistanceFacade {
    private final OpenRouteRestStrategy orsStrategy;

    public DistanceResult calculate(DistanceRequest req) throws Exception {
        return orsStrategy.calculate(req);
    }
}
