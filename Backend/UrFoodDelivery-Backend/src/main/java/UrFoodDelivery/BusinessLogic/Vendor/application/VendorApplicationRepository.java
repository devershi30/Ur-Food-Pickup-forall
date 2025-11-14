package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.application;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;


@Repository
public interface VendorApplicationRepository extends JpaRepository<VendorApplication, UUID> {
    List<VendorApplication> findByVendorAccountOrderByCreatedOnDesc(Account currUser);

    List<VendorApplication> findAllByOrderByCreatedOnDesc();

    List<VendorApplication> findByApplicationStatusOrderByCreatedOnDesc(ApplicationStatus applicationStatus);


}
