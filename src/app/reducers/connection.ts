import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getPersistentValue } from "react-use-persistent";
import { RootState } from "../store";

interface ConnectionState {
    bootstrapped: boolean;
    token: string;
}

const initialState: ConnectionState = {
    bootstrapped: false,
    token: ""
};

const persistentConfig = {
    token: getPersistentValue("imcore-token", "")
};

export const connectionSlice = createSlice({
    name: "connection",
    initialState,
    reducers: {
        receivedBootstrap: (connection) => {
            connection.bootstrapped = true;
        },
        tokenChanged: (connection, { payload }: PayloadAction<string>) => {
            connection.token = persistentConfig.token.value = payload;
        }
    }
});

export const { receivedBootstrap, tokenChanged } = connectionSlice.actions;

export const selectBootstrapState = (state: RootState) => state.connection.bootstrapped;

export default connectionSlice.reducer;