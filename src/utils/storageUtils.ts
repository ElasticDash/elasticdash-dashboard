const STORAGE_KEYS = {
  SESSION_ID: 'chatSessionId',
  CONVERSATION_ID: 'chatConversationId',
  CHAT_HISTORY: 'chatHistory',
  AUTH_TOKEN: 'authToken',
  USER_ID: 'userId',
};

export function saveSession(sessionId?: string | null, conversationId?: string | null) {
  if (sessionId) localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  if (conversationId) localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, conversationId);
}

export function getSession() {
  return {
    sessionId: localStorage.getItem(STORAGE_KEYS.SESSION_ID),
    conversationId: localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID),
  };
}

export function saveChatHistory(history: any[]) {
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
}

export function getChatHistory() {
  const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
  return saved ? JSON.parse(saved) : [];
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  localStorage.removeItem(STORAGE_KEYS.CONVERSATION_ID);
  localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function getAuthToken() {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function setUserId(userId: string) {
  localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
}

export function getUserId() {
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
}
