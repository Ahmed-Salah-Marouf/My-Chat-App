package com.My_Chat_App_backend.service;

import com.My_Chat_App_backend.dto.LoginRequest;
import com.My_Chat_App_backend.dto.RegisterRequest;
import com.My_Chat_App_backend.entity.User;
import com.My_Chat_App_backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public String register(RegisterRequest registerRequest) {
        User user = userRepository.findUserByEmail(registerRequest.getEmail()).orElse(null);
        if (user != null) {
            throw new RuntimeException("User already exists");
        }
        user = User.builder()
                .email(registerRequest.getEmail())
                .username(registerRequest.getUserName())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();
        userRepository.save(user);
        return jwtService.generateToken(user.getEmail());
    }

    public String login(LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        return jwtService.generateToken(loginRequest.getEmail());
    }
}
