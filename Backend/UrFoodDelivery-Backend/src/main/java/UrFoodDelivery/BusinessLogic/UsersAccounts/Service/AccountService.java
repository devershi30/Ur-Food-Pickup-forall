package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Service;


import com.UrFoodDelivery.UrFoodDelivery.Backend.Auth.AuthorizationTokens;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Auth.AuthorizationTokensRepository;

import com.UrFoodDelivery.UrFoodDelivery.Backend.Auth.CustomUserDetailsService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.AccountsFactory.AccountFactory;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.AccountRole;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository.AccountRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.models.*;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Configs.SecurityConfig;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.sql.Date;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Optional;
import java.util.concurrent.TimeUnit;


@Service
@Validated
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private AuthorizationTokensRepository authorizationTokensRepository;


    @Autowired
    private AccountFactory accountFactory;

    public ResponseEntity<RegisterResponseModel> registerAccount(@Valid RegisterAccountModelRequest registerAccountModel, boolean isVendor) {
        if(registerAccountModel.getUsername().equals("admin"))
            ensureMainAdminAccount();

        // Check if passwords match
        if (!registerAccountModel.getPassword().equals(registerAccountModel.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Check if username or email already exists
        if (accountRepository.findByUsername(registerAccountModel.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Accountname already exists");
        }
        if (accountRepository.findByEmail(registerAccountModel.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create a new user
        Account user = isVendor
                ?accountFactory.createVendor(registerAccountModel)
                :accountFactory.createStudent(registerAccountModel);
        accountRepository.saveAndFlush(user);

        return ResponseEntity.ok(RegisterResponseModel.builder()
                .userId(user.getUid())
                .message("Registered Successfully")
                .build());
    }

    public ResponseEntity<LoginResponseModel> loginAccount(@Valid LoginAccountModelRequest loginAccountModel) {
        if(loginAccountModel.getUsername().equals("admin"))
            ensureMainAdminAccount();

        Optional<Account> optionalAccount = accountRepository.findByUsernameIgnoreCase(loginAccountModel.getUsername().trim());
        if (optionalAccount.isEmpty())
            throw new UsernameNotFoundException("Accountname does not exist");


        //spring security handles login for us
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginAccountModel.getUsername(),loginAccountModel.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(loginAccountModel.getUsername());

        final String tokens = Jwts.builder().setClaims(new HashMap<>()).setSubject(userDetails.getUsername()).setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + TimeUnit.HOURS.toMillis(2)))
                .signWith(SignatureAlgorithm.HS256, SecurityConfig.secretKey).compact();


        String authorization="Bearer "+tokens;

        AuthorizationTokens authorizationTokens= AuthorizationTokens.builder()
                .created(new java.util.Date())
                .authenticated(true)
                .loggedOut(false)
                .value(tokens)
                .lastAccess(new java.util.Date().getTime())
                .inActiveTime(TimeUnit.HOURS.toMillis(2))
                .accountId(optionalAccount.get().getUid())
                .build();

        authorizationTokensRepository.saveAndFlush(authorizationTokens);

        //sendVerificationCode(authorizationTokens,userDetails.getAccountname());

        LoginResponseModel loginResponseModel=LoginResponseModel.builder()
                .user(userDetails.getUsername())
                .message("Login Successful.")
                .Authorization(authorization)
                .build();

        return ResponseEntity.ok(loginResponseModel);

    }

    private void ensureMainAdminAccount() {
        Optional<Account> optionalAccount = accountRepository.findByUsernameIgnoreCase("admin");
        if (optionalAccount .isEmpty()) {

            RegisterAccountModelRequest adminReq = new RegisterAccountModelRequest();
            adminReq.setUsername("admin");
            adminReq.setName("Super Admin");
            adminReq.setEmail("admin@gmail.com");
            adminReq.setPassword("admin123");
            adminReq.setConfirmPassword("admin123");
            Account user = accountFactory.createAdmin(adminReq);

            accountRepository.saveAndFlush(user);
        }
    }


    public ResponseEntity<String> logOut(HttpServletRequest request)
    {
        String authorization=request.getHeader("Authorization");
        String init="Bearer ";
        if(authorization!=null&&authorization.contains(init)) {
            String tokenString = authorization.replaceAll(init, "");
            Optional<AuthorizationTokens> optionalAuthorizationTokens = authorizationTokensRepository.findByValue(tokenString);
            if (optionalAuthorizationTokens.isEmpty())
                throw new UnsupportedOperationException("no such authorization");

            AuthorizationTokens authorizationTokens = optionalAuthorizationTokens.get();

            //perform the logout action
            authorizationTokens.setLoggedOut(true);
            authorizationTokens.setLogoutTime(new java.util.Date());
            authorizationTokensRepository.save(authorizationTokens);

            return ResponseEntity.ok("Success");
        }
        else
            throw new UnsupportedOperationException("no such authorization");
    }


    public Account currentAccount()
    {
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Account> optionalAccount=accountRepository.findByUsernameIgnoreCase(username);
        if(optionalAccount.isPresent()) {
            Account currAccount = optionalAccount.get();
            return currAccount;
        }
        else{
            return null;
        }
    }

    public ResponseEntity<Account> checkuser() {
        Account currentAccount = currentAccount();
        if(currentAccount!=null)
            return ResponseEntity.ok(currentAccount);
        else
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
    }

    public ResponseEntity<String> update(@Valid UpdateAccountRequest updateAccountRequest) {
        Account currentAccount = currentAccount();
        if(currentAccount==null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not Authorized");

        currentAccount.setName(updateAccountRequest.getName());
        if(!updateAccountRequest.getUsername().equalsIgnoreCase(currentAccount().getUsername())) {
            Optional<Account> usernameExists = accountRepository.findByUsernameIgnoreCase(updateAccountRequest.getUsername());
            if(usernameExists.isPresent())
                throw new IllegalArgumentException("Username not available");
            currentAccount.setUsername(updateAccountRequest.getUsername());
        }
        currentAccount.setEmail(updateAccountRequest.getEmail());

        accountRepository.save(currentAccount);

        return ResponseEntity.ok("Updated Successfully");
    }

    public ResponseEntity<String> changePassword(@Valid ChangePasswordRequest changePasswordRequest) {
        Account currentAccount = currentAccount();
        if(currentAccount==null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not Authorized");

        if(passwordEncoder.matches(changePasswordRequest.getCurrentPassword(),currentAccount.getPassword()))
        {
            if(changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword()))
            {
                currentAccount.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
                accountRepository.save(currentAccount);

                return ResponseEntity.ok("Password Changed Successfully");
            } else
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords Don`t Match");
        }
        else
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect Current password");
    }
}