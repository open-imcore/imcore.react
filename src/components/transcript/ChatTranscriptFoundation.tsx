import { ChatRepresentation, MessageRepresentation } from "imcore-ajax-core";
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { matchPath, useLocation } from "react-router";
import { apiClient, receiveMessages } from "../../app/connection";
import { selectChats } from "../../app/reducers/chats";
import { selectMessages } from "../../app/reducers/messages";
import IMMakeLog from "../../util/log";
import { prepareMessagesForPresentation, TIMESTAMP_ASSOCIATION } from "../../util/message-presentation";

const Log = IMMakeLog("ChatTranscriptFoundation", "info");

export async function reload(chatID: string, before?: string) {
    const recentMessages = await apiClient.chats.fetchRecentMessages(chatID, {
        limit: 100,
        before
    });

    Log.info("Received messages for chat %s from REST", chatID);

    isDoneLedger[chatID] = recentMessages.length <= 1;

    receiveMessages(recentMessages);
}

const loadingLedger: Record<string, boolean | undefined> = {};
const isDoneLedger: Record<string, boolean | undefined> = {};

export function useMessages(chatID?: string, reverse = false, injectTimestamps = true): [MessageRepresentation[], () => Promise<void>] {
    const allMessages = useSelector(selectMessages);

    const messages = allMessages[chatID || ""];

    useEffect(() => {
        if (!messages && chatID) {
            Log.info("Loading initial messages for chat %s", chatID);
            reload(chatID);
        }
    }, [messages, chatID]);

    const processedMessages = useMemo(() => prepareMessagesForPresentation(messages, reverse, injectTimestamps), [JSON.stringify(messages)]);

    return [
        processedMessages,
        useCallback(async () => {
            if (!chatID) return;
            if (loadingLedger[chatID] || isDoneLedger[chatID]) return;
            loadingLedger[chatID] = true;
            const lastMessage = processedMessages[reverse ? (processedMessages.length - 1) : 0];
            const lastMessageID = lastMessage[TIMESTAMP_ASSOCIATION] as string || lastMessage.id;
            await reload(chatID, lastMessageID);
            loadingLedger[chatID] = false;
        }, [processedMessages])
    ] as [MessageRepresentation[], () => Promise<void>];
}

export function useCurrentMessages(): [ MessageRepresentation[], () => Promise<void> ] {
    const { messages, loadMore } = useContext(MessagesContext);
    
    return [ messages, loadMore ];
}

export const ChatContext = createContext<{
    chat: ChatRepresentation | null;
    chatID: string | null;
}>({
    chat: null,
    chatID: null
});

export const MessagesContext = createContext<{
    messages: MessageRepresentation[];
    loadMore: () => Promise<void>;
}>({
    messages: [],
    loadMore: async () => undefined
});

export function useCurrentChat(): ChatRepresentation | null {
    return useContext(ChatContext).chat;
}

export function useCurrentChatID(): string | null {
    return useContext(ChatContext).chatID;
}

export function CurrentChatProvider({ children }: PropsWithChildren<{}>) {
    const { pathname } = useLocation();
    const chatID = useMemo(() => matchPath<{ chatID: string; }>(pathname, {
        path: "/chats/:chatID"
    })?.params.chatID || null, [pathname]);

    const chats = useSelector(selectChats);

    const chat = chatID ? chats[chatID] : null;

    useEffect(() => {
        Log.info("Chat changed to %s (has chat object: %d)", chatID, !!chat);
    }, [chatID]);

    return (
        <ChatContext.Provider value={{ chat, chatID }}>
            {children}
        </ChatContext.Provider>
    );
}

export function CurrentMessagesProvider({ children }: PropsWithChildren<{}>) {
    const chat = useCurrentChat();

    const [ messages, loadMore ] = useMessages(chat?.id!, true);

    return (
        <MessagesContext.Provider value={{ messages, loadMore }}>
            {children}
        </MessagesContext.Provider>
    );
}