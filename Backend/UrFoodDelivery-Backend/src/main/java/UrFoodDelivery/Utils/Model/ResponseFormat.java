package com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class ResponseFormat {
    private String error;
    private String message;

    private UUID id;
}
