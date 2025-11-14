package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.WebSocket.service;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.WebSocket.entity.OrderStatusUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendOrderStatusUpdate(UUID userId, UUID orderId, String status) {
        OrderStatusUpdate update = new OrderStatusUpdate();
        update.setOrderId(orderId);
        update.setStatus(status);
        update.setTimestamp(System.currentTimeMillis());

        String destination = "/topic/orders/" + userId;
        messagingTemplate.convertAndSend(destination, update);

        log.info("Sent order status update to user {}: Order {} - {}", userId, orderId, status);
    }

    public void sendOrderNotification(UUID vendorId, String message) {
        String destination = "/topic/vendor/" + vendorId;
        messagingTemplate.convertAndSend(destination, message);

        log.info("Sent notification to vendor {}: {}", vendorId, message);
    }
}