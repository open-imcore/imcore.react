import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatConfigurationRepresentation, ChatItemType, ChatRepresentation, MessageRepresentation, ParticipantsChangedEvent } from "imcore-ajax-core";
import { RootState } from "../store";

interface ChatState {
    byID: Record<string, ChatRepresentation>;
    typingStatus: Record<string, boolean>;
}

const initialState: ChatState = {
    byID: {},
    typingStatus: {}
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
    name: "chats",
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
            for (const { chatID, description, time, items } of messages) {
                if (!chats.byID[chatID]) continue;
                if (time <= chats.byID[chatID].lastMessageTime) continue;

                const isTyping = items.some(item => item.type === ChatItemType.typing);

                chats.typingStatus[chatID] = isTyping;

                if (!items.some(item => acceptedLastMessageTypes.includes(item.type))) continue;

                Object.assign(chats.byID[chatID], {
                    lastMessage: description,
                    lastMessageTime: time
                } as Partial<ChatRepresentation>);
            }
        },
        setTypingStatus: (chats, { payload: { chatID, typing } }: PayloadAction<{ chatID: string; typing: boolean; }>) => {
            chats.typingStatus[chatID] = typing;
        },
        chatPropertiesChanged: (chats, { payload: { id, ...properties } }: PayloadAction<ChatConfigurationRepresentation>) => {
            if (!chats.byID[id]) return;

            Object.assign(chats.byID[id], properties);
        },
        chatParticipantsUpdated: (chats, { payload: { chat, handles } }: PayloadAction<ParticipantsChangedEvent>) => {
            if (!chats.byID[chat]) return;

            chats.byID[chat].participants = handles;
        }
    }
});

export const { chatsChanged, setTypingStatus, chatChanged, chatDeleted, chatMessagesReceived, chatPropertiesChanged, chatParticipantsUpdated } = chatSlice.actions;

export const selectChats = (state: RootState) => state.chats.byID;
export const selectTypingStatus = (state: RootState, chatID: string) => state.chats.typingStatus[chatID] || false;

export default chatSlice.reducer;