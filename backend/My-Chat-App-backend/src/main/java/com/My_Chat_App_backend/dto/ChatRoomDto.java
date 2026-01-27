package com.My_Chat_App_backend.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatRoomDto {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    private java.util.List<UserDto> participants;
}
