import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { selectChats } from "../../../app/reducers/chats";
import { selectMessages } from "../../../app/reducers/messages";
import { TapbackContext } from "../../../contexts/TapbackContext";
import { ChatStyle } from "../../chat/ChatBubble";
import { useCurrentChat } from "../../transcript/ChatTranscriptFoundation";
import DebugDetails from "../presentation/DebugDetails";
import { DebugButton } from "./GroupSettings";

export default function Statistics() {
    const loadedChats = Object.values(useSelector(selectChats)).length;
    const loadedMessages = Object.values(useSelector(selectMessages)).flatMap(record => Object.values(record)).length;

    const currentChat = useCurrentChat();

    const { isAcknowledging, tapbackItemID, close } = useContext(TapbackContext);

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
                <summary>Acknowledgment Controller</summary>

                <DebugDetails details={[
                    ["Is Acknowledging", isAcknowledging ? "Yes" : "No"],
                    ["Acknowledging ID", tapbackItemID || "null"]
                ]} />

                <DebugButton disabled={!isAcknowledging} click={close}>
                    Stop Acknowledging
                </DebugButton>
            </details>
        </>
    );
}