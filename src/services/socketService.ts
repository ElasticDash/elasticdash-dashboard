// Socket.IO connection logic for chat async plan/approval integration
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

let socket: Socket | null = null;
let storageHandler: ((event: StorageEvent) => void) | null = null;

export function initSocket() {
	console.log('initSocket is triggered with api base url:', API_BASE_URL);
	const socketUrl = API_BASE_URL.replace('/api', ''); // Adjust if your API URL includes a path

	if (socket) return socket;

	socket = io(socketUrl, {
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

		const userId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('currentUser') || 'null')?.id : null;
		console.log('[Socket] Joining user room:', userId);

		if (userId) {
			socket!.emit('join', userId);
		}
	});

	// Listen for localStorage changes and join when data becomes available
	// Store handler reference for cleanup
	storageHandler = (event: StorageEvent) => {
		if (!socket) return;

		if (event.key === 'chatSessionId' && event.newValue) {
			socket.emit('join', event.newValue);
		}

		if (event.key === 'hb-user' && event.newValue) {
			try {
				const userId = JSON.parse(event.newValue)?.id;

				if (userId) {
					socket.emit('join', userId);
				}
			} catch (error) {
				console.error('Failed to parse hb-user from localStorage', error);
			}
		}
	};

	if (typeof window !== 'undefined') {
		window.addEventListener('storage', storageHandler);
	}

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

/**
 * Properly disconnect socket and clean up all event listeners
 * CRITICAL: Prevents memory leaks from accumulating storage event listeners
 */
export function disconnectSocket() {
	if (socket) {
		socket.disconnect();
		socket = null;
	}

	// Remove storage event listener to prevent memory leak
	if (storageHandler && typeof window !== 'undefined') {
		window.removeEventListener('storage', storageHandler);
		storageHandler = null;
	}
}
