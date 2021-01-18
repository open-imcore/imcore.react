import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatRepresentation } from 'imcore-ajax-core'

interface ChatState {
    chats: Record<string, ChatRepresentation>;
}

const initialState: ChatState = {
    chats: {}
};

export const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        chatsChanged: (state, { payload: chats }: PayloadAction<ChatRepresentation[]>) => {
            chats.forEach(chat => state.chats[chat.id] = chat);
        },
        chatChanged: (state, { payload: chat }: PayloadAction<ChatRepresentation>) => {
            state.chats[chat.id] = chat;
        },
        chatDeleted: (state, { payload: chatID }: PayloadAction<string>) => {
            delete state.chats[chatID];
        }
    }
});

export const { chatsChanged, chatChanged, chatDeleted } = chatSlice.actions;

export default chatSlice.reducer;