import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

function localBoolean(key: string, defaultValue: boolean): boolean {
    switch (localStorage.getItem(key)) {
        case "true":
            return true
        case "false":
            return false
        default:
            return defaultValue
    }
}

interface DebugState {
    showDevtools: boolean;
    privacy: boolean;
    invertedScrolling: boolean;
}

const initialState: DebugState = {
    showDevtools: false,
    privacy: false,
    invertedScrolling: localBoolean("use-inverted-scrolling", false)
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
        },
        setInvertedScrolling: (debug, { payload }: PayloadAction<boolean>) => {
            debug.invertedScrolling = payload;
            localStorage.setItem("use-inverted-scrolling", payload.toString());
        }
    }
})

export const { setShowDevtools, setPrivacyMode, setInvertedScrolling } = debugSlice.actions;

export const selectShowingDevtools = (state: RootState) => state.debug.showDevtools;
export const selectIsPrivacyMode = (state: RootState) => state.debug.privacy;
export const selectUseInvertedScrolling = (state: RootState) => state.debug.invertedScrolling;

export default debugSlice.reducer