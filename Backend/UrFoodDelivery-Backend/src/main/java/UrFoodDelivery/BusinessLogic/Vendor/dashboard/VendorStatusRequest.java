package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.dashboard;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorStatusRequest {
    @NotNull(message = "Status is required")
    private Boolean isOpen;

}
