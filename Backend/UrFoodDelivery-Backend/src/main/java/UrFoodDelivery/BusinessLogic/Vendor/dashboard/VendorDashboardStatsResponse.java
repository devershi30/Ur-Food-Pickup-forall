package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.dashboard;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorDashboardStatsResponse {
    private Integer todayOrders;
    private Double todayRevenue;
    private Integer activeOrders;
    private Double todayGrowth;
    private Double revenueGrowth;
}