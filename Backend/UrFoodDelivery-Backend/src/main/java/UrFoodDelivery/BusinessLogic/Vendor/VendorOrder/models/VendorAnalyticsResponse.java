package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.VendorOrder.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorAnalyticsResponse {
    
    // Key Metrics
    private Double totalRevenue;
    private Integer totalOrders;
    private Double averageOrderValue;
    private Integer totalCustomers;
    private Double completionRate;
    private Double averageRating;
    private Integer pendingOrders;
    private Double revenueGrowth;
    private Double orderGrowth;
    
    // Charts Data
    private List<DailyRevenueData> dailyRevenue;
    private List<TopSellingItem> topSellingItems;
    private List<StatusDistribution> ordersByStatus;
    private List<RevenueByDay> revenueByDay;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenueData {
        private String date;
        private Double revenue;
        private Integer orders;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingItem {
        private String name;
        private Integer orders;
        private Double revenue;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusDistribution {
        private String status;
        private Integer count;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByDay {
        private String day;
        private Double amount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueData {
        private String period;
        private Double amount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private Integer todayOrders;
        private Integer pendingOrders;
        private Double weekRevenue;
        private Integer activeOrders;
    }
}