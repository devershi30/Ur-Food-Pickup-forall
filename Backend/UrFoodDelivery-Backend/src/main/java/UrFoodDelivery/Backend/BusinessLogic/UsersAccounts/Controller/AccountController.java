package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Controller;



import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Service.AccountService;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.models.*;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseModel> register(@RequestBody RegisterAccountModelRequest registerUserModelRequest) {
        return accountService.registerAccount(registerUserModelRequest,false);
    }

    @PostMapping("/registerVendor")
    public ResponseEntity<RegisterResponseModel> registerVendor(@RequestBody RegisterAccountModelRequest registerUserModelRequest) {
        return accountService.registerAccount(registerUserModelRequest,true);
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponseModel> login(@RequestBody LoginAccountModelRequest loginUserModelRequest) {
        return accountService.loginAccount(loginUserModelRequest);
    }


    @GetMapping("/logout")
    public ResponseEntity<String> logOut(HttpServletRequest httpServletRequest){
        return accountService.logOut(httpServletRequest);
    }


    @GetMapping("/checkUser")
    public ResponseEntity<Account> checkUser()
    {
        return accountService.checkuser();
    }




    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody UpdateAccountRequest updateUserRequest)
    {
        return accountService.update(updateUserRequest);
    }

    @PutMapping("/changePassword")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest)
    {
        return accountService.changePassword(changePasswordRequest);
    }

}