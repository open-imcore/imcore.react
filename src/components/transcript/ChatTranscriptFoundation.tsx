import { AnyChatItemModel, ChatRepresentation, MessageRepresentation } from "imcore-ajax-core"
import { createContext, useEffect, useMemo, useRef } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router"
import { apiClient } from "../../app/connection"
import { chatMessagesReceived, selectChats } from "../../app/reducers/chats"
import { messagesChanged, selectMessages } from "../../app/reducers/messages"
import { store } from "../../app/store"
import { isChatItem } from "./items/IMChatItem"
import { DATE_SEPARATOR_TYPE, isTranscriptItem } from "./items/IMTranscriptItem"
import { messageIsEmpty } from "./items/Message"

export async function reload(chatID: string, before?: string) {
    const recentMessages = await apiClient.chats.fetchRecentMessages(chatID, {
        limit: 100,
        before
    })
    
    store.dispatch(messagesChanged(recentMessages))
    store.dispatch(chatMessagesReceived(recentMessages))
}

export const ChatContext = createContext<{ chat: ChatRepresentation | null }>({ chat: null });

function messageCanRender(message: MessageRepresentation): boolean {
    return message.items.some(item => isChatItem(item) || isTranscriptItem(item))
}

function messagesAreCloseEnough(message1: MessageRepresentation, message2: MessageRepresentation): boolean {
    return Math.abs(message1.time - message2.time) < (1000 * 60 * 60);
}

const TIMESTAMP_ASSOCIATION: keyof MessageRepresentation = Symbol("TIMESTAMP_ASSOCIATION") as unknown as keyof MessageRepresentation;

function createTimestampMessage({ service, time, chatID, id }: MessageRepresentation): MessageRepresentation {
    return {
        service,
        time,
        timeDelivered: 0,
        timePlayed: 0,
        timeRead: 0,
        isSOS: false,
        isAudioMessage: false,
        isCancelTypingMessage: false,
        isDelivered: false,
        isTypingMessage: false,
        items: [
            {
                type: DATE_SEPARATOR_TYPE,
                payload: {
                    id: "",
                    chatID,
                    fromMe: false,
                    time
                }
            } as unknown as AnyChatItemModel
        ],
        fileTransferIDs: [],
        chatID,
        id: "",
        flags: 0,
        fromMe: false,
        [TIMESTAMP_ASSOCIATION]: id
    }
}

export function useMessages(chatID?: string, reverse = false): [MessageRepresentation[], () => Promise<void>] {
    const allMessages = useSelector(selectMessages)
    const reloading = useRef(false)

    const messages = allMessages[chatID || '']

    useEffect(() => {
        if (!messages && chatID) {
            reload(chatID)
        }
    }, [messages, chatID])

    const processedMessages = useMemo(() => {
        const arr = Object.values(messages || {}).filter(message => !messageIsEmpty(message)).sort((m1, m2) => m1.time - m2.time).flatMap((message, index, messages) => {
            const prevMessage = messages[index - 1];

            if (!prevMessage || !messagesAreCloseEnough(prevMessage, message)) return [createTimestampMessage(message), message];
            else return message;
        });
        if (reverse) arr.reverse()
        return arr
    }, [JSON.stringify(messages)]);

    return [
        processedMessages,
        async () => {
            if (!chatID) return;
            if (reloading.current) return;
            reloading.current = true;
            const lastMessage = processedMessages[reverse ? (processedMessages.length - 1) : 0];
            const lastMessageID = lastMessage.id || lastMessage[TIMESTAMP_ASSOCIATION] as string;
            await reload(chatID, lastMessageID);
            reloading.current = false;
        }
    ] as [MessageRepresentation[], () => Promise<void>]
}

export function useCurrentMessages(reverse = false) {
    const chat = useCurrentChat()

    return useMessages(chat?.id, reverse)
}

export function useCurrentChat(): ChatRepresentation | undefined {
    const { chatID } = useParams<{
        chatID: string
    }>();

    return useSelector(selectChats)[chatID]
}