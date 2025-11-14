package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.VendorOrder.controller;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.models.OrderResponse;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.VendorOrder.models.VendorAnalyticsResponse;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.VendorOrder.service.VendorAnalyticsService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.VendorOrder.service.VendorOrderService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.dashboard.VendorDashboardService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.dashboard.VendorDashboardStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vendorOrder")

@CrossOrigin(origins = "*")
public class VendorOrderController {

    @Autowired
    private VendorOrderService vendorOrderService;

    @Autowired
    private VendorAnalyticsService vendorAnalyticsService;

    @Autowired
    private VendorDashboardService vendorDashboardService;

    /**
     * Get all active orders for the vendor
     */
    @GetMapping("/orders/active")
    public ResponseEntity<List<OrderResponse>> getActiveOrders(
            ) {
        
        List<OrderResponse> orders = vendorOrderService.getVendorActiveOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Get all orders (including completed) for the vendor
     */
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        List<OrderResponse> orders = vendorOrderService.getVendorOrders(
                status, 
                startDate, 
                endDate
        );
        return ResponseEntity.ok(orders);
    }

    /**
     * Get orders by status
     */
    @GetMapping("/orders/by-status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(
            @PathVariable String status
            ) {
        
        List<OrderResponse> orders = vendorOrderService.getVendorOrdersByStatus(
                status
        );
        return ResponseEntity.ok(orders);
    }

    /**
     * Get completed orders
     */
    @GetMapping("/orders/completed")
    public ResponseEntity<List<OrderResponse>> getCompletedOrders(
            ) {
        
        List<OrderResponse> orders = vendorOrderService.getVendorCompletedOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Get analytics data
     */
    @GetMapping("/analytics")
    public ResponseEntity<VendorAnalyticsResponse> getAnalytics(
            
            @RequestParam(required = false, defaultValue = "week") String timeRange) {
        
        VendorAnalyticsResponse analytics = vendorAnalyticsService.getVendorAnalytics(
                 
                timeRange
        );
        return ResponseEntity.ok(analytics);
    }


}