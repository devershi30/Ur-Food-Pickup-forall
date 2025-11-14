package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.dashboard;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.Order;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.OrderStatus;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.repository.OrderRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository.AccountRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories.VendorRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.services.VendorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Slf4j
@Service

public class VendorDashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AccountRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;


    @Autowired
    private VendorService vendorService;

    /**
     * Get comprehensive dashboard statistics
     */
    public VendorDashboardStatsResponse getDashboardStats() {
        Vendor vendor = vendorService.currentVendor();

        ZonedDateTime todayStart = ZonedDateTime.now().with(LocalDate.now().atStartOfDay());
        ZonedDateTime todayEnd = ZonedDateTime.now();
        ZonedDateTime yesterdayStart = todayStart.minusDays(1);
        ZonedDateTime yesterdayEnd = todayStart;

        // Today's orders
        List<Order> todayOrders = orderRepository.findByVendorAndCreatedAtBetween(
                vendor,
                todayStart,
                todayEnd
        );

        // Yesterday's orders for comparison
        List<Order> yesterdayOrders = orderRepository.findByVendorAndCreatedAtBetween(
                vendor,
                yesterdayStart,
                yesterdayEnd
        );

        // Calculate today's completed orders
        long todayCompletedCount = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        // Calculate yesterday's completed orders
        long yesterdayCompletedCount = yesterdayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        // Today's revenue
        double todayRevenue = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotal)
                .reduce(0.0, Double::sum);

        // Yesterday's revenue
        double yesterdayRevenue = yesterdayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotal)
                .reduce(0.0, Double::sum);

        // Active orders (not completed or cancelled)
        List<OrderStatus> activeStatuses = List.of(
                OrderStatus.PENDING,
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.OUT_FOR_DELIVERY
        );

        long activeOrdersCount = orderRepository.findByVendorAndStatusInOrderByCreatedAtDesc(
                vendor,
                activeStatuses
        ).size();

        // Calculate growth percentages
        double todayGrowth = calculateGrowthPercentage(todayCompletedCount, yesterdayCompletedCount);
        double revenueGrowth = calculateGrowthPercentage(
                todayRevenue,
                yesterdayRevenue
        );

        // Build response
        VendorDashboardStatsResponse stats = new VendorDashboardStatsResponse();
        stats.setTodayOrders((int) todayCompletedCount);
        stats.setTodayRevenue(todayRevenue);
        stats.setActiveOrders((int) activeOrdersCount);
        stats.setTodayGrowth(todayGrowth);
        stats.setRevenueGrowth(revenueGrowth);

        log.info("Dashboard stats for vendor {}: Today Orders={}, Today Revenue={}, Active Orders={}",
                vendor.getUid(), todayCompletedCount, todayRevenue, activeOrdersCount);

        return stats;
    }



    /**
     * Update vendor status (open/closed)
     */
    @Transactional
    public VendorStatusResponse updateVendorStatus(String username, boolean isOpen) {
        Vendor vendor = vendorService.currentVendor();

        vendor.setActive(isOpen);
        vendorRepository.save(vendor);

        log.info("Vendor {} status updated to: {}", vendor.getUid(), isOpen ? "OPEN" : "CLOSED");

        VendorStatusResponse response = new VendorStatusResponse();
        response.setIsOpen(isOpen);
        response.setVendorUid(vendor.getUid());
        response.setMessage("Restaurant status updated successfully");

        return response;
    }

    /**
     * Calculate growth percentage
     */
    private double calculateGrowthPercentage(double current, double previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((current - previous) / previous) * 100.0;
    }

    /**
     * Calculate growth percentage for long values
     */
    private double calculateGrowthPercentage(long current, long previous) {
        return calculateGrowthPercentage((double) current, (double) previous);
    }


    /**
     * Get vendor status
     */
    public VendorStatusResponse getVendorStatus(String username) {
        Vendor vendor = vendorService.currentVendor();

        VendorStatusResponse response = new VendorStatusResponse();
        response.setIsOpen(vendor.isActive());

        response.setVendorUid(vendor.getUid());

        return response;
    }



}


