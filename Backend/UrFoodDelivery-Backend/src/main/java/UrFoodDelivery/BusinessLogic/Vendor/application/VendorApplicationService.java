package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.application;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.AccountRole;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository.AccountRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Service.AccountService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories.VendorRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.entity.VendorLocation;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.repository.VendorLocationRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.model.ResponseFormatWithObject;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VendorApplicationService {

    @Autowired
    private VendorApplicationRepository vendorApplicationRepository;

    @Autowired
    private VendorLocationRepository vendorLocationRepository;


    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountRepository accountRepository;


    @Autowired
    private VendorRepository vendorRepository;

    public ResponseEntity<ResponseFormatWithObject> applyAsVendor(@Valid VendorApplicationRequest vendorApplicationRequest) {

        Account currUser = accountService.currentAccount();

        if(currUser.getAppliedAsVendor()&& currUser.isApproved())
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ResponseFormatWithObject.builder()
                            .error("Already A vendor")
                    .build());

        VendorApplication vendorApplication = new VendorApplication();

        vendorApplication.setVendorAccount(currUser);
        vendorApplication.setApplicationStatus(ApplicationStatus.PENDING);

        VendorLocation vendorLocation = new VendorLocation();
        BeanUtils.copyProperties(vendorApplicationRequest,vendorLocation);
        vendorLocationRepository.saveAndFlush(vendorLocation);
        vendorApplication.setVendorLocation(vendorLocation);
        vendorApplication.setCreatedOn(ZonedDateTime.now());

        vendorApplicationRepository.saveAndFlush(vendorApplication);

        currUser.setAppliedAsVendor(true);
        currUser.setApproved(false);
        currUser.setRole(AccountRole.ROLE_VENDOR);

        accountRepository.saveAndFlush(currUser);

        return ResponseEntity.ok(ResponseFormatWithObject.builder()
                        .data(vendorApplication)
                        .message("Application Sent Successfully, Waiting for Admin to approve")
                .build());
    }


    public ResponseEntity<List<VendorApplication>> listMyApplications() {
        Account currUser = accountService.currentAccount();

        List<VendorApplication> applications = vendorApplicationRepository.findByVendorAccountOrderByCreatedOnDesc(currUser);


        return ResponseEntity.ok(applications);
    }

    public ResponseEntity<List<VendorApplication>> listAllApplications() {
        List<VendorApplication> applications = vendorApplicationRepository.findAllByOrderByCreatedOnDesc();


        return ResponseEntity.ok(applications);
    }

    public ResponseEntity<List<VendorApplication>> listPendingApplications() {
        List<VendorApplication> applications = new LinkedList<>();

        List<VendorApplication> allPending = vendorApplicationRepository.findByApplicationStatusOrderByCreatedOnDesc(ApplicationStatus.PENDING);

        for(VendorApplication vendorApplication:allPending)
            if(!vendorApplication.getVendorAccount().isApproved())//elliminate whose vendw is approved.
                applications.add(vendorApplication);


        return ResponseEntity.ok(applications);

    }

    public ResponseEntity<ResponseFormatWithObject> approveApplication(UUID applicationId) {
        Optional<VendorApplication> optionalVendorApplication = vendorApplicationRepository.findById(applicationId);
        if(optionalVendorApplication.isEmpty())
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseFormatWithObject.builder()
                    .error(applicationId+" Not Found")
                    .build());
        VendorApplication vendorApplication = optionalVendorApplication.get();
        Account vendorAccount = vendorApplication.getVendorAccount();
        if(vendorAccount.getAppliedAsVendor()&& vendorAccount.isApproved())
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ResponseFormatWithObject.builder()
                    .error("Already Approved this vendor")
                    .build());

        vendorApplication.setApplicationStatus(ApplicationStatus.APPROVED);
        vendorApplication.setActionOn(ZonedDateTime.now());
        vendorApplication.setActionBy(accountService.currentAccount());
//        vendorApplication.set

        vendorAccount.setApproved(true);

        accountRepository.saveAndFlush(vendorAccount);
        vendorApplicationRepository.saveAndFlush(vendorApplication);

        //Create the Vendors Account
        Vendor vendor = new Vendor();

        vendor.setVendorAccount(vendorAccount);
        vendor.setVendorLocation(vendorApplication.getVendorLocation());
        vendor.setActive(true);
        vendor.setSuspended(false);
        vendor.setCreatedOn(ZonedDateTime.now());

        vendorRepository.saveAndFlush(vendor);

        return ResponseEntity.ok(ResponseFormatWithObject.builder()
                .data(vendorApplication)
                .message("Application Approved Successfully")
                .build());
    }

    public ResponseEntity<ResponseFormatWithObject> rejectApplication(UUID applicationId) {
        Optional<VendorApplication> optionalVendorApplication = vendorApplicationRepository.findById(applicationId);
        if(optionalVendorApplication.isEmpty())
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseFormatWithObject.builder()
                    .error(applicationId+" Not Found")
                    .build());
        VendorApplication vendorApplication = optionalVendorApplication.get();
        Account vendorAccount = vendorApplication.getVendorAccount();
        if(vendorAccount.getAppliedAsVendor()&& vendorAccount.isApproved())
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ResponseFormatWithObject.builder()
                    .error("Already Approved this vendor")
                    .build());

        vendorApplication.setApplicationStatus(ApplicationStatus.REJECTED);
        vendorApplication.setActionOn(ZonedDateTime.now());
        vendorApplication.setActionBy(accountService.currentAccount());
//        vendorApplication.set

        vendorAccount.setApproved(false);

        accountRepository.saveAndFlush(vendorAccount);
        vendorApplicationRepository.saveAndFlush(vendorApplication);

        return ResponseEntity.ok(ResponseFormatWithObject.builder()
                .data(vendorApplication)
                .message("Application Rejected Successfully")
                .build());
    }
}
