package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.repository;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.entity.VendorLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VendorLocationRepository extends JpaRepository<VendorLocation, UUID> {


}
