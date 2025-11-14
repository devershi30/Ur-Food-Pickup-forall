package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vendorDash")
@RequiredArgsConstructor
public class VendorDashboardController {

    private final VendorDashboardService vendorDashboardService;

    /**
     * Fetch dashboard statistics for the logged-in vendor
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<VendorDashboardStatsResponse> getDashboardStats() {
        VendorDashboardStatsResponse stats = vendorDashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get current vendor open/closed status
     */
    @GetMapping("/status")
    public ResponseEntity<VendorStatusResponse> getVendorStatus() {
        VendorStatusResponse status = vendorDashboardService.getVendorStatus(null);
        return ResponseEntity.ok(status);
    }

    /**
     * Update vendor open/closed status
     */
    @PutMapping("/status")
    public ResponseEntity<VendorStatusResponse> updateVendorStatus(@RequestBody VendorStatusRequest request) {
        VendorStatusResponse response = vendorDashboardService.updateVendorStatus(null, request.getIsOpen());
        return ResponseEntity.ok(response);
    }
}
