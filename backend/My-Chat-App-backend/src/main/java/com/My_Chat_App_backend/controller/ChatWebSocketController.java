package com.My_Chat_App_backend.controller;

import com.My_Chat_App_backend.dto.ChatMessageSendDto;
import com.My_Chat_App_backend.dto.MessageDto;
import com.My_Chat_App_backend.entity.Message;
import com.My_Chat_App_backend.service.ChatRoomService;
import com.My_Chat_App_backend.service.MessageService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@AllArgsConstructor
public class ChatWebSocketController {
    private final ChatRoomService chatRoomService;
    private final MessageService messageService;

    @MessageMapping("/sendMessage/{chatRoomId}")
    @SendTo("/topic/chatroom.{chatRoomId}")
    public MessageDto sendMessage(@Payload ChatMessageSendDto chatMessageSendDto
            , @DestinationVariable Long chatRoomId) {

        Message message = Message.builder()
                .content(chatMessageSendDto.getContent())
                .build();
        Message savedMessage = chatRoomService.createMessageInChatRoom(chatRoomId, message);

        return messageService.mapToDto(savedMessage);
    }
}
