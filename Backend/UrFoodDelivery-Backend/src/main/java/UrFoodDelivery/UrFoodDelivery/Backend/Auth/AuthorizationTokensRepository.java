package com.UrFoodDelivery.UrFoodDelivery.Backend.Auth;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthorizationTokensRepository extends JpaRepository<AuthorizationTokens, UUID> {

    @Query("select a from AuthorizationTokens a where a.value=?1")
    Optional<AuthorizationTokens> findByValue(String value);
}

