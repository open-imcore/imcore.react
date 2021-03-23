import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatConfigurationRepresentation, ChatItemRepresentation, ChatItemType, ChatRepresentation, MessageRepresentation } from 'imcore-ajax-core'
import { RootState } from "../store";

interface ChatState {
    byID: Record<string, ChatRepresentation>;
}

const initialState: ChatState = {
    byID: {}
};

const acceptedLastMessageTypes = [
    ChatItemType.acknowledgment,
    ChatItemType.associated,
    ChatItemType.plugin,
    ChatItemType.sticker,
    ChatItemType.attachment,
    ChatItemType.text
];

export const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        chatsChanged: (chats, { payload: newChats }: PayloadAction<ChatRepresentation[]>) => {
            newChats.forEach(chat => chats.byID[chat.id] = chat);
        },
        chatChanged: (chats, { payload: chat }: PayloadAction<ChatRepresentation>) => {
            chats.byID[chat.id] = chat;
        },
        chatDeleted: (chats, { payload: chatID }: PayloadAction<string>) => {
            delete chats.byID[chatID];
        },
        chatMessagesReceived: (chats, { payload: messages }: PayloadAction<MessageRepresentation[]>) => {
            messages.forEach(({ chatID, description, time, items }) => {
                if (!chats.byID[chatID]) return;
                if (!items.some(item => acceptedLastMessageTypes.includes(item.type))) return;
                if (time < chats.byID[chatID].lastMessageTime) return;

                Object.assign(chats.byID[chatID], {
                    lastMessage: description,
                    lastMessageTime: time
                } as Partial<ChatRepresentation>)
            })
        },
        chatPropertiesChanged: (chats, { payload: { id, ...properties } }: PayloadAction<ChatConfigurationRepresentation>) => {
            if (!chats.byID[id]) return;

            Object.assign(chats.byID[id], properties)
        }
    }
});

export const { chatsChanged, chatChanged, chatDeleted, chatMessagesReceived, chatPropertiesChanged } = chatSlice.actions;

export const selectChats = (state: RootState) => state.chats.byID;

export default chatSlice.reducer;