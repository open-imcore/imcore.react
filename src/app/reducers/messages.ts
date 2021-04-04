import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AcknowledgmentChatItemRepresentation, AcknowledgmentType, ChatItemType, ItemStatusChangedEvent, MessageRepresentation } from "imcore-ajax-core";
import IMMakeLog from "../../util/log";
import { RootState } from "../store";

interface MessagesState {
    messages: Record<string, Record<string, MessageRepresentation>>;
    messageToChatID: Record<string, string>;
}

const initialState: MessagesState = {
    messages: {},
    messageToChatID: {}
};

const Log = IMMakeLog("Redux/Messages", "info");


export const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        messagesChanged: (state, { payload: messages }: PayloadAction<MessageRepresentation[]>) => {
            const acknowledgments: AcknowledgmentChatItemRepresentation[] = [];

            for (const message of messages) {
                const messageStorage = state.messages[message.chatID] ?? (state.messages[message.chatID] = {});

                messageStorage[message.id] = message;

                state.messageToChatID[message.id] = message.chatID;

                if (!message.associatedMessageID) continue;
                
                for (const item of message.items) {
                    switch (item.type) {
                        case ChatItemType.acknowledgment:
                            acknowledgments.push(item.payload);
                    }
                }
            }

            if (!acknowledgments.length) return;

            for (const acknowledgment of acknowledgments.sort((a1, a2) => a1.time - a2.time)) {
                const messageStorage = state.messages[acknowledgment.chatID] ?? (state.messages[acknowledgment.chatID] = {});
                const [ , messageID ] = acknowledgment.associatedID.split(acknowledgment.associatedID.includes("/") ? "/" : ":");

                if (!messageStorage[messageID]) {
                    Log.debug("Dropping dangling acknowledgment (ackID: %s, assID: %s)", acknowledgment.id, messageID);
                    continue;
                }
                
                const associatedItem = messageStorage[messageID].items.find(messageItem => messageItem.payload.id === acknowledgment.associatedID);
                if (!associatedItem) {
                    Log.debug("Dropping phantom acknowledgment (ackID: %s, assID: %s)", acknowledgment.id, messageID);
                    continue;
                }

                switch (associatedItem.type) {
                    case ChatItemType.text:
                    case ChatItemType.attachment:
                    case ChatItemType.plugin:
                        if (!associatedItem.payload.acknowledgments) associatedItem.payload.acknowledgments = [];
                        associatedItem.payload.acknowledgments = associatedItem.payload.acknowledgments.filter(ack => (acknowledgment.fromMe ? !ack.fromMe : true) && ack.id !== acknowledgment.id);

                        Log.debug("Received acknowledgment for message %s with type %d and id %s", messageID, acknowledgment.acknowledgmentType, acknowledgment.id);
                        associatedItem.payload.acknowledgments.push(acknowledgment);
                }
            }
        },
        messagesDeleted: (state, { payload: messageIDs }: PayloadAction<string[]>) => {
            for (const messageID of messageIDs) {
                const chatID = state.messageToChatID[messageID];
                if (!chatID || !state.messages[chatID]) return;
                delete state.messages[chatID][messageID];
            }
        },
        stopTyping: (state, { payload: messageID }: PayloadAction<string>) => {
            const chatID = state.messageToChatID[messageID];
            if (!chatID || !state.messages[chatID]?.[messageID]) return;
            const message = state.messages[chatID][messageID];

            if (message.items.some(item => item.type === ChatItemType.typing)) delete state.messages[chatID][messageID];
        },
        statusChanged(state, { payload: { chatID, id, timeDelivered, timePlayed, timeRead, time } }: PayloadAction<ItemStatusChangedEvent>) {
            console.log({
                chatID, id, time, timeDelivered, timeRead, timePlayed
            });
        },
        stageAcknowledgmentOverride: (state, { payload: { type, messageID, chatItemID } }: PayloadAction<{
            type: AcknowledgmentType,
            messageID: string,
            chatItemID: string
        }>) => {
            const chatID = state.messageToChatID[messageID];
            const chat = state.messages[chatID];
            if (!chat) return;

            const item = chat[messageID]?.items.find(item => item.payload.id === chatItemID);
            if (!item) return;

            if ("acknowledgments" in item.payload && item.payload.acknowledgments) {
                const oldFromMe = item.payload.acknowledgments.findIndex(ack => ack.fromMe);
                if (oldFromMe > -1) item.payload.acknowledgments.splice(oldFromMe, 1);
                if (type < 3000) item.payload.acknowledgments.push({
                    id: "...",
                    chatID,
                    fromMe: true,
                    time: Date.now(),
                    associatedID: chatItemID,
                    acknowledgmentType: type
                });
            }
        }
    }
});

export const { messagesChanged, messagesDeleted, statusChanged, stageAcknowledgmentOverride } = messagesSlice.actions;

export const selectMessages = (state: RootState) => state.messages.messages;

export default messagesSlice.reducer;