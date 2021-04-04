import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface PresenceState {
    tabIsActive: boolean;
    hoveringOverMessageID: string | null;
    hoveringOverChatItemID: string | null;
    hoveringOverChatID: string | null;
}

const initialState: PresenceState = {
    tabIsActive: true,
    hoveringOverMessageID: null,
    hoveringOverChatItemID: null,
    hoveringOverChatID: null
};

export const presenceSlice = createSlice({
    name: "presence",
    initialState,
    reducers: {
        visibilityChanged: (presence) => {
            presence.tabIsActive = document.visibilityState === "visible";
        },
        messageChanged: (presence, { payload: messageID }: PayloadAction<string | null>) => {
            presence.hoveringOverMessageID = messageID;
        },
        chatItemChanged: (presence, { payload: { messageID, chatItemID } }: PayloadAction<{ messageID: string | null, chatItemID: string | null }>) => {
            presence.hoveringOverMessageID = messageID;
            if (!messageID || (chatItemID && !chatItemID.endsWith(messageID))) chatItemID = null;
            else if (messageID && !chatItemID) chatItemID = presence.hoveringOverChatItemID;
            presence.hoveringOverChatItemID = chatItemID;
        },
        chatChanged: (presence, { payload: chatID }: PayloadAction<string | null>) => {
            presence.hoveringOverChatID = chatID;
        }
    }
});

export const { visibilityChanged, messageChanged, chatChanged, chatItemChanged } = presenceSlice.actions;

export const selectVisibilityState = (state: RootState) => state.presence.tabIsActive;
export const selectHoveringOverMessageID = (state: RootState) => state.presence.hoveringOverMessageID;
export const selectHoveringOverChatID = (state: RootState) => state.presence.hoveringOverChatID;
export const selectHoveringOverChatItemID = (state: RootState) => state.presence.hoveringOverChatItemID;

export default presenceSlice.reducer;