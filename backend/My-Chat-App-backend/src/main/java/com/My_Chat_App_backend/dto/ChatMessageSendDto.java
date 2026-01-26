package com.My_Chat_App_backend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessageSendDto {
    private String content;
    private Long chatRoomId;
    private Long senderId;
}
