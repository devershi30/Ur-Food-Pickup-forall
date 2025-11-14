package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Service;


import com.UrFoodDelivery.UrFoodDelivery.Backend.Auth.AuthorizationTokens;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Auth.AuthorizationTokensRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Auth.CustomUserDetailsService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Entity.Account;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.Repository.AccountRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.models.LoginResponseModel;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.models.LoginUserModelRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.models.RegisterResponseModel;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.UsersAccounts.models.RegisterUserModelRequest;
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
import java.util.HashMap;
import java.util.Optional;
import java.util.concurrent.TimeUnit;


@Service
@Validated
public class UserService {

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

    public ResponseEntity<RegisterResponseModel> registerUser(@Valid RegisterUserModelRequest registerUserModel) {
        if(registerUserModel.getUsername().equals("admin"))
            ensureMainAdminUser();

        // Check if passwords match
        if (!registerUserModel.getPassword().equals(registerUserModel.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Check if username or email already exists
        if (accountRepository.findByUsername(registerUserModel.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (accountRepository.findByEmail(registerUserModel.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create a new user
        Acccount user = User.builder()
                .username(registerUserModel.getUsername().trim())
                .name(registerUserModel.getName()) // Set the name
                .email(registerUserModel.getEmail())
                .password(passwordEncoder.encode(registerUserModel.getPassword())) // Encrypt password
                .role(AccountRole.ROLE_USER) // Default role
                .approved(false) // Default approval status
                .attemptedDoctor(false)
                .addedOn(System.currentTimeMillis()) // Set current time for addedOn
                .createdOn(System.currentTimeMillis()) // Set current time for cratedOn
                .build();
        accountRepository.saveAndFlush(user);

        return ResponseEntity.ok(RegisterResponseModel.builder()
                .userId(user.getUid())
                .message("Registered Successfully")
                .build());
    }

    public ResponseEntity<LoginResponseModel> loginUser(@Valid LoginUserModelRequest loginUserModel) {
        if(loginUserModel.getUsername().equals("admin"))
            ensureMainAdminUser();

        Optional<User> optionalAcccount = accountRepository.findByUsernameIgnoreCase(loginUserModel.getUsername().trim());
        if (optionalUser.isEmpty())
            throw new UsernameNotFoundException("Username does not exist");


        //spring security handles login for us
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginUserModel.getUsername(),loginUserModel.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(loginUserModel.getUsername());

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
                .inActiveTime(TimeUnit.MINUTES.toMillis(10))
                .accountId(optionalUser.get().getUid())
                .build();

        authorizationTokensRepository.saveAndFlush(authorizationTokens);

        //sendVerificationCode(authorizationTokens,userDetails.getUsername());

        LoginResponseModel loginResponseModel=LoginResponseModel.builder()
                .user(userDetails.getUsername())
                .message("Login Successful.")
                .Authorization(authorization)
                .build();

        return ResponseEntity.ok(loginResponseModel);

    }

    private void ensureMainAdminUser() {
        Optional<User> optionalAcccount = accountRepository.findByUsernameIgnoreCase("admin");
        if (optionalAcccount .isEmpty()) {

            Acccount user = User.builder()
                    .username("admin")
                    .name("Super Admin") // Set the name
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("admin123")) // Encrypt password
                    .role(AccountRole.ROLE_ADMIN) // Default role
                    .approved(false) // Default approval status
                    .attemptedDoctor(false)
                    .addedOn(System.currentTimeMillis()) // Set current time for addedOn
                    .createdOn(System.currentTimeMillis()) // Set current time for cratedOn
                    .build();
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


    public Acccount currentUser()
    {
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Account> optionalUser=accountRepository.findByUsernameIgnoreCase(username);
        if(optionalUser.isPresent()) {
            Acccount currAcccount = optionalUser.get();
            return currUser;
        }
        else{
            return null;
        }
    }

    public ResponseEntity<Accountr> checkuser() {
        Acccount currentAcccount = currentUser();
        if(currentUser!=null)
            return ResponseEntity.ok(currentUser);
        else
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
    }

    public ResponseEntity<String> update(@Valid UpdateAccountRequest updateAccountRequest) {
        Acccount currentAcccount = currentUser();
        if(currentUser==null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not Authorized");

        currentUser.setName(updateAccountRequest.getName());
        if(!updateAccountRequest.getUsername().equalsIgnoreCase(currentUser().getUsername())) {
            Optional<User> usernameExists = accountRepository.findByUsernameIgnoreCase(updateAccountRequest.getUsername());
            if(usernameExists.isPresent())
                throw new IllegalArgumentException("Username not available");
            currentUser.setUsername(updateAccountRequest.getUsername());
        }
        currentUser.setEmail(updateAccountRequest.getEmail());

        accountRepository.save(currentUser);

        return ResponseEntity.ok("Updated Successfully");
    }

    public ResponseEntity<String> changePassword(@Valid ChangePasswordRequest changePasswordRequest) {
        Acccount currentAcccount = currentUser();
        if(currentUser==null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not Authorized");

        if(passwordEncoder.matches(changePasswordRequest.getCurrentPassword(),currentUser.getPassword()))
        {
            if(changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword()))
            {
                currentUser.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
                accountRepository.save(currentUser);

                return ResponseEntity.ok("Password Changed Successfully");
            } else
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords Don`t Match");
        }
        else
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect Current password");
    }
}