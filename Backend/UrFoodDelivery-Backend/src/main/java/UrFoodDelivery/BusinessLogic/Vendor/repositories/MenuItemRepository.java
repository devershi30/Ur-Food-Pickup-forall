package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.MenuItem;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByVendor(Vendor vendor);
}
