import { ChatRepresentation } from "imcore-ajax-core";
import { useSelector } from "react-redux";
import { selectHandleIDToContact } from "../app/reducers/contacts";
import { extractFormattedHandles } from "./useFormattedHandles";

export default function useChatName(chat?: ChatRepresentation | null): string | null {
    const handleIDToContact = useSelector(selectHandleIDToContact);

    if (!chat) return null;

    return chat.displayName || extractFormattedHandles(chat.participants, handleIDToContact).join(", ") || chat.id;
}