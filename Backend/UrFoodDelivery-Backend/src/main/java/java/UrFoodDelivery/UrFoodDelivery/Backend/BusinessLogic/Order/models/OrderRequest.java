package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.models;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.Utils.Location;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OrderRequest {
    
    @NotBlank(message = "Order type is required")
    private String orderType; // PICKUP or DELIVERY
    
    private Location deliveryLocation;
    
    private String specialInstructions;
    
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemRequest> items;
    
    @Data
    public static class OrderItemRequest {
        @NotNull(message = "Food item ID is required")
        private UUID foodItemId;
        
        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;
        
        @NotNull(message = "Price is required")
        private BigDecimal price;
    }
}





