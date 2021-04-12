import React, { useContext, useMemo } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { areEqual, FixedSizeList as List } from "react-window";
import { chatChanged } from "../app/reducers/presence";
import { store } from "../app/store";
import { ChatEntry, ChatSearchContext } from "../contexts/ChatSearchContext";
import "../styles/ChatSidebar.scss";
import { findAncestor } from "../util/dom";
import ChatSidebarItem from "./ChatSidebarItem";
import { TypedListChildComponentProps } from "./react-window-dynamic/DynamicSizeList";

function findChatID(element: HTMLElement): string | null {
    return findAncestor(element, ancestor => {
        return ancestor.hasAttribute("attr-chat-id");
    })?.getAttribute("attr-chat-id") || null;
}

const RowRenderer = React.memo(function RowRenderer({
    index,
    data,
    style
}: TypedListChildComponentProps<ChatEntry[]>) {
    if (!data[index]) return null;

    return (
        <ChatSidebarItem style={style} entry={data[index]} />
    );
}, (prevProps, nextProps) => {
    if (!areEqual(prevProps, nextProps)) return false;

    const prevChat = prevProps.data[prevProps.index].chat;
    const nextChat = nextProps.data[nextProps.index].chat;

    if (prevProps.data[prevProps.index].sortKey !== nextProps.data[nextProps.index].sortKey) return false;

    if (prevChat.id !== nextChat.id) return false;
    if (prevChat.lastMessage !== nextChat.lastMessage) return false;
    if (prevChat.lastMessageTime !== nextChat.lastMessageTime) return false;
    if (prevChat.unreadMessageCount !== nextChat.unreadMessageCount) return false;
    if (prevChat.displayName !== nextChat.displayName) return false;
    if (prevChat.ignoreAlerts !== nextChat.ignoreAlerts) return false;
    if (prevChat.groupPhotoID !== nextChat.groupPhotoID) return false;
    if (JSON.stringify(prevChat.participants) !== JSON.stringify(nextChat.participants)) return false;

    return true;
});

function ChatSidebar() {
    const { chatResults } = useContext(ChatSearchContext);

    const chats = useMemo(() => chatResults.slice().sort((c1, c2) => c2.sortKey - c1.sortKey), [chatResults]);

    return (
        <div onMouseOver={event => {
            if (!(event.target instanceof HTMLElement)) return;
            const currentChatID = findChatID(event.target);
            if (!currentChatID) return;
            if (currentChatID === store.getState().presence.hoveringOverChatID) return;
            store.dispatch(chatChanged(currentChatID));
        }}>
            <AutoSizer>
                {({height}) => (
                    <List
                        height={height}
                        className="chat-sidebar"
                        itemCount={chats.length}
                        itemData={chats}
                        itemSize={60}
                        itemKey={(index: number, data: ChatEntry[]) => data[index]?.chat.id || Math.random()}
                        overscanCount={35}
                        width={285}
                    >
                        {RowRenderer}
                    </List>
                )}
            </AutoSizer>
        </div>
    );
}

export default ChatSidebar;