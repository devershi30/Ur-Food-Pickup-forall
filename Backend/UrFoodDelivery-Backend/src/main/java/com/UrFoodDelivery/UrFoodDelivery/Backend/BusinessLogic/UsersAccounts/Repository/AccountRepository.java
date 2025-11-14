package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByUsername(String Accountname);

    Optional<Account> findByEmail(@NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email);

    Optional<Account> findByUsernameIgnoreCase(String Accountname);

    List<Account> findAllByOrderByCreatedOnDesc();

}