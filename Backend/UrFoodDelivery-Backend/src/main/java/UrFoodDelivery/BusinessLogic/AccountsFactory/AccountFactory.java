package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.AccountsFactory;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.AccountRole;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.models.RegisterAccountModelRequest;
import lombok.experimental.UtilityClass;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;

@Component
public class AccountFactory {

    @Autowired
    private PasswordEncoder encoder;

    public Account createAdmin(RegisterAccountModelRequest request) {
        Account account = createAccount(request, AccountRole.ROLE_ADMIN);
        return account;
    }

    public Account createVendor(RegisterAccountModelRequest request) {
        Account account = createAccount(request, AccountRole.ROLE_VENDOR);
        return account;
    }

    public Account createStudent(RegisterAccountModelRequest request) {
        Account account = createAccount(request, AccountRole.ROLE_STUDENT);
        return account;
    }

    public Account createAccount(RegisterAccountModelRequest registerAccountModel,AccountRole accountRole)
    {
        return Account.builder()
                .username(registerAccountModel.getUsername().trim())
                .name(registerAccountModel.getName()) // Set the name
                .email(registerAccountModel.getEmail())
                .password(encoder.encode(registerAccountModel.getPassword())) // Encrypt password
                .role(accountRole)
                .approved(false) // Default approval status
                .appliedAsVendor(false)
                .addedOn(ZonedDateTime.now()) // Set current time for addedOn
                .createdOn(ZonedDateTime.now()) // Set current time for cratedOn
                .build();
    }

}
