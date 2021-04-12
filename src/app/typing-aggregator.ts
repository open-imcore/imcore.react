import { ChatItemType, MessageRepresentation } from "imcore-ajax-core";
import { batch } from "react-redux";
import IMMakeLog from "../util/log";
import { setTypingStatus } from "./reducers/chats";
import { messagesDeleted } from "./reducers/messages";
import { store } from "./store";

const isTypingMessage = (message: MessageRepresentation) => message.isTypingMessage || message.items.some(item => item.type === ChatItemType.typing);

const Log = IMMakeLog("TypingAggregator", "debug");

/**
 * Manages the state of typing messages, expiring them and invalidating old ones as new ones arrive
 */
export default class TypingAggregator {
    public static sharedInstance = new TypingAggregator();

    private chats: Map<string, string | null> = new Map();
    private timeouts: Map<string, ReturnType<typeof setTimeout> | null> = new Map();

    public messageReceived(message: MessageRepresentation) {
        if (!isTypingMessage(message)) return;

        const oldMessage = this.typingMessageForChat(message.chatID);

        if (oldMessage) {
            if (oldMessage.time > message.time) return;
            Log.info("Expiring dead typing message with ID %s in chta %s", oldMessage.id, oldMessage.chatID);
            store.dispatch(messagesDeleted([oldMessage.id]));
        }

        this.chats.set(message.chatID, message.id);

        if (this.timeouts.has(message.chatID)) clearTimeout(this.timeouts.get(message.chatID)!);
        
        this.timeouts.set(message.chatID, setTimeout(() => {
            if (this.typingMessageForChat(message.chatID)?.id === message.id) {
                batch(() => {
                    store.dispatch(messagesDeleted([message.id]));
                    store.dispatch(setTypingStatus({ chatID: message.chatID, typing: false }));
                });
                
                this.chats.delete(message.chatID);
            }

            this.timeouts.delete(message.chatID);
        }, 30000));
    }

    public messagesReceived(messages: MessageRepresentation[]) {
        for (const message of messages) {
            this.messageReceived(message);
        }
    }

    private typingMessageForChat(chatID: string): MessageRepresentation | null {
        if (!this.chats.get(chatID)) return null;
        const typingMessageID = this.chats.get(chatID)!;

        const message = store.getState().messages.messages[chatID]?.[typingMessageID];

        if (!message) return null;

        if (!isTypingMessage(message)) {
            this.chats.set(chatID, null);
            return null;
        }

        return message;
    }
}
