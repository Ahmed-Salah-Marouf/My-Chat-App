import { Injectable, inject } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message, SendMessageRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private client: Client | null = null;
    private connected$ = new BehaviorSubject<boolean>(false);
    private messageSubject = new Subject<Message>();
    private activeSubscriptions: Map<number, any> = new Map();

    /**
     * Connect to WebSocket server
     */
    connect(): void {
        if (this.client?.connected) {
            return;
        }

        this.client = new Client({
            webSocketFactory: () => new SockJS(environment.wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                console.log('[WebSocket]', str);
            },
            onConnect: () => {
                console.log('WebSocket connected');
                this.connected$.next(true);
            },
            onDisconnect: () => {
                console.log('WebSocket disconnected');
                this.connected$.next(false);
            },
            onStompError: (frame) => {
                console.error('WebSocket error:', frame.headers['message']);
                console.error('Details:', frame.body);
            }
        });

        this.client.activate();
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.client) {
            this.activeSubscriptions.forEach(sub => sub.unsubscribe());
            this.activeSubscriptions.clear();
            this.client.deactivate();
            this.client = null;
            this.connected$.next(false);
        }
    }

    /**
     * Check if WebSocket is connected
     */
    isConnected(): Observable<boolean> {
        return this.connected$.asObservable();
    }

    /**
     * Subscribe to a chat room to receive messages
     */
    subscribeToChatRoom(chatRoomId: number): Observable<Message> {
        const subject = new Subject<Message>();

        // Wait for connection if not connected
        if (!this.client?.connected) {
            console.warn('WebSocket not connected. Call connect() first.');
            return subject.asObservable();
        }

        // Unsubscribe from previous subscription if exists
        if (this.activeSubscriptions.has(chatRoomId)) {
            this.activeSubscriptions.get(chatRoomId).unsubscribe();
        }

        const subscription = this.client.subscribe(
            `/topic/chatroom.${chatRoomId}`,
            (message: IMessage) => {
                const parsedMessage: Message = JSON.parse(message.body);
                subject.next(parsedMessage);
                this.messageSubject.next(parsedMessage);
            }
        );

        this.activeSubscriptions.set(chatRoomId, subscription);

        return subject.asObservable();
    }

    /**
     * Unsubscribe from a chat room
     */
    unsubscribeFromChatRoom(chatRoomId: number): void {
        if (this.activeSubscriptions.has(chatRoomId)) {
            this.activeSubscriptions.get(chatRoomId).unsubscribe();
            this.activeSubscriptions.delete(chatRoomId);
        }
    }

    /**
     * Send a message to a chat room
     */
    sendMessage(messageRequest: SendMessageRequest): void {
        if (!this.client?.connected) {
            console.error('Cannot send message: WebSocket not connected');
            return;
        }

        this.client.publish({
            destination: `/app/sendMessage/${messageRequest.chatRoomId}`,
            body: JSON.stringify(messageRequest)
        });
    }

    /**
     * Get all incoming messages (from all subscribed chat rooms)
     */
    getMessages(): Observable<Message> {
        return this.messageSubject.asObservable();
    }
}
