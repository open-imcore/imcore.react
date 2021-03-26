import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface DebugState {
    showDevtools: boolean;
    privacy: boolean;
}

const initialState: DebugState = {
    showDevtools: false,
    privacy: false
}

export const debugSlice = createSlice({
    name: 'debug',
    initialState,
    reducers: {
        setShowDevtools: (debug, { payload }: PayloadAction<boolean>) => {
            debug.showDevtools = payload;
        },
        setPrivacyMode: (debug, { payload }: PayloadAction<boolean>) => {
            debug.privacy = payload;
        }
    }
})

export const { setShowDevtools, setPrivacyMode } = debugSlice.actions;

export const selectShowingDevtools = (state: RootState) => state.debug.showDevtools;
export const selectIsPrivacyMode = (state: RootState) => state.debug.privacy;

export default debugSlice.reducer