import { ChatRepresentation, ContactRepresentation } from "imcore-ajax-core";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { apiClient } from "../../app/connection";
import { useContactResolver } from "../../hooks/useContactResolver";
import CNContactBubble from "../contacts/CNContactBubble";

export enum ChatStyle {
    group = 43,
    solo = 45
}

function DMBubble(props: PropsWithChildren<{ chat: ChatRepresentation }>) {
    const chat = props.chat
    const [recipientID, setRecipientID] = useState([] as string[])

    useEffect(() => {
        setRecipientID(chat.participants)
    }, [chat])

    const contacts = useContactResolver(recipientID)

    return (
        <CNContactBubble className="chat-bubble--image" contact={contacts[0]} />
    )
}

function GroupChatBubble(props: PropsWithChildren<{ chat: ChatRepresentation }>) {
    const chat = props.chat
    const [lastTwoHandleIDs, setLastTwoHandleIDs] = useState([] as string[])

    useEffect(() => {
        setLastTwoHandleIDs(chat.participants.slice(0, 2))
    }, [chat])

    const contacts = useContactResolver(lastTwoHandleIDs)

    return (
        <div className="chat-bubble--multi-container">
            <CNContactBubble className="chat-bubble--image" contact={contacts[0]} />
            <CNContactBubble className="chat-bubble--image" contact={contacts[1]} />
        </div>
    )
}

function ChatBubble(props: PropsWithChildren<{ chat: ChatRepresentation }>) {
    const chat = props.chat

    if (chat.style === ChatStyle.group) {
        if (chat.groupPhotoID) {
            return (
                <div className="cn-bubble chat-bubble--image" style={{
                    backgroundImage: `url(${apiClient.attachmentURL(chat.groupPhotoID)})`
                }} />
            )
        } else {
            return (
                <GroupChatBubble chat={chat} />
            )
        }
    } else {
        return (
            <DMBubble chat={chat} />
        )
    }
}

export default ChatBubble