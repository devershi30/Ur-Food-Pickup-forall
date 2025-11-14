package com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder


public class ResponseFormatWithObject {
    private String error;
    private String message;

    private Object data;
}
