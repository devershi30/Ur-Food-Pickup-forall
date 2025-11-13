package com.UrFoodDelivery.UrFoodDelivery.Backend.Auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Entity
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthorizationTokens {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uid;

    @Column(unique = true)
    private String value;

    private Date created;

    private Long lastAccess;

    private Date logoutTime;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean loggedOut;

    private Long inActiveTime= TimeUnit.DAYS.toMillis(30);


    public Boolean isUsable()
    {
        Long expiryTime=lastAccess+inActiveTime;
        return (!loggedOut&&new Date().before(new Date(expiryTime)));
    }

    private UUID accountId;

    @JsonIgnore
    private Boolean authenticated;
}
