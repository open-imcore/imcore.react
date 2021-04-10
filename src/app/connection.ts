import { AnyChatItemModel, ChatItemType, ChatRepresentation, ContactRepresentation, EventType, IMHTTPClient, IMWebSocketClient, IMWebSocketConnectionOptions, MessageRepresentation } from "imcore-ajax-core";
import IMMakeLog from "../util/log";
import { getPersistentValue } from "../util/use-persistent";
import { chatChanged, chatDeleted, chatMessagesReceived, chatParticipantsUpdated, chatPropertiesChanged, chatsChanged } from "./reducers/chats";
import { receivedBootstrap, tokenChanged } from "./reducers/connection";
import { contactChanged, contactDeleted, contactsChanged, strangersReceived } from "./reducers/contacts";
import { messagesChanged, messagesDeleted, statusChanged } from "./reducers/messages";
import { store } from "./store";
import TypingAggregator from "./typing-aggregator";

const Log = IMMakeLog("IMServerConnection", "info");

const imCoreHostConfig = getPersistentValue("imcore-host", "localhost:8090");
const imCoreTokenConfig = getPersistentValue("imcore-token", "");

const formatURL = (protocol: string, path?: string) => `${protocol}://${imCoreHostConfig.value}${path ? `/${path}` : ""}`;

export const apiClient = new IMHTTPClient({
    baseURL: formatURL("http"),
    token: imCoreTokenConfig.value,
});

export const socketClient = new IMWebSocketClient(formatURL("ws", "stream"), imCoreTokenConfig.value);

function rebuildEndpoints() {
    socketClient.url = formatURL("ws", "stream");
    socketClient.token = imCoreTokenConfig.value;
    apiClient.baseURL = formatURL("http");
    apiClient.token = imCoreTokenConfig.value;
}

export async function reconnect(options?: IMWebSocketConnectionOptions): Promise<void> {
    await socketClient.close();
    
    rebuildEndpoints();

    if (imCoreTokenConfig.value) {
        await apiClient.security.attachmentSession();
    }

    socketClient.connect(options);
}

export async function refreshToken(psk: string) {
    const token = await apiClient.security.token(psk, true);

    store.dispatch(tokenChanged(token));
}

function receiveChangedChat(chat: ChatRepresentation) {
    store.dispatch(chatChanged(chat));
}

socketClient.on(EventType.conversationCreated, receiveChangedChat);
socketClient.on(EventType.conversationChanged, receiveChangedChat);
socketClient.on(EventType.conversationRemoved, ({ chat }) => store.dispatch(chatDeleted(chat)));
socketClient.on(EventType.conversationDisplayNameChanged, receiveChangedChat);
socketClient.on(EventType.conversationJoinStateChanged, receiveChangedChat);
socketClient.on(EventType.conversationPropertiesChanged, conf => store.dispatch(chatPropertiesChanged(conf)));
socketClient.on(EventType.conversationUnreadCountChanged, receiveChangedChat);
socketClient.on(EventType.participantsChanged, ev => store.dispatch(chatParticipantsUpdated(ev)));

export function receiveMessages(messages: MessageRepresentation[]) {
    Log.debug("Received %d messages from server", messages.length);

    store.dispatch(messagesChanged(messages));
    store.dispatch(chatMessagesReceived(messages));
    TypingAggregator.sharedInstance.messagesReceived(messages);
}

export function receiveItems(items: AnyChatItemModel[]) {
    const messages: MessageRepresentation[] = items.filter(item => item.type === ChatItemType.message).map(item => item.payload) as MessageRepresentation[];

    receiveMessages(messages);
}

socketClient.on(EventType.itemsReceived, ({ items }) => receiveItems(items));
socketClient.on(EventType.itemsUpdated, ({ items }) => receiveItems(items));
socketClient.on(EventType.itemsRemoved, ({ messages }) => store.dispatch(messagesDeleted(messages)));

socketClient.on(EventType.itemStatusChanged, payload => store.dispatch(statusChanged(payload)));

function receiveContact(contact: ContactRepresentation) {
    store.dispatch(contactChanged(contact));
}

socketClient.on(EventType.contactCreated, receiveContact);
socketClient.on(EventType.contactUpdated, receiveContact);
socketClient.on(EventType.contactRemoved, c => store.dispatch(contactDeleted(c.id)));

socketClient.on(EventType.bootstrap, ({ chats, contacts, messages }) => {
    Log.info("Got bootstrap from event stream");
    store.dispatch(chatsChanged(chats));
    store.dispatch(contactsChanged(contacts.contacts));
    store.dispatch(strangersReceived(contacts.strangers));
    if (messages) receiveMessages(messages);

    store.dispatch(receivedBootstrap());
});