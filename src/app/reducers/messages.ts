import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessageRepresentation } from "imcore-ajax-core";

interface MessagesState {
    messages: Record<string, Record<string, MessageRepresentation>>;
    messageToChatID: Record<string, string>;
}

const initialState: MessagesState = {
    messages: {},
    messageToChatID: {}
}

export const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        messagesChanged: (state, { payload: messages }: PayloadAction<MessageRepresentation[]>) => {
            messages.forEach(message => {
                (state.messages[message.chatID] ?? (state.messages[message.chatID] = {}))[message.id] = message;
            });

            Object.assign(state.messageToChatID, messages.reduce((acc, { id, chatID }) => Object.assign(acc, {
                [id]: chatID
            }), {}));
        },
        messagesDeleted: (state, { payload: messageIDs }: PayloadAction<string[]>) => {
            messageIDs.forEach(messageID => {
                const chatID = state.messageToChatID[messageID];
                if (!chatID || !state.messages[chatID]) return;
                delete state.messages[chatID][messageID];
            });
        }
    }
});

export const { messagesChanged, messagesDeleted } = messagesSlice.actions;

export default messagesSlice.reducer;