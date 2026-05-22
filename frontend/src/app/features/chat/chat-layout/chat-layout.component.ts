import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoomListComponent } from '../chat-room-list/chat-room-list.component';
import { ChatRoomComponent } from '../chat-room/chat-room.component';
import { ChatRoom, User } from '../../../core/models';
import { WebSocketService, AuthService } from '../../../core/services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat-layout',
    standalone: true,
    imports: [CommonModule, ChatRoomListComponent, ChatRoomComponent],
    templateUrl: './chat-layout.component.html',
    styleUrl: './chat-layout.component.scss'
})
export class ChatLayoutComponent implements OnInit, OnDestroy {
    private wsService = inject(WebSocketService);
    private authService = inject(AuthService);

    selectedRoom = signal<ChatRoom | null>(null);
    currentUser = signal<User | null>(null);

    private userSub?: Subscription;

    ngOnInit(): void {
        // Connect to WebSocket when layout loads
        this.wsService.connect();

        // Load current user info
        this.userSub = this.authService.getCurrentUser().subscribe(user => {
            this.currentUser.set(user);
        });

        // If user not cached yet, fetch from backend
        if (!this.authService.getCurrentUserSync()) {
            this.authService.fetchCurrentUser().subscribe();
        }
    }

    ngOnDestroy(): void {
        this.userSub?.unsubscribe();
        this.wsService.disconnect();
    }

    onRoomSelected(room: ChatRoom): void {
        this.selectedRoom.set(room);
    }

    logout(): void {
        this.wsService.disconnect();
        this.authService.logout();
    }
}
