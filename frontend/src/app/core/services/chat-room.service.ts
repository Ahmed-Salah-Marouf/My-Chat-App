import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatRoom, CreateChatRoomRequest } from '../models';
import { User } from '../models';
import { Message } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ChatRoomService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/chatrooms`;

    getAllChatRooms(): Observable<ChatRoom[]> {
        return this.http.get<ChatRoom[]>(this.apiUrl);
    }

    getChatRoomsByUserId(userId: number): Observable<ChatRoom[]> {
        return this.http.get<ChatRoom[]>(`${this.apiUrl}/user/${userId}`);
    }

    getParticipantsInChatRoom(chatRoomId: number): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/${chatRoomId}/participants`);
    }

    getMessagesInChatRoom(chatRoomId: number): Observable<Message[]> {
        return this.http.get<Message[]>(`${this.apiUrl}/${chatRoomId}/messages`);
    }

    createChatRoom(chatRoom: CreateChatRoomRequest): Observable<ChatRoom> {
        return this.http.post<ChatRoom>(this.apiUrl, chatRoom);
    }

    addParticipantToChatRoom(chatRoomId: number, userId: number): Observable<ChatRoom> {
        return this.http.put<ChatRoom>(`${this.apiUrl}/${chatRoomId}/addParticipants/${userId}`, {});
    }

    updateChatRoomName(chatRoomId: number, newName: string): Observable<ChatRoom> {
        return this.http.put<ChatRoom>(`${this.apiUrl}/${chatRoomId}?newName=${encodeURIComponent(newName)}`, {});
    }

    deleteChatRoom(chatRoomId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${chatRoomId}`);
    }

    removeParticipantFromChatRoom(chatRoomId: number, userId: number): Observable<ChatRoom> {
        return this.http.delete<ChatRoom>(`${this.apiUrl}/${chatRoomId}/user/${userId}`);
    }
}
