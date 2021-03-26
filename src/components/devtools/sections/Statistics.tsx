import React from "react";
import { useSelector } from "react-redux";
import { selectChats } from "../../../app/reducers/chats";
import { selectContacts } from "../../../app/reducers/contacts";
import { selectMessages } from "../../../app/reducers/messages";
import { ChatStyle } from "../../chat/ChatBubble";
import { useCurrentChat, useCurrentMessages } from "../../transcript/ChatTranscriptFoundation";
import DebugDetails from "../presentation/DebugDetails";

export default function Statistics() {
    const loadedChats = Object.values(useSelector(selectChats)).length;
    const loadedContacts = Object.values(useSelector(selectContacts)).length;
    const loadedMessages = Object.values(useSelector(selectMessages)).flatMap(record => Object.values(record)).length;

    const currentChat = useCurrentChat();
    const [ messages ] = useCurrentMessages(false, false);

    return (
        <React.Fragment>
            <details>
                <summary>Statistics</summary>
                <DebugDetails details={[
                    ["Loaded Chats", loadedChats],
                    ["Loaded Messages", loadedMessages]
                ]} />
            </details>
            <details>
                <summary>Chat Statistics</summary>
                <DebugDetails details={[
                    ["Current Chat", currentChat?.id],
                    ["Messages Loaded For Chat", messages.length],
                    ["Oldest Message ID", messages[0]?.id],
                    ["Newest Message ID", messages[messages.length - 1]?.id],
                    ["Muted?", currentChat?.ignoreAlerts ? "Yes" : "No"],
                    ["Send Read Receipts?", currentChat?.readReceipts ? "Yes" : "No"],
                    ["Service", currentChat?.service],
                    ["Group?", currentChat?.style === ChatStyle.group ? "Yes" : "No"]
                ]} />
            </details>
        </React.Fragment>
    )
}