package com.My_Chat_App_backend.dto;

import lombok.*;

import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto implements Comparable<UserDto> {
    private Long id;
    private String userName;
    private String email;
    private LocalDateTime createdAt;

    @Override
    public int compareTo(UserDto other) {
        return this.id.compareTo(other.id);
    }
}
