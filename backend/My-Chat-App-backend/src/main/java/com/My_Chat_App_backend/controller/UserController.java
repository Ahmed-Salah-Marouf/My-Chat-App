package com.My_Chat_App_backend.controller;

import com.My_Chat_App_backend.dto.UserDto;
import com.My_Chat_App_backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/search/{part}")
    public ResponseEntity<List<UserDto>> searchUsers(@PathVariable String part) {
        Set<UserDto> userSet = new TreeSet<>();
        userSet.addAll(userService.searchUsersByEmail(part));
        userSet.addAll(userService.searchUsersByUsername(part));
        return ResponseEntity.ok(new ArrayList<>(userSet));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(userService.getMe());
    }
}
