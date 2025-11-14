package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils;
import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor
public class MenuItemDto {
    private Long id;
    private String name;
    private String description;
    private Long priceCents;
    private Boolean available;
}
