import { ChatRepresentation, ContactRepresentation } from "imcore-ajax-core";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectHandleIDToContact } from "../app/reducers/contacts";
import { extractFormattedHandles } from "./useFormattedHandles";

function computeChatName(chat: ChatRepresentation, handleIDToContact: Record<string, ContactRepresentation>): string {
    return chat.displayName || extractFormattedHandles(chat.participants, handleIDToContact).join(", ") || chat.id;
}

export default function useChatName(chat?: ChatRepresentation | null): string | null {
    const handleIDToContact = useSelector(selectHandleIDToContact);
    const [ chatName, setChatName ] = useState(() => chat ? computeChatName(chat, handleIDToContact) : null);

    useEffect(() => {
        setChatName(chat ? computeChatName(chat, handleIDToContact) : null);
    }, [chat?.displayName, chat?.id, JSON.stringify(chat?.participants)]);

    return chatName;
}