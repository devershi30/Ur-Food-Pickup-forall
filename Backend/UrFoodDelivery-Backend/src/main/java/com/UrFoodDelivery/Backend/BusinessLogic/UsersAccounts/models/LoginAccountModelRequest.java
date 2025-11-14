package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.models;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginAccountModelRequest
{

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}