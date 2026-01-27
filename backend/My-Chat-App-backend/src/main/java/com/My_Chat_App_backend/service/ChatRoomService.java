package com.My_Chat_App_backend.service;

import com.My_Chat_App_backend.dto.ChatRoomDto;
import com.My_Chat_App_backend.dto.MessageDto;
import com.My_Chat_App_backend.dto.UserDto;
import com.My_Chat_App_backend.entity.ChatRoom;
import com.My_Chat_App_backend.entity.Message;
import com.My_Chat_App_backend.entity.User;
import com.My_Chat_App_backend.repository.ChatRoomRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final UserService userService;
    private final MessageService messageService;

    public ChatRoomDto getChatRoomById(Long id) {
        ChatRoom chatRoom = chatRoomRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Chat room not found with id: " + id));
        return mapToDto(chatRoom);
    }

    public List<ChatRoomDto> getAllChatRooms() {
        return chatRoomRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<ChatRoomDto> getChatRoomsByUserId(Long userId) {
        return chatRoomRepository.findByParticipants_Id(userId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public ChatRoomDto createChatRoom(ChatRoom chatRoom) {
        if (chatRoom.getParticipants() != null) {
            // Fetch full User entities for participants
            List<User> fullParticipants = chatRoom.getParticipants().stream()
                    .map(user -> userService.getUserEntityById(user.getId()))
                    .toList();
            chatRoom.setParticipants(new ArrayList<>(fullParticipants));

            // Set isPrivate based on number of participants
            chatRoom.setPrivate(chatRoom.getParticipants().size() <= 2);
        }

        ChatRoom saveChatRoom = chatRoomRepository.save(chatRoom);
        return mapToDto(saveChatRoom);
    }

    public void deleteChatRoomById(Long chatRoomId) {
        if (!chatRoomRepository.existsById(chatRoomId)) {
            throw new RuntimeException("Chat room not found with id: " + chatRoomId);
        }
        chatRoomRepository.deleteById(chatRoomId);
    }


    public ChatRoom getChatRoomEntityById(Long id) {
        return chatRoomRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Chat room not found with id: " + id));
    }

    public ChatRoomDto addParticipantToChatRoom(Long chatRoomId, Long userId) {
        ChatRoom chatRoom = getChatRoomEntityById(chatRoomId);
        User user = userService.getUserEntityById(userId);
        chatRoom.getParticipants().add(user);
        chatRoom.setPrivate(chatRoom.getParticipants().size() <= 2);
        chatRoomRepository.save(chatRoom);
        return mapToDto(chatRoom);
    }

    public List<UserDto> getParticipantsInChatRoom(Long chatRoomId) {
        ChatRoom chatRoom = getChatRoomEntityById(chatRoomId);
        return chatRoom.getParticipants()
                .stream()
                .map(userService::mapToDto)
                .toList();
    }

    public List<MessageDto> getMessagesInChatRoom(Long chatRoomId) {
        ChatRoom chatRoom = getChatRoomEntityById(chatRoomId);
        return chatRoom.getMessages()
                .stream()
                .map(messageService::mapToDto)
                .toList();
    }

    public ChatRoomDto updateChatRoomName(Long chatRoomId, String newName) {
        ChatRoom chatRoom = getChatRoomEntityById(chatRoomId);
        chatRoom.setName(newName);
        ChatRoom SavedChat = chatRoomRepository.save(chatRoom);
        return mapToDto(SavedChat);
    }

    public ChatRoomDto removeParticipantFromChatRoom(Long chatRoomId, Long userId) {
        ChatRoom chatRoom = getChatRoomEntityById(chatRoomId);
        User user = userService.getUserEntityById(userId);
        chatRoom.getParticipants().remove(user);
        chatRoom.setPrivate(chatRoom.getParticipants().size() <= 2);
        chatRoomRepository.save(chatRoom);
        return mapToDto(chatRoom);
    }

    public Message createMessageInChatRoom(Long chatRoomId, Message message) {
        ChatRoom chatRoom = getChatRoomEntityById(chatRoomId);
        message.setChatRoom(chatRoom);
        Message savedMessage = messageService.saveMessage(message);
        chatRoom.getMessages().add(savedMessage);
        chatRoomRepository.save(chatRoom);
        return savedMessage;
    }

    private ChatRoomDto mapToDto(ChatRoom chatRoom) {
        return ChatRoomDto.builder()
                .id(chatRoom.getId())
                .name(chatRoom.getName())
                .createdAt(chatRoom.getCreatedAt())
                .isPrivate(chatRoom.isPrivate())
                .participants(chatRoom.getParticipants() != null ? 
                    chatRoom.getParticipants().stream().map(userService::mapToDto).toList() : new java.util.ArrayList<>())
                .build();
    }
}
