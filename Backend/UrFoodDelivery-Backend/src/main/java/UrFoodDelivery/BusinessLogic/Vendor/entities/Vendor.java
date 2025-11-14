package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.entity.VendorLocation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;


@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder

@Entity
public class Vendor{

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID uid;

    @OneToOne
    private VendorLocation vendorLocation;

    @OneToOne
    private Account vendorAccount;

    private boolean active;

    private boolean suspended;

    private double rating=4.0;

    @Transient
    private int orders=0;

    private ZonedDateTime createdOn;

    @Transient
    private double distance;

    @Transient
    private double deliveryTime;



}
