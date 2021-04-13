import { createSlice } from "@reduxjs/toolkit";
import IMMakeLog from "../../util/log";
import { RootState } from "../store";

interface PresenceState {
    tabIsActive: boolean;
}

const initialState: PresenceState = {
    tabIsActive: true
};

const Log = IMMakeLog("Redux/Presences", "debug");

export const presenceSlice = createSlice({
    name: "presence",
    initialState,
    reducers: {
        visibilityChanged: (presence) => {
            const isActive = document.visibilityState === "visible";

            if (isActive !== presence.tabIsActive) Log.debug("Presence changed to %d", isActive);

            presence.tabIsActive = isActive;
        }
    }
});

export const { visibilityChanged } = presenceSlice.actions;

export const selectVisibilityState = (state: RootState) => state.presence.tabIsActive;

export default presenceSlice.reducer;