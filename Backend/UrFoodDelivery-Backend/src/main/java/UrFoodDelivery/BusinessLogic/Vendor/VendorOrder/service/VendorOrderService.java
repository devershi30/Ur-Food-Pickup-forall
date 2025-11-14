package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.VendorOrder.service;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.Order;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.OrderStatus;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.models.OrderResponse;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.repository.OrderRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository.AccountRepository;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories.VendorRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.services.VendorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service

public class VendorOrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AccountRepository userRepository;
    @Autowired
    private VendorRepository vendorRepository;
    
    @Autowired
    private VendorService vendorService;

    /**
     * Get all active orders for a vendor (not completed or cancelled)
     */
    public List<OrderResponse> getVendorActiveOrders() {
        Vendor vendor = vendorService.currentVendor();
        
        List<OrderStatus> activeStatuses = List.of(
                OrderStatus.PENDING,
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.OUT_FOR_DELIVERY
        );

        List<Order> orders = orderRepository.findByVendorAndStatusInOrderByCreatedAtDesc(
                vendor,
                activeStatuses
        );

        log.info("Retrieved {} active orders for vendor: {}", orders.size(), vendor.getUid());
        
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all orders for a vendor with optional filtering
     */
    public List<OrderResponse> getVendorOrders( String status, String startDate, String endDate) {
        Vendor vendor = vendorService.currentVendor();
        
        List<Order> orders;
        
        if (status != null && !status.isEmpty()) {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByVendorAndStatus(vendor, orderStatus);
        } else {
            orders = orderRepository.findByVendorOrderByCreatedAtDesc(vendor);
        }

        // Optional: Filter by date range
        if (startDate != null && endDate != null) {
            ZonedDateTime start = ZonedDateTime.parse(startDate);
            ZonedDateTime end = ZonedDateTime.parse(endDate);
            orders = orders.stream()
                    .filter(o -> o.getCreatedAt().isAfter(start) && o.getCreatedAt().isBefore(end))
                    .collect(Collectors.toList());
        }

        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by specific status
     */
    public List<OrderResponse> getVendorOrdersByStatus( String status) {
        Vendor vendor = vendorService.currentVendor();
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        
        List<Order> orders = orderRepository.findByVendorAndStatus(vendor, orderStatus);
        
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get completed orders
     */
    public List<OrderResponse> getVendorCompletedOrders() {
        Vendor vendor = vendorService.currentVendor();
        
        List<OrderStatus> completedStatuses = List.of(
                OrderStatus.COMPLETED,
                OrderStatus.CANCELLED
        );

        List<Order> orders = orderRepository.findByVendorAndStatusInOrderByCreatedAtDesc(
                vendor,
                completedStatuses
        );

        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }



    /**
     * Map Order entity to OrderResponse DTO
     */
    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();

        BeanUtils.copyProperties(order,response);

        return response;
    }
}



