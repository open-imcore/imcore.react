import React from "react";
import ReactJson from "react-json-view";
import { useSelector } from "react-redux";
import { selectChats } from "../../../app/reducers/chats";
import { selectMessages } from "../../../app/reducers/messages";
import { ChatStyle } from "../../chat/ChatBubble";
import AcknowledgmentPicker from "../../transcript/acknowledgments/AcknowledgmentPicker";
import { useCurrentChat, useHoveredChat, useHoveredChatItem } from "../../transcript/ChatTranscriptFoundation";
import DebugDetails from "../presentation/DebugDetails";

export default function Statistics() {
    const loadedChats = Object.values(useSelector(selectChats)).length;
    const loadedMessages = Object.values(useSelector(selectMessages)).flatMap(record => Object.values(record)).length;

    const currentChat = useCurrentChat();

    const [ hoveredChatItem, hoveredMessage ] = useHoveredChatItem();
    const hoveredChat = useHoveredChat();

    return (
        <>
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
                    ["Muted?", currentChat?.ignoreAlerts ? "Yes" : "No"],
                    ["Send Read Receipts?", currentChat?.readReceipts ? "Yes" : "No"],
                    ["Service", currentChat?.service],
                    ["Group?", currentChat?.style === ChatStyle.group ? "Yes" : "No"]
                ]} />
            </details>
            <details>
                <summary>Message Information</summary>
                <ReactJson src={hoveredMessage || {}} />
            </details>
            <details>
                <summary>Acknowledgments</summary>
                <DebugDetails details={[
                    ["Hovered Message ID", hoveredMessage?.id],
                    ["Hovered Message Sender", hoveredMessage?.sender],
                    ["Hovered Message Time", hoveredMessage?.time || NaN],
                    ["Hovered ChatItem ID", hoveredChatItem?.payload.id]
                ]} />
                {
                    (hoveredMessage && hoveredChatItem) ? (
                        <AcknowledgmentPicker message={hoveredMessage} chatItem={hoveredChatItem} />
                    ) : null
                }
            </details>
            <details>
                <summary>Chat Information</summary>
                <ReactJson src={hoveredChat || {}} />
            </details>
        </>
    );
}