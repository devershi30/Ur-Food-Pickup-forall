package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.entity;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.entity.MenuFood;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.model.FoodItem;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID uid;

    @JsonIgnore
    @ManyToOne
    private Order order;

    @ManyToOne
    private MenuFood menuFood;

    private int quantity;

    private double price;


}
