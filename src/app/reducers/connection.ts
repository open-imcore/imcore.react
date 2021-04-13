import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface ConnectionState {
    bootstrapped: boolean;
}

const initialState: ConnectionState = {
    bootstrapped: false
};

export const connectionSlice = createSlice({
    name: "connection",
    initialState,
    reducers: {
        receivedBootstrap: (connection) => {
            connection.bootstrapped = true;
        }
    }
});

export const { receivedBootstrap } = connectionSlice.actions;

export const selectBootstrapState = (state: RootState) => state.connection.bootstrapped;

export default connectionSlice.reducer;