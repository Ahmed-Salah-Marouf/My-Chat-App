import { Component, inject, input, OnChanges, OnDestroy, signal, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatRoom, Message, SendMessageRequest } from '../../../core/models';
import { ChatRoomService, WebSocketService } from '../../../core/services';

@Component({
    selector: 'app-chat-room',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat-room.component.html',
    styleUrl: './chat-room.component.scss'
})
export class ChatRoomComponent implements OnChanges, OnDestroy {
    private chatRoomService = inject(ChatRoomService);
    private wsService = inject(WebSocketService);

    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    room = input.required<ChatRoom>();

    messages = signal<Message[]>([]);
    newMessage = '';
    loading = signal(false);

    // TODO: Replace with actual user ID from auth
    currentUserId = 1;

    private wsSubscription?: Subscription;

    getRoomName(): string {
        const room = this.room();
        if (room.isPrivate && room.participants) {
            const otherUser = room.participants.find(p => p.id !== this.currentUserId);
            return otherUser ? otherUser.userName : room.name;
        }
        return room.name;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['room']) {
            this.loadMessages();
            this.subscribeToRoom();
        }
    }

    ngOnDestroy(): void {
        this.wsSubscription?.unsubscribe();
    }

    private loadMessages(): void {
        this.loading.set(true);

        this.chatRoomService.getMessagesInChatRoom(this.room().id).subscribe({
            next: (messages) => {
                this.messages.set(messages);
                this.loading.set(false);
                this.scrollToBottom();
            },
            error: (err) => {
                console.error('Error loading messages:', err);
                this.loading.set(false);
            }
        });
    }

    private subscribeToRoom(): void {
        this.wsSubscription?.unsubscribe();

        this.wsSubscription = this.wsService.subscribeToChatRoom(this.room().id).subscribe({
            next: (message) => {
                this.messages.update(msgs => [...msgs, message]);
                this.scrollToBottom();
            }
        });
    }

    sendMessage(): void {
        if (!this.newMessage.trim()) return;

        const request: SendMessageRequest = {
            content: this.newMessage.trim(),
            chatRoomId: this.room().id,
            senderId: this.currentUserId
        };

        this.wsService.sendMessage(request);
        this.newMessage = '';
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.messagesContainer) {
                const el = this.messagesContainer.nativeElement;
                el.scrollTop = el.scrollHeight;
            }
        }, 50);
    }

    isOwnMessage(message: Message): boolean {
        return message.senderId === this.currentUserId;
    }

    formatTime(timestamp: string): string {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
