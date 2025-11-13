package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils;
import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor
public class VendorDto {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
}
