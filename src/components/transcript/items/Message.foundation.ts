import { ChatRepresentation, MessageRepresentation } from "imcore-ajax-core"
import { ChatStyle } from "../../chat/ChatBubble"
import { isChatItem } from "./IMChatItem"
import { extractAcknowledgments } from "./IMChatItem.Foundation"

export interface MessageAnalysis {
    beginningContiguous: boolean;
    endingContiguous: boolean;
    showImage: boolean;
    showName: boolean;
}

export function messagesAreContiguous(message: MessageRepresentation, nextMessage: MessageRepresentation) {
    if (message.sender !== nextMessage.sender) return false
    if (!message.items.concat(nextMessage.items).every(isChatItem)) return false
    
    if (Math.abs(message.time - nextMessage.time) < (1000 * 60)) {
        return !nextMessage.items.some(item => extractAcknowledgments(item).length > 0)
    } else return false
}

export interface MessageAnalysisRequest {
    message: MessageRepresentation;
    chat: ChatRepresentation;
    nextMessage?: MessageRepresentation;
    prevMessage?: MessageRepresentation;
}

export function analyzeMessage({ message, chat, nextMessage, prevMessage }: MessageAnalysisRequest): MessageAnalysis {
    const beginningContiguous = prevMessage ? messagesAreContiguous(prevMessage, message) : false
    const endingContiguous = nextMessage ? messagesAreContiguous(message, nextMessage) : false

    return {
        beginningContiguous,
        endingContiguous,
        showImage: chat?.style === ChatStyle.group && !message.fromMe && !endingContiguous,
        showName: chat?.style === ChatStyle.group && !message.fromMe && !beginningContiguous && (prevMessage ? prevMessage.sender !== message.sender : true)
    }
}