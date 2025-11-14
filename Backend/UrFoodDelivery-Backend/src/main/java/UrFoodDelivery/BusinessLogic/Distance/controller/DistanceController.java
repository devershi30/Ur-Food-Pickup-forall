package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.controller;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.Utils.DistanceFacade;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceResult;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/distance")
@RequiredArgsConstructor
public class DistanceController {

    private final DistanceFacade facade;

    @GetMapping
    public DistanceResult getDistance(
            @RequestParam double fromLat,
            @RequestParam double fromLon,
            @RequestParam double toLat,
            @RequestParam double toLon,
            @RequestParam(defaultValue = "car") String mode) throws Exception {

        DistanceRequest req = DistanceRequest.builder()
                .fromLat(fromLat)
                .fromLon(fromLon)
                .toLat(toLat)
                .toLon(toLon)
                .mode(mode)
                .build();

        return facade.calculate(req);
    }
}
