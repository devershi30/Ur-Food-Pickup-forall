package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.services;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils.MenuItemDto;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils.VendorProfileDto;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.service.AdminService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.settings.AdminSettings;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.Utils.DistanceFacade;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Distance.models.DistanceResult;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Service.AccountService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.MenuItem;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.model.UpdateVendorRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories.MenuItemRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories.VendorRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.entity.VendorLocation;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.repository.VendorLocationRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.model.ResponseFormatWithObject;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VendorService {


    @Autowired
    private VendorRepository vendorRepository;


    @Autowired
    private AccountService accountService;


    @Autowired
    private VendorLocationRepository vendorLocationRepository;

    @Autowired
    private AdminService adminService;


    @Autowired
    private DistanceFacade distanceFacade;



    public Vendor currentVendor()
    {
        Account account = accountService.currentAccount();
        if(account.getAppliedAsVendor()&&account.isApproved())
        {
            Optional<Vendor> optionalVendor = vendorRepository.findByVendorAccount(account);
            if(optionalVendor.isPresent())
                return optionalVendor.get();
        }
        throw new AuthorizationDeniedException("Unable to Retireve Current Vendor");
    }


    public ResponseEntity<List<Vendor>> listVendors() {
        List<Vendor> all = vendorRepository.findAll();

        return ResponseEntity.ok(all);
    }

    public ResponseEntity<List<Vendor>> listActiveVendors() {
        List<Vendor> all = vendorRepository.findByActiveTrue();

        return ResponseEntity.ok(all);
    }

    public ResponseEntity<Vendor> profile() {
        Vendor vendor = currentVendor();
        return ResponseEntity.ok(vendor);
    }

    public ResponseEntity<Vendor> viewVendor(UUID vendorId) {
        Optional<Vendor> optionalVendor = vendorRepository.findById(vendorId);
        if(optionalVendor.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        Vendor vendor = optionalVendor.get();
        return ResponseEntity.ok(vendor);
    }

    public ResponseEntity<ResponseFormatWithObject> update(@Valid UpdateVendorRequest updateVendorRequest) {
        Vendor vendor = currentVendor();
        VendorLocation vendorLocation = vendor.getVendorLocation();

        BeanUtils.copyProperties(updateVendorRequest,vendorLocation);

        vendorLocationRepository.saveAndFlush(vendorLocation);


        return ResponseEntity.ok(ResponseFormatWithObject.builder()
                        .message("Updated Successfully")
                .build());
    }

    public ResponseEntity<List<Vendor>> listActiveVendorsClose(double longitude, double latitude) {
        List<Vendor> all = vendorRepository.findByActiveTrue();

        //calculate distances
        for(Vendor vendor:all)
        {
            try {
                DistanceResult distanceResult = distanceFacade.calculate(
                        DistanceRequest
                                .builder()
                                .fromLat(latitude)
                                .fromLon(longitude)
                                .toLat(vendor.getVendorLocation().getLatitude())
                                .toLon(vendor.getVendorLocation().getLongitude())
                                .mode("car")
                                .build()
            );
                vendor.setDistance(distanceResult.getDistanceMeters());
                vendor.setDeliveryTime(distanceResult.getDurationMinutes());
            }catch (Exception es)
            {
                es.printStackTrace();
            }

        }

        AdminSettings adminSettings = adminService.getAdminSettings();

        List<Vendor> close = new LinkedList<>();
        for(Vendor vendor:all)
            if(vendor.getDistance()<=adminSettings.getDefaultRadius()*1000)
                close.add(vendor);

        return ResponseEntity.ok(close);
    }
}
