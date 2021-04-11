import { AnyChatItemModel, ChatItemType, ChatRepresentation, ContactRepresentation, MessageRepresentation } from "imcore-ajax-core";
import { selectHandleIDToContact } from "../app/reducers/contacts";
import { store } from "../app/store";
import { splitPartIDIntoParts } from "../util/imcore";

export enum IMEntityType {
    message = "message",
    item = "item",
    chat = "chat",
    contact = "contact"
}

function messageWithID(id: string): MessageRepresentation | null {
    const messageStore = store.getState().messages;

    return messageStore.messages[messageStore.messageToChatID[id]]?.[id] || null;
}

function chatWithMessageID(id: string): ChatRepresentation | null {
    const state = store.getState();

    const chatID = state.messages.messageToChatID[id];

    return state.chats.byID[chatID] || null;
}

function chatWithID(id: string): ChatRepresentation | null {
    const chatStore = store.getState().chats;

    return chatStore.byID[id] || null;
}

function contactWithHandleID(id: string): ContactRepresentation | null {
    const ledger = selectHandleIDToContact(store.getState());

    return ledger[id] || null;
}

function contactWithID(id: string): ContactRepresentation | null {
    const contactStore = store.getState().contacts;

    return contactStore.byID[id] || null;
}

export class IMURI {
    public static forItem(id: string) {
        return new IMURI(id, IMEntityType.item);
    }

    public static fromItem(item: AnyChatItemModel) {
        if (item.type === ChatItemType.message) return IMURI.fromMessage(item.payload);
        else return IMURI.forItem(item.payload.id);
    }

    public static forMessage(id: string) {
        return new IMURI(id, IMEntityType.message);
    }

    public static fromMessage(message: MessageRepresentation) {
        return IMURI.forMessage(message.id);
    }

    public static forChat(id: string) {
        return new IMURI(id, IMEntityType.chat);
    }

    public static fromChat(chat: ChatRepresentation) {
        return IMURI.forChat(chat.id);
    }

    public static forContact(id: string) {
        return new IMURI(id, IMEntityType.contact);
    }

    public static fromContact(contact: ContactRepresentation) {
        return IMURI.forContact(contact.id);
    }

    public static fromRaw(uri: string) {
        const [ , type, id ] = uri.split("|");

        return new IMURI(id, type as IMEntityType);
    }

    public constructor(public id: string, public type: IMEntityType) {

    }

    public get rawItem(): AnyChatItemModel | null {
        if (!this.isItem) return null;

        return this.message?.items.find(item => item.payload.id === this.id) || null;
    }

    public get item(): AnyChatItemModel["payload"] | null {
        return this.rawItem?.payload || null;
    }

    public get message(): MessageRepresentation | null {
        switch (this.type) {
            case IMEntityType.message:
                return messageWithID(this.id);
            case IMEntityType.item:
                return messageWithID(this.messageID);
            default:
                return null;
        }
    }

    private get messageID(): string {
        return splitPartIDIntoParts(this.id)[1];
    }

    public get chat(): ChatRepresentation | null {
        switch (this.type) {
            case IMEntityType.chat:
                return chatWithID(this.id);
            case IMEntityType.message:
            case IMEntityType.item:
                return chatWithMessageID(this.messageID);
            default:
                return null;
        }
    }

    public get contact(): ContactRepresentation | null {
        switch (this.type) {
            case IMEntityType.contact:
                return contactWithID(this.id);
            case IMEntityType.item:
            case IMEntityType.message:
                const message = this.message;
                if (!message?.sender) return null;
                return contactWithHandleID(message.sender);
            default:
                return null;
        }
    }

    public get isItem(): boolean {
        return this.type === IMEntityType.item;
    }

    public get isMessage(): boolean {
        return this.type === IMEntityType.message;
    }

    public get isChat(): boolean {
        return this.type === IMEntityType.chat;
    }

    public get isContact(): boolean {
        return this.type === IMEntityType.contact;
    }

    public toString(): string {
        return `imcore|${this.type}|${this.id}`;
    }
}