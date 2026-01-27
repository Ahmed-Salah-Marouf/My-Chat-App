import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoomListComponent } from '../chat-room-list/chat-room-list.component';
import { ChatRoomComponent } from '../chat-room/chat-room.component';
import { ChatRoom } from '../../../core/models';
import { WebSocketService } from '../../../core/services';

@Component({
    selector: 'app-chat-layout',
    standalone: true,
    imports: [CommonModule, ChatRoomListComponent, ChatRoomComponent],
    templateUrl: './chat-layout.component.html',
    styleUrl: './chat-layout.component.scss'
})
export class ChatLayoutComponent implements OnInit {
    private wsService = inject(WebSocketService);

    selectedRoom = signal<ChatRoom | null>(null);

    ngOnInit(): void {
        // Connect to WebSocket when layout loads
        this.wsService.connect();
    }

    onRoomSelected(room: ChatRoom): void {
        this.selectedRoom.set(room);
    }
}
