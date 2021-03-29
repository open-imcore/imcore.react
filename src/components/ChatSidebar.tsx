import React from "react";
import { useSelector } from "react-redux";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import "react-virtualized/styles.css";
import { selectChats } from "../app/reducers/chats";
import "../styles/ChatSidebar.scss";
import ChatSidebarItem from "./ChatSidebarItem";

function ChatSidebar() {
    const allChats = Object.values(useSelector(selectChats)).sort((c1, c2) => c2.lastMessageTime - c1.lastMessageTime);

    function rowRenderer({
        key,
        index,
        style
    }: ListRowProps) {
        return (
            <ChatSidebarItem key={key} style={style} chat={allChats[index]} />
        );
    }

    return (
        <div>
            <AutoSizer>
                {({height}) => (
                    <List
                        height={height}
                        className="chat-sidebar"
                        rowCount={allChats.length}
                        rowHeight={60}
                        overscanRowCount={10}
                        rowRenderer={rowRenderer}
                        width={285}
                    />
                )}
            </AutoSizer>
        </div>
    );
}

export default ChatSidebar;