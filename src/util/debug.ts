import { getPersistentValue } from "react-use-persistent";
import * as Connection from "../app/connection";
import * as Store from "../app/store";

Object.assign(window, {
    Connection,
    Store,
    getPersistentValue
});

Object.defineProperties(window, {
    apiClient: {
        get() {
            return Connection.apiClient;
        }
    },
    socketClient: {
        get() {
            return Connection.socketClient;
        }
    },
    state: {
        get() {
            return Store.store.getState();
        }
    }
});