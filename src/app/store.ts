import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import chatReducer from './reducers/chats'
import messagesReducer from './reducers/messages'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    chats: chatReducer,
    messages: messagesReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
