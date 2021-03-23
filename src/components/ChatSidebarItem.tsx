import { ChatRepresentation } from 'imcore-ajax-core';
import { DateTime } from 'luxon';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormattedHandles } from '../hooks/useFormattedHandles';
import '../styles/ChatSidebarItem.scss';
import ChatBubble from "./chat/ChatBubble";
import { useFormattedReceipt } from "../util/receipt-formatting";

function useLastMessageTime(chat: ChatRepresentation) {
    return useFormattedReceipt(chat.lastMessageTime)
}

function useChatName(chat: ChatRepresentation) {
    const [chatName, setChatName] = useState(null as string | null)
    const formattedHandles = useFormattedHandles(chat.participants)

    useEffect(() => {
        setChatName(chat.displayName || null)
    }, [chat])

    return chatName || formattedHandles.join(', ') || chat.id
}

function ChatSidebarItem(props: PropsWithChildren<{ chat: ChatRepresentation, style?: object }>) {
    const chat = props.chat
    const chatName = useChatName(chat)
    const lastMessageTime = useLastMessageTime(chat)

    return (
        <Link to={`/chats/${chat.id}`} className="chat-sidebar-item" style={props.style}>
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
                <span className="chat-sidebar-item--summary">{chat.lastMessage || ''}</span>
            </div>
        </Link>
    )
}

export default ChatSidebarItem;