package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.model;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NewMenuRequest {

    @NotNull
    @NotEmpty
    @NotBlank
    private String title;

}
