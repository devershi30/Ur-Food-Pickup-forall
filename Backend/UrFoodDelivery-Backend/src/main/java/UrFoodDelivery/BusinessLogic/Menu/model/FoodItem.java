package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class FoodItem {

    @NotNull
    @NotEmpty
    @NotBlank
    private String name;

    private String description;

    private double price;

    private String category;

    private boolean available;
}
