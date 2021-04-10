import { ChatRepresentation } from "imcore-ajax-core";
import React, { PropsWithChildren } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectTypingStatus } from "../app/reducers/chats";
import { RootState } from "../app/store";
import { IMURI } from "../context-menu";
import useChatName from "../hooks/useChatName";
import "../styles/ChatSidebarItem.scss";
import { useFormattedReceipt } from "../util/receipt-formatting";
import ChatBubble from "./chat/ChatBubble";
import { useCurrentChat } from "./transcript/ChatTranscriptFoundation";
import IMTypingChatItem from "./transcript/items/chat/IMTypingChatItem";

function useLastMessageTime(chat: ChatRepresentation) {
    return useFormattedReceipt(chat.lastMessageTime);
}

function ChatSidebarItem({ chat, style }: PropsWithChildren<{ chat: ChatRepresentation, style?: object }>) {
    const chatName = useChatName(chat);
    const currentChat = useCurrentChat();
    const lastMessageTime = useLastMessageTime(chat);
    const isTyping = useSelector(state => selectTypingStatus(state as RootState, chat.id));

    const isActive = currentChat?.id === chat.id;

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
                        ) : chat.lastMessage || ""
                    }
                </span>
            </div>
        </Link>
    );
}

export default ChatSidebarItem;