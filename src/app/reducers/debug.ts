import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getPersistentValue } from "react-use-persistent";
import { RootState } from "../store";

interface DebugState {
    showDevtools: boolean;
    privacy: boolean;
    invertedScrolling: boolean;
}

const persistentConfig = {
    showDevtools: getPersistentValue("showing-devtools", false),
    invertedScrolling: getPersistentValue("use-inverted-scrolling", false)
};

const initialState: DebugState = {
    showDevtools: persistentConfig.showDevtools.value,
    privacy: false,
    invertedScrolling: persistentConfig.invertedScrolling.value
};

export const debugSlice = createSlice({
    name: "debug",
    initialState,
    reducers: {
        setShowDevtools: (debug, { payload }: PayloadAction<boolean>) => {
            debug.showDevtools = persistentConfig.showDevtools.value = payload;
        },
        setPrivacyMode: (debug, { payload }: PayloadAction<boolean>) => {
            debug.privacy = payload;
        },
        setInvertedScrolling: (debug, { payload }: PayloadAction<boolean>) => {
            debug.invertedScrolling = persistentConfig.invertedScrolling.value = payload;
        }
    }
});

export const { setShowDevtools, setPrivacyMode, setInvertedScrolling } = debugSlice.actions;

export const selectShowingDevtools = (state: RootState) => state.debug.showDevtools;
export const selectIsPrivacyMode = (state: RootState) => state.debug.privacy;
export const selectUseInvertedScrolling = (state: RootState) => state.debug.invertedScrolling;

export default debugSlice.reducer;