import { AnyChatItemModel, ChatItemType, ChatRepresentation, ContactRepresentation, EventType, IMHTTPClient, IMWebSocketClient, MessageRepresentation } from 'imcore-ajax-core'
import { chatChanged, chatsChanged, chatDeleted, chatMessagesReceived, chatPropertiesChanged } from "./reducers/chats"
import { messagesChanged, messagesDeleted, statusChanged } from "./reducers/messages"
import { contactsChanged, contactChanged, contactDeleted, strangersReceived } from "./reducers/contacts"
import TypingAggregator from "./typing-aggregator";
import { store } from "./store"
import IMMakeLog from "../util/log"

const Log = IMMakeLog("IMServerConnection")

const endpoint = "192.168.86.200"

export const socketClient = new IMWebSocketClient(`ws://${endpoint}:8090/stream`)
export const apiClient = new IMHTTPClient({
    baseURL: `http://${endpoint}:8090`
})

function receiveChangedChat(chat: ChatRepresentation) {
    store.dispatch(chatChanged(chat))
}

socketClient.on(EventType.conversationCreated, receiveChangedChat)
socketClient.on(EventType.conversationChanged, receiveChangedChat)
socketClient.on(EventType.conversationRemoved, ({ chat }) => store.dispatch(chatDeleted(chat)))
socketClient.on(EventType.conversationDisplayNameChanged, receiveChangedChat)
socketClient.on(EventType.conversationJoinStateChanged, receiveChangedChat)
socketClient.on(EventType.conversationPropertiesChanged, conf => store.dispatch(chatPropertiesChanged(conf)))
socketClient.on(EventType.conversationUnreadCountChanged, receiveChangedChat)

export function receiveItems(items: AnyChatItemModel[]) {
    const messages: MessageRepresentation[] = items.filter(item => item.type === ChatItemType.message).map(item => item.payload) as MessageRepresentation[]

    store.dispatch(messagesChanged(messages))
    store.dispatch(chatMessagesReceived(messages))
    TypingAggregator.sharedInstance.messagesReceived(messages);
}

socketClient.on(EventType.itemsReceived, ({ items }) => receiveItems(items))
socketClient.on(EventType.itemsUpdated, ({ items }) => receiveItems(items))
socketClient.on(EventType.itemsRemoved, ({ messages }) => store.dispatch(messagesDeleted(messages)))

socketClient.on(EventType.itemStatusChanged, payload => store.dispatch(statusChanged(payload)));

function receiveContact(contact: ContactRepresentation) {
    store.dispatch(contactChanged(contact))
}

socketClient.on(EventType.contactCreated, receiveContact)
socketClient.on(EventType.contactUpdated, receiveContact)
socketClient.on(EventType.contactRemoved, c => store.dispatch(contactDeleted(c.id)))

socketClient.on(EventType.bootstrap, ({ chats, contacts, messages }) => {
    Log.info("Got bootstrap from event stream")
    store.dispatch(chatsChanged(chats))
    store.dispatch(contactsChanged(contacts.contacts))
    store.dispatch(strangersReceived(contacts.strangers))
})