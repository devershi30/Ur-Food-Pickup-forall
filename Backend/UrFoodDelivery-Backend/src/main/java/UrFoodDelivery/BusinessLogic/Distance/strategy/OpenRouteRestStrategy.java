package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.strategy;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceResult;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OpenRouteRestStrategy implements DistanceStrategy {

    @Value("${ors.api-key}")
    private String apiKey;

    private final WebClient.Builder builder;

    @Override
    public DistanceResult calculate(DistanceRequest req) {
        String profile = switch (req.getMode().toLowerCase()) {
            case "bike" -> "cycling-regular";
            case "foot" -> "foot-walking";
            default -> "driving-car";
        };

        WebClient client = builder.baseUrl("https://api.openrouteservice.org").build();

        Map<String, Object> body = Map.of(
                "coordinates", List.of(
                        List.of(req.getFromLon(), req.getFromLat()),
                        List.of(req.getToLon(), req.getToLat())
                )
        );

        Map<?, ?> response = client.post()
                .uri("/v2/directions/" + profile)
                .header("Authorization", apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        System.out.println(response);

        // ✅ Defensive checks
        if (response == null || !response.containsKey("routes")) {
            System.out.println("Invalid ORS response — check coordinates or API key.");
            return DistanceResult.builder()
                    .distanceMeters(0)
                    .durationMinutes(0)
                    .provider("OpenRouteService REST")
//                    .error("Invalid ORS response — check coordinates or API key.")
                    .build();
        }

        List<?> routes = (List<?>) response.get("routes");
        if (routes == null || routes.isEmpty()) {
            System.out.println("No routes found between provided points.");
            return DistanceResult.builder()
                    .distanceMeters(0)
                    .durationMinutes(0)
                    .provider("OpenRouteService REST")
//                    .error("No routes found between provided points.")
                    .build();
        }

        Map<?, ?> firstRoute = (Map<?, ?>) routes.get(0);
        Map<?, ?> summary = (Map<?, ?>) firstRoute.get("summary");
        if (summary == null || !summary.containsKey("distance") || !summary.containsKey("duration")) {
            System.out.println("ORS summary missing distance or duration.");
            return DistanceResult.builder()
                    .distanceMeters(0)
                    .durationMinutes(0)
                    .provider("OpenRouteService REST")
//                    .error("ORS summary missing distance or duration.")
                    .build();
        }

//
//        List<?> routes = (List<?>) response.get("routes");
//        Map<?, ?> summary = (Map<?, ?>) ((Map<?, ?>) routes.get(0)).get("summary");

        double distance = ((Number) summary.get("distance")).doubleValue();
        double duration = ((Number) summary.get("duration")).doubleValue();

        return DistanceResult.builder()
                .distanceMeters(distance)
                .durationMinutes(duration)
                .provider("OpenRouteService REST")
                .build();
    }
}
