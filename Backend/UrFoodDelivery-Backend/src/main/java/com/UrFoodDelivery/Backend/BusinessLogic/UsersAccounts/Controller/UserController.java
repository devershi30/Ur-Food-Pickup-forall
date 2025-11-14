package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Controller;


import com.medicheck.BusinessLogic.DoctorApplications.entity.DoctorApplication;
import com.medicheck.BusinessLogic.DoctorApplications.service.DoctorsApplicationService;
import com.medicheck.BusinessLogic.Users.Entity.User;
import com.medicheck.BusinessLogic.Users.Service.UserService;
import com.medicheck.BusinessLogic.Users.models.*;
import com.medicheck.Utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseModel> register(@RequestBody RegisterUserModelRequest registerUserModelRequest) {
        return userService.registerUser(registerUserModelRequest);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseModel> login(@RequestBody LoginUserModelRequest loginUserModelRequest) {
        return userService.loginUser(loginUserModelRequest);
    }


    @GetMapping("/logout")
    public ResponseEntity<String> logOut(HttpServletRequest httpServletRequest){
        return userService.logOut(httpServletRequest);
    }


    @GetMapping("/checkUser")
    public ResponseEntity<User> checkUser()
    {
        return userService.checkuser();
    }




    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody UpdateUserRequest updateUserRequest)
    {
        return userService.update(updateUserRequest);
    }

    @PutMapping("/changePassword")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest)
    {
        return userService.changePassword(changePasswordRequest);
    }

    @PostMapping("/applyAsDoctor")
    public ResponseEntity<String> applyAsDoctor(@Valid @RequestBody DoctorApplicationRequest doctorApplicationRequest)
    {
        return doctorsApplicationService.applyAsDoctor(doctorApplicationRequest);
    }

    @GetMapping("/myApplications")
    public ResponseEntity<List<DoctorApplication>> myApplications()
    {
        return doctorsApplicationService.myApplications();
    }










}