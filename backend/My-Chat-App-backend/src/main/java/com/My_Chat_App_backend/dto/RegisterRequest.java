package com.My_Chat_App_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String userName;
    private String email;
    private String password;
}
