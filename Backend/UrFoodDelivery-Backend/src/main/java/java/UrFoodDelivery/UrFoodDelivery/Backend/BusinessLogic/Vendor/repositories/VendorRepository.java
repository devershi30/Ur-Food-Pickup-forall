package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    List<Vendor> findByActiveTrue();

    Optional<Vendor> findByVendorAccount(Account account);

}
