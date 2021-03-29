import { ChatRepresentation } from "imcore-ajax-core";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectTypingStatus } from "../app/reducers/chats";
import { RootState } from "../app/store";
import { useFormattedHandles } from "../hooks/useFormattedHandles";
import "../styles/ChatSidebarItem.scss";
import { useFormattedReceipt } from "../util/receipt-formatting";
import ChatBubble from "./chat/ChatBubble";
import IMTypingChatItem from "./transcript/items/chat/IMTypingChatItem";

function useLastMessageTime(chat: ChatRepresentation) {
    return useFormattedReceipt(chat.lastMessageTime);
}

function useChatName(chat: ChatRepresentation) {
    const [chatName, setChatName] = useState(null as string | null);
    const formattedHandles = useFormattedHandles(chat.participants);

    useEffect(() => {
        setChatName(chat.displayName || null);
    }, [chat]);

    return chatName || formattedHandles.join(", ") || chat.id;
}

function ChatSidebarItem({ chat, style }: PropsWithChildren<{ chat: ChatRepresentation, style?: object }>) {
    const chatName = useChatName(chat);
    const lastMessageTime = useLastMessageTime(chat);
    const isTyping = useSelector(state => selectTypingStatus(state as RootState, chat.id));

    return (
        <Link to={`/chats/${chat.id}`} className="chat-sidebar-item" attr-unread-count={chat.unreadMessageCount} style={style}>
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
                        ) : chat.lastMessage || ""
                    }
                </span>
            </div>
        </Link>
    );
}

export default ChatSidebarItem;