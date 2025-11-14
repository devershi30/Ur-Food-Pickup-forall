package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.controller;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.models.OrderRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.models.OrderResponse;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;


    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest orderRequest
           ) {
        
        OrderResponse order = orderService.createOrder(orderRequest);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders() {
        
        List<OrderResponse> orders = orderService.getUserOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable UUID orderId) {
        
        OrderResponse order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/active")
    public ResponseEntity<List<OrderResponse>> getActiveOrders() {
        
        List<OrderResponse> orders = orderService.getActiveOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/history")
    public ResponseEntity<List<OrderResponse>> getOrderHistory() {
        
        List<OrderResponse> orders = orderService.getOrderHistory();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam String status) {
        
        OrderResponse order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable UUID orderId) {
        
        orderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}