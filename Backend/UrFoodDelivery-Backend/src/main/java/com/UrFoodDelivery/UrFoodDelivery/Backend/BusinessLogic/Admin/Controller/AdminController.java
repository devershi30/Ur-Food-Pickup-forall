package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.controller;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils.VendorDto;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils.stats.DashboardStats;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.service.AdminService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.settings.AdminSettings;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.MyUtils;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.model.ResponseFormatWithObject;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/api/v1/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;




    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> dashBoard()
    {
        return adminService.dashBoard();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/allUsers")
    public ResponseEntity<List<Account>> allUsers()
    {
        return adminService.allUsers();
    }



    @GetMapping("/settings")
    public ResponseEntity<AdminSettings> getSettings() {
        return adminService.getSettings();
    }


    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/settings")
    public ResponseEntity<AdminSettings> updateSettings(@RequestBody @Valid AdminSettings newSettings, BindingResult bindingResult) {
        if(bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(newSettings);

        return adminService.updateSettings(newSettings);
    }

}
