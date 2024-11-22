import { createSelector } from 'reselect';

const getIsChatHistoryLoadedState = state => state.chat.isLoadedChatHistory;
const getMessageHistory = state => state.chat.messages;
const getNewMessage = state => state.chat.message;

export default createSelector([
    getIsChatHistoryLoadedState,
    getMessageHistory,
    getNewMessage
], (isLoadedChatHistory, messages, message) => ({
    isLoadedChatHistory,
    messages,
    message
}));
