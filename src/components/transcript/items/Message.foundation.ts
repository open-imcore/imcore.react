import { ChatItemType, ChatRepresentation, MessageRepresentation } from "imcore-ajax-core";
import { ChatStyle } from "../../chat/ChatBubble";
import { isChatItem } from "./IMChatItem";
import { extractAcknowledgments } from "./IMChatItem.Foundation";

export interface MessageAnalysis {
    beginningContiguous: boolean;
    endingContiguous: boolean;
    showImage: boolean;
    showName: boolean;
}

function allItemsAreChatItems({ items }: MessageRepresentation) {
    for (const item of items) {
        if (!isChatItem(item)) return false;
    }

    return true;
}

export function itemsAreShallowEqual(message1: MessageRepresentation | undefined, message2: MessageRepresentation | undefined) {
    if ((!message1 && !message2) || !(message1 && message2)) return false;

    const { items: items1 } = message1, { items: items2 } = message2;

    if (items1.length !== items2.length) return false;
    // if (message1.flags !== message2.flags) return false;
    // if (message1.time !== message2.time) return false;
    if (message1.timeDelivered !== message2.timeDelivered) return false;
    if (message1.timeRead !== message2.timeRead) return false;
    if (message1.isDelivered !== message2.isDelivered) return false;

    for (let i = 0; i < items1.length; i++)  {
        const item1 = items1[i], item2 = items2[i];

        if (item1.type !== item2.type) return false;

        switch (item1.type) {
            /* eslint-disable */
            case ChatItemType.plugin:
                if (item1.payload && item2.payload) return false;
            case ChatItemType.text:
            case ChatItemType.attachment:
                if (!item1.payload.acknowledgments && !(item2 as typeof item1).payload.acknowledgments) continue;
                if (!item1.payload.acknowledgments || !(item2 as typeof item1).payload.acknowledgments) return false;
                const { acknowledgments: ack1 } = item1.payload, { acknowledgments: ack2 } = (item2 as typeof item1).payload
                if (ack1.length !== ack2!.length) return false;
                for (let i = 0; i < ack1.length; i++) {
                    const innerAck1 = ack1[i], innerAck2 = ack2![i];
                    if (innerAck1.id !== innerAck2.id) return false;
                    if (innerAck1.sender !== innerAck2.sender) return false;
                    if (innerAck1.acknowledgmentType !== innerAck2.acknowledgmentType) return false;
                    if (innerAck1.associatedID !== innerAck2.associatedID) return false;
                }
            /* eslint-enable */
        }
    }

    return true;
}

export function messagesAreContiguous(message: MessageRepresentation, nextMessage: MessageRepresentation) {
    if (message.sender !== nextMessage.sender) return false;
    if (!allItemsAreChatItems(message) || !allItemsAreChatItems(nextMessage)) return false;
    
    if (Math.abs(message.time - nextMessage.time) < (1000 * 60)) {
        for (const item of nextMessage.items) {
            if (extractAcknowledgments(item).length > 0) return false;
        }

        return true;
    } else return false;
}

export interface MessageAnalysisRequest {
    message: MessageRepresentation;
    chat: ChatRepresentation;
    nextMessage?: MessageRepresentation;
    prevMessage?: MessageRepresentation;
}

export function analyzeMessage({ message, chat, nextMessage, prevMessage }: MessageAnalysisRequest): MessageAnalysis {
    const beginningContiguous = prevMessage ? messagesAreContiguous(prevMessage, message) : false;
    const endingContiguous = nextMessage ? messagesAreContiguous(message, nextMessage) : false;

    return {
        beginningContiguous,
        endingContiguous,
        showImage: chat?.style === ChatStyle.group && !message.fromMe && !endingContiguous,
        showName: chat?.style === ChatStyle.group && !message.fromMe && !beginningContiguous && (prevMessage ? prevMessage.sender !== message.sender : true)
    };
}