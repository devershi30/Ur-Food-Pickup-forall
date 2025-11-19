package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.WebSocket.entity;

import lombok.Data;

import java.util.UUID;

@Data
public class OrderStatusUpdate {
    private UUID orderId;
    private String status;
    private Long timestamp;
}