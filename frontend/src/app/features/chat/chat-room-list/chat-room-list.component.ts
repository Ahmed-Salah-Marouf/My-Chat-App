import { Component, inject, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatRoom, CreateChatRoomRequest, User } from '../../../core/models';
import { ChatRoomService, UserService } from '../../../core/services';

@Component({
    selector: 'app-chat-room-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat-room-list.component.html',
    styleUrl: './chat-room-list.component.scss'
})
export class ChatRoomListComponent implements OnInit {
    private chatRoomService = inject(ChatRoomService);
    private userService = inject(UserService);

    rooms = signal<ChatRoom[]>([]);
    selectedRoomId = signal<number | null>(null);
    showCreateModal = signal(false);
    newRoomName = '';
    loading = signal(false);
    error = signal<string | null>(null);

    // Search related
    searchQuery = signal('');
    searchResults = signal<import('../../../core/models').User[]>([]);
    isSearching = signal(false);
    activeTab = signal<'group' | 'private'>('private');

    roomSelected = output<ChatRoom>();

    // TODO: Replace with actual user ID from auth
    currentUserId = 1;

    ngOnInit(): void {
        this.loadRooms();
    }

    getRoomName(room: ChatRoom): string {
        if (room.isPrivate && room.participants) {
            const otherUser = room.participants.find(p => p.id !== this.currentUserId);
            return otherUser ? otherUser.userName : room.name;
        }
        return room.name;
    }

    loadRooms(): void {
        this.loading.set(true);
        this.error.set(null);

        this.chatRoomService.getAllChatRooms().subscribe({
            next: (rooms) => {
                this.rooms.set(rooms);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load chat rooms');
                this.loading.set(false);
                console.error('Error loading rooms:', err);
            }
        });
    }

    selectRoom(room: ChatRoom): void {
        this.selectedRoomId.set(room.id);
        this.roomSelected.emit(room);
    }

    openCreateModal(): void {
        this.showCreateModal.set(true);
        this.newRoomName = '';
    }

    closeCreateModal(): void {
        this.showCreateModal.set(false);
    }

    onSearch(): void {
        const query = this.searchQuery().trim();
        if (query.length < 2) {
            this.searchResults.set([]);
            return;
        }

        this.isSearching.set(true);
        this.userService.searchUsers(query).subscribe({
            next: (users) => {
                // Filter out current user from results
                this.searchResults.set(users.filter(u => u.id !== this.currentUserId));
                this.isSearching.set(false);
            },
            error: (err) => {
                console.error('Error searching users:', err);
                this.isSearching.set(false);
            }
        });
    }

    startPrivateChat(targetUser: User): void {
        const request: CreateChatRoomRequest = {
            name: `${targetUser.userName}`,
            isPrivate: true
        };

        this.chatRoomService.createChatRoom(request).subscribe({
            next: (room) => {
                // Backend will handle adding participants if needed, 
                // but usually the room creation should include them.
                // For simplicity, let's assume the backend handles the initial participant (creator)
                // and we might need an extra step if the backend doesn't add the targetUser automatically.
                this.chatRoomService.addParticipantToChatRoom(room.id, targetUser.id).subscribe({
                    next: (updatedRoom) => {
                        this.rooms.update(rooms => [...rooms, updatedRoom]);
                        this.closeCreateModal();
                        this.selectRoom(updatedRoom);
                    }
                });
            },
            error: (err) => {
                console.error('Error starting private chat:', err);
            }
        });
    }

    createRoom(): void {
        if (!this.newRoomName.trim()) return;

        const request: CreateChatRoomRequest = {
            name: this.newRoomName.trim(),
            isPrivate: false
        };

        this.chatRoomService.createChatRoom(request).subscribe({
            next: (room) => {
                this.rooms.update(rooms => [...rooms, room]);
                this.closeCreateModal();
                this.selectRoom(room);
            },
            error: (err) => {
                console.error('Error creating room:', err);
            }
        });
    }
}
