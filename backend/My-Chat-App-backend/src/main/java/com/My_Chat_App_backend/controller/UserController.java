package com.My_Chat_App_backend.controller;

import com.My_Chat_App_backend.dto.UserDto;
import com.My_Chat_App_backend.entity.User;
import com.My_Chat_App_backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping({"", "/"})
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/search/username/{usernamePart}")
    public ResponseEntity<List<UserDto>> searchUsersByUsername(@PathVariable String usernamePart) {
        return ResponseEntity.ok(userService.searchUsersByUsername(usernamePart));
    }

    @GetMapping("/search/email/{emailPart}")
    public ResponseEntity<List<UserDto>> searchUsersByEmail(@PathVariable String emailPart) {
        return ResponseEntity.ok(userService.searchUsersByEmail(emailPart));
    }

    @GetMapping("/search/{part}")
    public ResponseEntity<List<UserDto>> searchUsers(@PathVariable String part) {
        Set<UserDto> userSet = new TreeSet<>();
        userSet.addAll(userService.searchUsersByEmail(part));
        userSet.addAll(userService.searchUsersByUsername(part));
        return ResponseEntity.ok(new ArrayList<>(userSet));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<UserDto> createUser(@RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.saveUser(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }
}
