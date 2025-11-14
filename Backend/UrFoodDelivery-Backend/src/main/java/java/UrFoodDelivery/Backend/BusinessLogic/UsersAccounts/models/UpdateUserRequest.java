package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    @NotBlank(message = "Name is required")
    private String name; // New field: User's full name

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

}