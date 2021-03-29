import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface PresenceState {
    tabIsActive: boolean;
}

const initialState: PresenceState = {
    tabIsActive: true
};

export const presenceSlice = createSlice({
    name: "presence",
    initialState,
    reducers: {
        visibilityChanged: (presence) => {
            presence.tabIsActive = document.visibilityState === "visible";
        }
    }
});

export const { visibilityChanged } = presenceSlice.actions;

export const selectVisibilityState = (state: RootState) => state.presence.tabIsActive;

export default presenceSlice.reducer;