package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Entity(name = "user_accounts_table")
public class Account {
    @Id
    @GeneratedValue
    private UUID uid;

    @Column(unique = true)
    private String username;

    private String name;

    private String email;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    private AccountRole role;

    @JsonIgnore
    @ManyToOne
    private Account addedBy;

    @Column(columnDefinition = "boolean default false")
    private boolean approved;

    private ZonedDateTime addedOn;

    private ZonedDateTime createdOn;

    @Column(columnDefinition = "boolean default false")
    private Boolean appliedAsVendor;

}