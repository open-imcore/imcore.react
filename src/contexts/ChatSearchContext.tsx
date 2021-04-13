import { ChatRepresentation, MessageRepresentation } from "imcore-ajax-core";
import debounce from "lodash.debounce";
import React, { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { apiClient } from "../app/connection";
import { selectChats } from "../app/reducers/chats";
import { messagesChanged } from "../app/reducers/messages";
import { store } from "../app/store";

export interface ChatSearchContextData {
    searchCriteria?: string;
    chatResults: ChatEntry[];
    setSearchCriteria: (criteria: string) => void;
    clearSearchCriteria: () => void;
}

export const ChatSearchContext = createContext<ChatSearchContextData>({
    chatResults: [],
    setSearchCriteria: () => undefined,
    clearSearchCriteria: () => undefined
});

export interface ChatEntry {
    chat: ChatRepresentation;
    sortKey: number;
    message?: MessageRepresentation;
}

async function runSearch(search: string): Promise<MessageRepresentation[]> {
    const messages = await apiClient.messages.search.single({
        search,
        limit: 100
    });

    store.dispatch(messagesChanged(messages));

    return messages;
}

export function ChatSearchProvider({ children }: PropsWithChildren<{}>) {
    const chatDictionary = useSelector(selectChats);
    const allChats: ChatEntry[] = useMemo(() => Object.values(chatDictionary).map(chat => ({ chat, sortKey: chat.lastMessageTime })), [chatDictionary]);
    const [ searchCriteria, setSearchCriteria ] = useState<string>();

    const [ chatResults, setChatResults ] = useState<ChatEntry[] | null>(null);

    const debouncedSearch = useCallback(debounce(async (searchCriteria: string | undefined, chats: Record<string, ChatRepresentation>) => {
        if (!searchCriteria) return setChatResults(null);
        
        const result = await runSearch(searchCriteria);

        setChatResults(result.map(message => ({ chat: chats[message.chatID], sortKey: message.time, message })).filter(({ chat }) => !!chat));
    }, 250), []);

    useEffect(() => {
        debouncedSearch(searchCriteria, chatDictionary);
    }, [searchCriteria]);

    const clearSearchCriteria = useCallback(() => {

    }, []);

    return (
        <ChatSearchContext.Provider value={{
            searchCriteria,
            chatResults: chatResults ? chatResults : allChats,
            setSearchCriteria,
            clearSearchCriteria
        }}>
            {children}
        </ChatSearchContext.Provider>
    );
}