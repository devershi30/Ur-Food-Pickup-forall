package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.WebSocket.controller;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.WebSocket.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ws")
@RequiredArgsConstructor
public class WebSocketController {

    private final WebSocketService webSocketService;

    @PostMapping("/order-update")
    public String sendOrderStatus(
            @RequestParam UUID userId,
            @RequestParam UUID orderId,
            @RequestParam String status) {

        webSocketService.sendOrderStatusUpdate(userId, orderId, status);
        return "Sent " + status + " for order " + orderId;
    }
}
