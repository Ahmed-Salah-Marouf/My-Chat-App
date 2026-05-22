import { Component, inject, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatRoom, CreateChatRoomRequest, User } from '../../../core/models';
import { ChatRoomService, UserService, AuthService } from '../../../core/services';

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
    private authService = inject(AuthService);

    rooms = signal<ChatRoom[]>([]);
    selectedRoomId = signal<number | null>(null);
    showCreateModal = signal(false);
    newRoomName = '';
    loading = signal(false);
    error = signal<string | null>(null);

    // Search related
    searchQuery = signal('');
    searchResults = signal<User[]>([]);
    isSearching = signal(false);
    activeTab = signal<'group' | 'private'>('private');

    // Group member selection
    selectedMembers = signal<User[]>([]);
    groupSearchQuery = signal('');
    groupSearchResults = signal<User[]>([]);
    isGroupSearching = signal(false);

    roomSelected = output<ChatRoom>();

    get currentUserId(): number {
        return this.authService.getCurrentUserId();
    }

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
        this.selectedMembers.set([]);
        this.groupSearchQuery.set('');
        this.groupSearchResults.set([]);
        this.searchQuery.set('');
        this.searchResults.set([]);
    }

    closeCreateModal(): void {
        this.showCreateModal.set(false);
    }

    // --- Private chat search ---
    onSearch(): void {
        const query = this.searchQuery().trim();
        if (query.length < 2) {
            this.searchResults.set([]);
            return;
        }

        this.isSearching.set(true);
        this.userService.searchUsers(query).subscribe({
            next: (users) => {
                this.searchResults.set(users.filter(u => u.id !== this.currentUserId));
                this.isSearching.set(false);
            },
            error: (err) => {
                console.error('Error searching users:', err);
                this.isSearching.set(false);
            }
        });
    }

    // --- Group chat member search ---
    onGroupSearch(): void {
        const query = this.groupSearchQuery().trim();
        if (query.length < 2) {
            this.groupSearchResults.set([]);
            return;
        }

        this.isGroupSearching.set(true);
        this.userService.searchUsers(query).subscribe({
            next: (users) => {
                // Filter out current user and already-selected members
                const selectedIds = this.selectedMembers().map(m => m.id);
                this.groupSearchResults.set(
                    users.filter(u => u.id !== this.currentUserId && !selectedIds.includes(u.id))
                );
                this.isGroupSearching.set(false);
            },
            error: (err) => {
                console.error('Error searching users:', err);
                this.isGroupSearching.set(false);
            }
        });
    }

    addMember(user: User): void {
        this.selectedMembers.update(members => [...members, user]);
        // Remove from search results
        this.groupSearchResults.update(results => results.filter(u => u.id !== user.id));
        this.groupSearchQuery.set('');
        this.groupSearchResults.set([]);
    }

    removeMember(user: User): void {
        this.selectedMembers.update(members => members.filter(m => m.id !== user.id));
    }

    // --- Create actions ---
    startPrivateChat(targetUser: User): void {
        const request: CreateChatRoomRequest = {
            name: `${targetUser.userName}`,
            isPrivate: true
        };

        this.chatRoomService.createChatRoom(request).subscribe({
            next: (room) => {
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

        const memberIds = this.selectedMembers().map(m => ({ id: m.id }));

        const request: CreateChatRoomRequest = {
            name: this.newRoomName.trim(),
            isPrivate: false,
            participants: memberIds
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
