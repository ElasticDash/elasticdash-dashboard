import { useCallback, useState, useEffect } from 'react';
import { useChats } from '../../api/hooks/chats/useChats';
import { MessengerPanelContext } from './MessengerPanelContext';

export function MessengerPanelContextProvider({ children }: { children: React.ReactNode }) {
	const [selectedChatId, setSelectedChatId] = useState('');
	const { data: chatList } = useChats();

	// Select the top chat by default if none is selected
	useEffect(() => {
		if (chatList && chatList.length > 0 && !selectedChatId) {
			setSelectedChatId(chatList[0].id);
		}
	}, [chatList, selectedChatId]);
	const [open, setOpen] = useState(false);

	const removeSelectedChatId = useCallback(() => {
		setSelectedChatId('');
	}, []);

	const toggleChatPanel = useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	const openChatPanel = useCallback(() => {
		setOpen(true);
	}, []);

	const closeChatPanel = useCallback(() => {
		setOpen(false);
	}, []);

	const value = {
		selectedChatId,
		open,
		setSelectedChatId,
		removeSelectedChatId,
		toggleChatPanel,
		openChatPanel,
		closeChatPanel
	};

	return <MessengerPanelContext.Provider value={value}>{children}</MessengerPanelContext.Provider>;
}
