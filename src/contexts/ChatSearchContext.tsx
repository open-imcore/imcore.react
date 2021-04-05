import { ChatRepresentation } from "imcore-ajax-core";
import React, { createContext, PropsWithChildren, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { selectChats } from "../app/reducers/chats";
import { selectHandleIDToContact } from "../app/reducers/contacts";

export interface ChatSearchContextData {
    searchCriteria?: string;
    chatResults: ChatRepresentation[];
    setSearchCriteria: (criteria: string) => void;
    clearSearchCriteria: () => void;
}

export const ChatSearchContext = createContext<ChatSearchContextData>({
    chatResults: [],
    setSearchCriteria: () => undefined,
    clearSearchCriteria: () => undefined
});

export function ChatSearchProvider({ children }: PropsWithChildren<{}>) {
    const allChats = Object.values(useSelector(selectChats));
    const contacts = useSelector(selectHandleIDToContact);

    const [ searchCriteria, internalSetSearchCriteria ] = useState<string>();
    const [ chatResults, setChatResults ] = useState<ChatRepresentation[]>();

    const setSearchCriteria = (searchCriteria: string | undefined) => {
        internalSetSearchCriteria(searchCriteria);

        if (!searchCriteria) setChatResults(allChats.slice());
        else {
            setChatResults(allChats.filter(chat => {
                return [chat.displayName, chat.id, chat.lastMessage, chat.participants, chat.participants.map(participant => contacts[participant]?.fullName)].flat().some(text => text?.toLowerCase().includes(searchCriteria));
            }));
        };
    };

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