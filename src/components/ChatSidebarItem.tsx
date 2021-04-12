import React, { PropsWithChildren } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectTypingStatus } from "../app/reducers/chats";
import { RootState } from "../app/store";
import { IMURI } from "../context-menu";
import { ChatEntry } from "../contexts/ChatSearchContext";
import useChatName from "../hooks/useChatName";
import "../styles/ChatSidebarItem.scss";
import { useFormattedReceipt } from "../util/receipt-formatting";
import ChatBubble from "./chat/ChatBubble";
import { useCurrentChat } from "./transcript/ChatTranscriptFoundation";
import IMTypingChatItem from "./transcript/items/chat/IMTypingChatItem";

function ChatSidebarItem({ entry: { chat, message, sortKey }, style }: PropsWithChildren<{ entry: ChatEntry, style?: object }>) {
    const chatName = useChatName(chat);
    const currentChat = useCurrentChat();
    const lastMessageTime = useFormattedReceipt(sortKey);
    const isTyping = useSelector(state => selectTypingStatus(state as RootState, chat.id));

    const isActive = !message && currentChat?.id === chat.id;

    return (
        <Link to={`/chats/${chat.id}`} attr-chat-id={chat.id} attr-imcore-uri={IMURI.fromChat(chat)} className="chat-sidebar-item" attr-chat-active={isActive.toString()} attr-unread-count={chat.unreadMessageCount} style={style}>
            <div className="chat-sidebar-item--image">
                <ChatBubble chat={chat} />
            </div>
            <div className="chat-sidebar-item--details">
                <span className="chat-sidebar-item--title">
                    <span className="chat-sidebar-item--title-label">
                        {chatName}
                    </span>
                    <span className="chat-sidebar-item--title-timestamp">
                        {lastMessageTime}
                    </span>
                </span>
                <span className="chat-sidebar-item--summary">
                    {
                        isTyping ? (
                            <div data-item-type="typing">
                                <div className="item-inner">
                                    <IMTypingChatItem />
                                </div>
                            </div>
                        ) : message?.description || chat.lastMessage || ""
                    }
                </span>
            </div>
        </Link>
    );
}

export default ChatSidebarItem;