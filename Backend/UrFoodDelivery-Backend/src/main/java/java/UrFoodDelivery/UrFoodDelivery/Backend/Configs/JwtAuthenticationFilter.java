// JwtAuthenticationFilter.java
package com.UrFoodDelivery.UrFoodDelivery.Backend.Configs;


import com.UrFoodDelivery.UrFoodDelivery.Backend.Auth.AuthorizationTokens;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Auth.AuthorizationTokensRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private AuthorizationTokensRepository authorizationTokensRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            try {
                String token = authorizationHeader.substring(7);
                String username = jwtUtil.extractUsername(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (jwtUtil.validateToken(token, username)) {
                    /*// Set authentication in the context
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);*/

                        System.out.println("Validate Success Auth");
                        Optional<AuthorizationTokens> tmpToken = authorizationTokensRepository.findByValue(token);
                        if (tmpToken.isPresent()) {
                            AuthorizationTokens authorizationTokens = tmpToken.get();
                            System.out.println("Present Success Auth");
                            if (authorizationTokens.isUsable()) {

                                //check for 2FA
//                            if(check2FA(token))
                                {
                                    if (!request.getRequestURL().toString().endsWith("/checkUser")) {
                                        authorizationTokens.setLastAccess(new Date().getTime());
                                        authorizationTokensRepository.save(authorizationTokens);
                                    }
                                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = getUsernamePasswordAuthenticationToken(username, authorizationTokens);
                                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                                    System.out.println("Success Auth");
                                }
                            }
                        }


                    }
                }
            }catch (Exception es)
            {
                es.printStackTrace();
            }
        }
        chain.doFilter(request, response);
    }


    private UsernamePasswordAuthenticationToken getUsernamePasswordAuthenticationToken(String username, AuthorizationTokens token) {

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userDetails.getUsername(),userDetails.getPassword(), userDetails.getAuthorities());
        return usernamePasswordAuthenticationToken;
    }
}