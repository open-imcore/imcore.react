import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatItemType, ItemStatusChangedEvent, MessageRepresentation } from "imcore-ajax-core";
import { RootState } from "../store";

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
            for (const message of messages) {
                const messageStorage = state.messages[message.chatID] ?? (state.messages[message.chatID] = {});

                messageStorage[message.id] = message;

                for (const item of message.items) {
                    switch (item.type) {
                        case ChatItemType.acknowledgment:
                            const [ , messageID ] = item.payload.associatedID.split("/");

                            if (!messageStorage[messageID]) continue;
                            const associatedItem = messageStorage[messageID].items.find(messageItem => messageItem.payload.id === messageID);
                            if (!associatedItem) continue;

                            switch (associatedItem.type) {
                                case ChatItemType.text:
                                case ChatItemType.attachment:
                                case ChatItemType.plugin:
                                    if (!associatedItem.payload.acknowledgments) associatedItem.payload.acknowledgments = [];
                                    associatedItem.payload.acknowledgments.push(item.payload);
                            }
                    }
                }
            }

            Object.assign(state.messageToChatID, messages.reduce((acc, { id, chatID }) => Object.assign(acc, {
                [id]: chatID
            }), {}));
        },
        messagesDeleted: (state, { payload: messageIDs }: PayloadAction<string[]>) => {
            for (const messageID of messageIDs) {
                const chatID = state.messageToChatID[messageID];
                if (!chatID || !state.messages[chatID]) return;
                delete state.messages[chatID][messageID];
            }
        },
        statusChanged(state, { payload: { chatID, id, timeDelivered, timePlayed, timeRead, time } }: PayloadAction<ItemStatusChangedEvent>) {
            console.log({
                chatID, id, time, timeDelivered, timeRead, timePlayed
            })
        }
    }
});

export const { messagesChanged, messagesDeleted, statusChanged } = messagesSlice.actions;

export const selectMessages = (state: RootState) => state.messages.messages

export default messagesSlice.reducer;