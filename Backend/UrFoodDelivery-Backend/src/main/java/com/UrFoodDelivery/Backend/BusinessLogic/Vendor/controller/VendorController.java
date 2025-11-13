package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.controller;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils.MenuItemDto;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Admin.Utils.VendorProfileDto;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.application.VendorApplication;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.application.VendorApplicationRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.application.VendorApplicationService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.model.UpdateVendorRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.services.VendorService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vendor")
public class VendorController {


    @Autowired
    private VendorService vendorService;

    @Autowired
    private VendorApplicationService vendorApplicationService;


    @GetMapping("/profile")
    public ResponseEntity<Vendor> profile()
    {
        return vendorService.profile();
    }

    @GetMapping("/viewVendor/{vendorId}")
    public ResponseEntity<Vendor> viewVendor(@PathVariable("vendorId") UUID vendorId)
    {
        return vendorService.viewVendor(vendorId);
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseFormatWithObject> update(@RequestBody @Valid UpdateVendorRequest updateVendorRequest,BindingResult bindingResult)
    {
        if(bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseFormatWithObject.builder().error(MyUtils.createErrorMessage(bindingResult)).build());
        return vendorService.update(updateVendorRequest);
    }



    @PostMapping("/applyAsVendor")
    public ResponseEntity<ResponseFormatWithObject> applyAsVendor(@RequestBody @Valid VendorApplicationRequest vendorApplicationRequest, BindingResult bindingResult)
    {
        if(bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseFormatWithObject.builder().error(MyUtils.createErrorMessage(bindingResult)).build());
        return vendorApplicationService.applyAsVendor(vendorApplicationRequest);
    }


    @GetMapping("/listMyApplications")
    public ResponseEntity<List<VendorApplication>> listMyApplications()
    {
        return vendorApplicationService.listMyApplications();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/listAllApplications")
    public ResponseEntity<List<VendorApplication>> listAllApplications()
    {
        return vendorApplicationService.listAllApplications();
    }


    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/listPendingApplications")
    public ResponseEntity<List<VendorApplication>> listPendingApplications()
    {
        return vendorApplicationService.listPendingApplications();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/approveApplication/{applicationId}")
    public ResponseEntity<ResponseFormatWithObject> approveApplication(@PathVariable("applicationId")UUID applicationId)
    {
        return vendorApplicationService.approveApplication(applicationId);
    }



    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/rejectApplication/{applicationId}")
    public ResponseEntity<ResponseFormatWithObject> rejectApplication(@PathVariable("applicationId")UUID applicationId)
    {
        return vendorApplicationService.rejectApplication(applicationId);
    }



    @GetMapping("/listVendors")
    public ResponseEntity<List<Vendor>> listVendors()
    {
        return vendorService.listVendors();
    }


    @GetMapping("/listActiveVendors")
    public ResponseEntity<List<Vendor>> listActiveVendors()
    {
        return vendorService.listActiveVendors();
    }



    @GetMapping("/listActiveVendorsClose")
    public ResponseEntity<List<Vendor>> listActiveVendorsClose(@RequestParam("lng") double longitude,@RequestParam("lat") double latitude)
    {
        return vendorService.listActiveVendorsClose(longitude,latitude);
    }


//    @GetMapping("/view/{vendorId}")
//    public ResponseEntity<Vendor> viewVendor(@PathVariable("vendorId") UUID vendorId)
//    {
//        return vendorService.viewVendor(vendorId);
//    }







}
