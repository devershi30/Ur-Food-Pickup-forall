package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.service;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils.VendorDto;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils.stats.DashboardStats;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.settings.AdminSettings;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.settings.AdminSettingsRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Order.repository.OrderRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository.AccountRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories.VendorRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private VendorRepository vendorRepo;

    @Autowired
    private AccountRepository userRepo;

    @Autowired
    private OrderRepository orderRepository;


    @Autowired
    private AdminSettingsRepository adminSettingsRepository;



    public List<Account> listUsers() { return userRepo.findAll(); }


    public ResponseEntity<DashboardStats> dashBoard() {

        DashboardStats dashboardStats = new DashboardStats();
        dashboardStats.setTotalUsers((int) userRepo.count());
        dashboardStats.setTotalVendors((int) vendorRepo.count());
        dashboardStats.setTotalOrders((int) orderRepository.count());

        return ResponseEntity.ok(dashboardStats);
    }

    public ResponseEntity<List<Account>> allUsers() {
        List<Account> allUsers = userRepo.findAllByOrderByCreatedOnDesc();
        return ResponseEntity.ok(allUsers);
    }

    public ResponseEntity<AdminSettings> getSettings() {
        AdminSettings settings = getAdminSettings();
        return ResponseEntity.ok(settings);
    }

    public AdminSettings getAdminSettings() {
        AdminSettings settings = adminSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    AdminSettings def = new AdminSettings(null, 30, 30.0, false);
                    adminSettingsRepository.save(def);
                    return def;
                });
        return settings;
    }


    public ResponseEntity<AdminSettings> updateSettings(@Valid AdminSettings newSettings) {
        AdminSettings settings = adminSettingsRepository.findAll().stream().findFirst()
                .orElse(new AdminSettings());
        settings.setOrderTimeout(newSettings.getOrderTimeout());
        settings.setDefaultRadius(newSettings.getDefaultRadius());
        settings.setAutoApproveVendors(newSettings.isAutoApproveVendors());
        adminSettingsRepository.saveAndFlush(settings);
        return ResponseEntity.ok(settings);
    }
}
