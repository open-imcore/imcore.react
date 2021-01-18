import { AnyChatItemModel, ChatItemType, EventType, IMWebSocketClient, MessageRepresentation } from 'imcore-ajax-core'
import { chatChanged, chatDeleted } from "./reducers/chats"
import { messagesChanged, messagesDeleted } from "./reducers/messages"

export const socketClient = new IMWebSocketClient("ws://127.0.0.1:8090/stream")

socketClient.on(EventType.conversationCreated, chatChanged)
socketClient.on(EventType.conversationChanged, chatChanged)
socketClient.on(EventType.conversationRemoved, ({ chat }) => chatDeleted(chat))

function receiveItems(items: AnyChatItemModel[]) {
    const messages: MessageRepresentation[] = items.filter(item => item.type === ChatItemType.message).map(item => item.payload) as MessageRepresentation[]

    messagesChanged(messages)
}

socketClient.on(EventType.itemsReceived, ({ items }) => receiveItems(items))
socketClient.on(EventType.itemsUpdated, ({ items }) => receiveItems(items))
socketClient.on(EventType.itemsRemoved, ({ messages }) => messagesDeleted(messages))