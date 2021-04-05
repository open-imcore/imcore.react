import { AnyChatItemModel, MessageRepresentation } from "imcore-ajax-core";
import { DATE_SEPARATOR_TYPE } from "../components/transcript/items/IMTranscriptItem";
import { messageIsEmpty } from "../components/transcript/items/Message";

export function messagesAreCloseEnough(message1: MessageRepresentation, message2: MessageRepresentation): boolean {
    return Math.abs(message1.time - message2.time) < (1000 * 60 * 60);
}

export const TIMESTAMP_ASSOCIATION: keyof MessageRepresentation = Symbol("TIMESTAMP_ASSOCIATION") as unknown as keyof MessageRepresentation;

export function createTimestampMessage({ service, time, chatID, id }: MessageRepresentation): MessageRepresentation {
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
        id: `${id}--timesep`,
        flags: 0,
        fromMe: false,
        [TIMESTAMP_ASSOCIATION]: id
    };
}

export function prepareMessagesForPresentation(messages: Record<string, MessageRepresentation>, reverse: boolean, injectTimestamps: boolean): MessageRepresentation[] {
    const preparedMessages: MessageRepresentation[] = [];

    for (const messageID in messages) {
        if (messageIsEmpty(messages[messageID])) continue;
        preparedMessages.push(messages[messageID]);
    }

    preparedMessages.sort((m1, m2) => {
        if (m1.isTypingMessage) return 1;
        else if (m2.isTypingMessage) return -1;

        return m1.time - m2.time;
    });

    if (injectTimestamps) {
        for (let i = 0; i < preparedMessages.length; i++) {
            const message = preparedMessages[i];

            if (message.isTypingMessage || message[TIMESTAMP_ASSOCIATION]) continue;

            const prevMessage = preparedMessages[i - 1];

            if (prevMessage && messagesAreCloseEnough(prevMessage, message)) continue;

            preparedMessages.splice(i, 0, createTimestampMessage(message));
        }
    }

    if (reverse) preparedMessages.reverse();

    return preparedMessages;
}
