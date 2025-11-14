package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.dashboard;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorStatusResponse {
    private Boolean isOpen;
    private Long vendorId;
    private UUID vendorUid;
    private String message;
    
    // Constructor for simple response
    public VendorStatusResponse(Boolean isOpen) {
        this.isOpen = isOpen;
    }
}