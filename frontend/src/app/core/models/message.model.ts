// Message model matching backend MessageDto
export interface Message {
    id: number;
    content: string;
    timestamp: string;
    chatRoomId: number;
    senderId: number;
}

// For sending a new message via WebSocket
export interface SendMessageRequest {
    content: string;
    chatRoomId: number;
    senderId: number;
}
