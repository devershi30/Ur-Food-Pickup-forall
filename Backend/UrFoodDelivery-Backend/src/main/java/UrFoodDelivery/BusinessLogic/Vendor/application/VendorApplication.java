package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.application;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.VendorLocation.entity.VendorLocation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder


@Entity
public class VendorApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID uid;


    @ManyToOne
    private Account vendorAccount;


    @OneToOne
    private VendorLocation vendorLocation;

    private ApplicationStatus applicationStatus;

    private ZonedDateTime createdOn;

    private ZonedDateTime actionOn;

    @ManyToOne
    private Account actionBy;

}
