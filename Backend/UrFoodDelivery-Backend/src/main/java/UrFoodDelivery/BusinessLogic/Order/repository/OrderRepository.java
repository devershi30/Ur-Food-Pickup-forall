package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.repository;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.Order;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity.enums.OrderStatus;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByStudentUidOrderByCreatedAtDesc(UUID userId);
    List<Order> findByStudentUidAndStatusInOrderByCreatedAtDesc(UUID userId, List<OrderStatus> statuses);

    List<Order> findByVendorAndStatusInOrderByCreatedAtDesc(Vendor vendor, List<OrderStatus> activeStatuses);

    List<Order> findByVendorAndStatus(Vendor vendor, OrderStatus orderStatus);

    List<Order> findByVendorOrderByCreatedAtDesc(Vendor vendor);

    List<Order> findByVendorAndCreatedAtBetween(Vendor vendor, ZonedDateTime startDate, ZonedDateTime endDate);

    long countByVendorAndStatus(Vendor vendor, OrderStatus orderStatus);

    Number countByVendorAndCreatedAtBetween(Vendor vendor, ZonedDateTime today, ZonedDateTime now);



//    List<Order> findByVendorIdOrderByCreatedAtDesc(UUID vendorId);
}