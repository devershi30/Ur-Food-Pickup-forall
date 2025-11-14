package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.service;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.repository.VendorLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VendorLocationService {

    @Autowired
    private VendorLocationRepository vendorLocationRepository;


}
