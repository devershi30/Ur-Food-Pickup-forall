package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.VendorOrder.service;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.Order;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.OrderStatus;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.repository.OrderRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository.AccountRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.VendorOrder.models.VendorAnalyticsResponse;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories.VendorRepository;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.services.VendorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service

public class VendorAnalyticsService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private AccountRepository userRepository;
    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private VendorService vendorService;

    /**
     * Get comprehensive analytics for vendor
     */
    public VendorAnalyticsResponse getVendorAnalytics( String timeRange) {
        Vendor vendor = vendorService.currentVendor();
        
        ZonedDateTime startDate = calculateStartDate(timeRange);
        ZonedDateTime endDate = ZonedDateTime.now();

        // Get all orders in the time range
        List<Order> orders = orderRepository.findByVendorAndCreatedAtBetween(
                vendor,
                startDate, 
                endDate
        );

        // Calculate previous period for comparison
        ZonedDateTime previousStartDate = calculatePreviousStartDate(timeRange);
        List<Order> previousOrders = orderRepository.findByVendorAndCreatedAtBetween(
                vendor,
                previousStartDate, 
                startDate
        );

        VendorAnalyticsResponse analytics = new VendorAnalyticsResponse();

        // Calculate metrics
        calculateMetrics(analytics, orders, previousOrders);
        
        // Generate charts data
        analytics.setDailyRevenue(generateDailyRevenue(orders, timeRange));
        analytics.setTopSellingItems(getTopSellingItems(vendor.getUid(), orders));
        analytics.setOrdersByStatus(getOrdersByStatus(orders));
        analytics.setRevenueByDay(generateRevenueByDay(orders));

        return analytics;
    }

    /**
     * Calculate all metrics
     */
    private void calculateMetrics(VendorAnalyticsResponse analytics, List<Order> orders, List<Order> previousOrders) {
        // Total Revenue
        double totalRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotal)
                .reduce(0.0,Double::sum);
        analytics.setTotalRevenue(totalRevenue);

        // Previous Revenue for growth calculation
        double previousRevenue = previousOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotal)
                .reduce(0.0,Double::sum);

        // Total Orders
        int totalOrders = (int) orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();
        analytics.setTotalOrders(totalOrders);

        int previousTotalOrders = (int) previousOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        // Average Order Value
        double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        analytics.setAverageOrderValue(avgOrderValue);

        // Total Customers (unique)
        int totalCustomers = (int) orders.stream()
                .map(o -> o.getStudent().getUid())
                .distinct()
                .count();
        analytics.setTotalCustomers(totalCustomers);

        // Completion Rate
        long completedOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();
        long allOrders = orders.size();
        double completionRate = allOrders > 0 ? (completedOrders * 100.0) / allOrders : 0;
        analytics.setCompletionRate(completionRate);

        // Average Rating (mock - would come from a ratings table)
        analytics.setAverageRating(4.7);

        // Pending Orders (current)
        long pendingOrders = orderRepository.countByVendorAndStatus(
                orders.get(0).getVendor(),
                OrderStatus.PENDING
        );
        analytics.setPendingOrders((int) pendingOrders);

        // Growth calculations
        double revenueGrowth = calculateGrowth( BigDecimal.valueOf(totalRevenue),  BigDecimal.valueOf(previousRevenue));
        analytics.setRevenueGrowth(revenueGrowth);

        double orderGrowth = calculateGrowth(
                BigDecimal.valueOf(totalOrders), 
                BigDecimal.valueOf(previousTotalOrders)
        );
        analytics.setOrderGrowth(orderGrowth);
    }

    /**
     * Calculate growth percentage
     */
    private double calculateGrowth(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    /**
     * Generate daily revenue data
     */
    private List<VendorAnalyticsResponse.DailyRevenueData> generateDailyRevenue(List<Order> orders, String timeRange) {
        Map<LocalDate, VendorAnalyticsResponse.DailyRevenueData> revenueMap = new LinkedHashMap<>();

        // Initialize all dates with zero values
        LocalDate startDate = LocalDate.now().minusDays(timeRange.equals("week") ? 6 : 29);
        for (int i = 0; i <= (timeRange.equals("week") ? 6 : 29); i++) {
            LocalDate date = startDate.plusDays(i);
            VendorAnalyticsResponse.DailyRevenueData data = new VendorAnalyticsResponse.DailyRevenueData();
            data.setDate(date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            data.setRevenue(0.0);
            data.setOrders(0);
            revenueMap.put(date, data);
        }

        // Fill in actual data
        orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .forEach(order -> {
                    LocalDate orderDate = order.getCreatedAt().toLocalDate();
                    if (revenueMap.containsKey(orderDate)) {
                        VendorAnalyticsResponse.DailyRevenueData data = revenueMap.get(orderDate);
                        data.setRevenue(data.getRevenue() + order.getTotal());
                        data.setOrders(data.getOrders() + 1);
                    }
                });

        return new ArrayList<>(revenueMap.values());
    }

    /**
     * Get top selling items
     */
    private List<VendorAnalyticsResponse.TopSellingItem> getTopSellingItems(UUID vendorId, List<Order> orders) {
        Map<String, VendorAnalyticsResponse.TopSellingItem> itemsMap = new HashMap<>();

        orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .flatMap(o -> o.getOrderItems().stream())
                .forEach(item -> {
                    String itemName = item.getMenuFood().getName();
                    VendorAnalyticsResponse.TopSellingItem topItem = itemsMap.getOrDefault(
                            itemName,
                            new VendorAnalyticsResponse.TopSellingItem(itemName, 0, 0.0)
                    );
                    
                    topItem.setOrders(topItem.getOrders() + item.getQuantity());
                    topItem.setRevenue(topItem.getRevenue() + 
                            item.getPrice()*((item.getQuantity())));

                    
                    itemsMap.put(itemName, topItem);
                });

        return itemsMap.values().stream()
                .sorted((a, b) -> Integer.compare(b.getOrders(), a.getOrders()))
                .limit(5)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by status distribution
     */
    private List<VendorAnalyticsResponse.StatusDistribution> getOrdersByStatus(List<Order> orders) {
        Map<OrderStatus, Long> statusCount = orders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));

        return statusCount.entrySet().stream()
                .map(entry -> new VendorAnalyticsResponse.StatusDistribution(
                        entry.getKey().name(),
                        entry.getValue().intValue()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Generate revenue by day of week
     */
    private List<VendorAnalyticsResponse.RevenueByDay> generateRevenueByDay(List<Order> orders) {
        Map<DayOfWeek, Double> revenueByDay = new EnumMap<>(DayOfWeek.class);

        // Initialize all days
        for (DayOfWeek day : DayOfWeek.values()) {
            revenueByDay.put(day, 0.0);
        }

        // Calculate revenue
        orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .forEach(order -> {
                    DayOfWeek day = order.getCreatedAt().getDayOfWeek();
                    revenueByDay.put(day, 
                            revenueByDay.get(day) + order.getTotal()
                    );
                });

        return revenueByDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new VendorAnalyticsResponse.RevenueByDay(
                        entry.getKey().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        entry.getValue()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Get dashboard statistics
     */
    public VendorAnalyticsResponse.DashboardStats getDashboardStats() {
        Vendor vendor = vendorService.currentVendor();
        
        ZonedDateTime today = ZonedDateTime.now().with(LocalDate.now().atStartOfDay());
        
        VendorAnalyticsResponse.DashboardStats stats = new VendorAnalyticsResponse.DashboardStats();
        
        // Today's orders
        stats.setTodayOrders(orderRepository.countByVendorAndCreatedAtBetween(
                vendor,
                today, 
                ZonedDateTime.now()
        ).intValue());
        
        // Pending orders
        stats.setPendingOrders(Math.toIntExact(orderRepository.countByVendorAndStatus(
                vendor,
                OrderStatus.PENDING
        )));
        
        // This week's revenue
        ZonedDateTime weekStart = ZonedDateTime.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<Order> weekOrders = orderRepository.findByVendorAndCreatedAtBetween(
                vendor,
                weekStart, 
                ZonedDateTime.now()
        );
        
        double weekRevenue = weekOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotal)
                .reduce(0.0, Double::sum);
        
        stats.setWeekRevenue(weekRevenue);
        
        return stats;
    }

    /**
     * Get top selling items with limit
     */
    public List<VendorAnalyticsResponse.TopSellingItem> getTopSellingItems( int limit) {
        Vendor vendor = vendorService.currentVendor();
        
        ZonedDateTime startDate = ZonedDateTime.now().minusDays(30);
        List<Order> orders = orderRepository.findByVendorAndCreatedAtBetween(
                vendor,
                startDate, 
                ZonedDateTime.now()
        );
        
        return getTopSellingItems(vendor.getUid(), orders).stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get revenue by period
     */
    public List<VendorAnalyticsResponse.RevenueData> getRevenueByPeriod( String period) {
        Vendor vendor = vendorService.currentVendor();
        
        ZonedDateTime startDate = calculateStartDate(period);
        List<Order> orders = orderRepository.findByVendorAndCreatedAtBetween(
                vendor,
                startDate, 
                ZonedDateTime.now()
        );
        
        return generateDailyRevenue(orders, period).stream()
                .map(data -> new VendorAnalyticsResponse.RevenueData(
                        data.getDate(),
                        data.getRevenue()
                ))
                .collect(Collectors.toList());
    }



    private ZonedDateTime calculateStartDate(String timeRange) {
        switch (timeRange.toLowerCase()) {
            case "week":
                return ZonedDateTime.now().minusDays(7);
            case "month":
                return ZonedDateTime.now().minusDays(30);
            case "year":
                return ZonedDateTime.now().minusDays(365);
            default:
                return ZonedDateTime.now().minusDays(7);
        }
    }

    private ZonedDateTime calculatePreviousStartDate(String timeRange) {
        switch (timeRange.toLowerCase()) {
            case "week":
                return ZonedDateTime.now().minusDays(14);
            case "month":
                return ZonedDateTime.now().minusDays(60);
            case "year":
                return ZonedDateTime.now().minusDays(730);
            default:
                return ZonedDateTime.now().minusDays(14);
        }
    }
}