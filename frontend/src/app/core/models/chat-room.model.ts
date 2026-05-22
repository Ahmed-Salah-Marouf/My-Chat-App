import { User } from './user.model';

// ChatRoom model matching backend ChatRoomDto
export interface ChatRoom {
    id: number;
    name: string;
    createdAt: string;
    isPrivate: boolean;
    participants?: User[];
}

// For creating a new chat room
export interface CreateChatRoomRequest {
    name: string;
    isPrivate?: boolean;
    participants?: { id: number }[];
}
