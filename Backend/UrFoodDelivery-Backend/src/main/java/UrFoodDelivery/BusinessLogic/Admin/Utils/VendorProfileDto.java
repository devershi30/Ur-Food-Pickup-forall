package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils;
import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor
public class VendorProfileDto {
    private Long id;
    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    private Boolean active;
}
