import { Component, inject, input, OnChanges, OnDestroy, signal, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatRoom, Message, SendMessageRequest, User } from '../../../core/models';
import { ChatRoomService, WebSocketService, AuthService, UserService } from '../../../core/services';

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
    private authService = inject(AuthService);
    private userService = inject(UserService);

    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    room = input.required<ChatRoom>();

    messages = signal<Message[]>([]);
    newMessage = '';
    loading = signal(false);

    // Add member panel
    showAddMember = signal(false);
    memberSearchQuery = signal('');
    memberSearchResults = signal<User[]>([]);
    isMemberSearching = signal(false);

    get currentUserId(): number {
        return this.authService.getCurrentUserId();
    }

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
            this.showAddMember.set(false);
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

    // --- Add member to group ---
    toggleAddMember(): void {
        this.showAddMember.update(v => !v);
        this.memberSearchQuery.set('');
        this.memberSearchResults.set([]);
    }

    onMemberSearch(): void {
        const query = this.memberSearchQuery().trim();
        if (query.length < 2) {
            this.memberSearchResults.set([]);
            return;
        }

        const existingIds = this.room().participants?.map(p => p.id) ?? [];

        this.isMemberSearching.set(true);
        this.userService.searchUsers(query).subscribe({
            next: (users) => {
                this.memberSearchResults.set(
                    users.filter(u => u.id !== this.currentUserId && !existingIds.includes(u.id))
                );
                this.isMemberSearching.set(false);
            },
            error: () => this.isMemberSearching.set(false)
        });
    }

    addMemberToRoom(user: User): void {
        this.chatRoomService.addParticipantToChatRoom(this.room().id, user.id).subscribe({
            next: (updatedRoom) => {
                // Update the room's participant list locally
                const current = this.room();
                if (current.participants) {
                    current.participants.push({ id: user.id, userName: user.userName, email: user.email, createdAt: user.createdAt });
                }
                this.memberSearchResults.update(r => r.filter(u => u.id !== user.id));
                this.memberSearchQuery.set('');
                this.memberSearchResults.set([]);
                this.showAddMember.set(false);
            },
            error: (err) => console.error('Error adding member:', err)
        });
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
