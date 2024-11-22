import { createSelector } from 'reselect';

const getIsChatHistoryLoadedState = state => state.chats.isLoadingChatHistory;
const getMessageHistory = state => state.chats.messages;
const getNewMessage = state => state.chats.message;
const getNavbarParams = state => state.settings.navbarParams;
const getBadgeCount = state => state.notifications.badgeCount;

export default createSelector([
    getIsChatHistoryLoadedState,
    getMessageHistory,
    getNewMessage,
    getNavbarParams,
    getBadgeCount
], (isLoadingChatHistory, messages, message, navbarParams, badgeCount) => ({
    isLoadingChatHistory,
    messages,
    message,
    navbarParams,
    badgeCount
}));
