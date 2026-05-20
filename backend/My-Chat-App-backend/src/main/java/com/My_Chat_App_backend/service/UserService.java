package com.My_Chat_App_backend.service;

import com.My_Chat_App_backend.dto.UserDto;
import com.My_Chat_App_backend.entity.User;
import com.My_Chat_App_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public boolean userExistsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public UserDto saveUser(User user) {
        if (userExistsByEmail(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }
        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id).
                orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findUserByEmail(email).
                orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return mapToDto(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<UserDto> searchUsersByUsername(String usernamePart) {
        return userRepository.findByUsernameContainingIgnoreCase(usernamePart).stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<UserDto> searchUsersByEmail(String emailPart) {
        return userRepository.findByEmailContainingIgnoreCase(emailPart).stream()
                .map(this::mapToDto)
                .toList();
    }


    public User getUserEntityById(Long id) {
        return userRepository.findById(id).
                orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .userName(user.getUsername())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserDto getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return getUserByEmail(email);
    }
}
