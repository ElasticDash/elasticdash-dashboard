// Socket.IO connection logic for chat async plan/approval integration
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function initSocket() {
	if (socket) return socket;

	socket = io(API_BASE_URL, {
		transports: ['websocket', 'polling'],
		reconnection: true,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 5000,
		reconnectionAttempts: 5
	});

	socket.on('connect', () => {
		// Rejoin session room if session exists
		const sessionId = typeof window !== 'undefined' ? localStorage.getItem('chatSessionId') : null;

		if (sessionId) {
			socket!.emit('join', sessionId);
		}
	});

	socket.on('disconnect', () => {
		// Optionally handle disconnect
	});

	socket.on('connect_error', (error) => {
		// Optionally handle connection error
		console.error('[Socket] Connection error:', error);
	});

	return socket;
}

export function getSocket() {
	return socket;
}

export function joinSessionRoom(sessionId: string) {
	if (!socket) return;

	socket.emit('join', sessionId);
}

export function leaveSessionRoom(sessionId: string) {
	if (!socket) return;

	socket.emit('leave', sessionId);
}

export function setupReconnectionHandler(onReconnect?: () => void) {
	if (!socket) return;

	socket.on('reconnect', () => {
		const sessionId = typeof window !== 'undefined' ? localStorage.getItem('chatSessionId') : null;

		if (sessionId) {
			socket!.emit('join', sessionId);
		}

		onReconnect?.();
	});
	socket.on('reconnect_failed', () => {
		// Optionally handle reconnection failure
	});
}
