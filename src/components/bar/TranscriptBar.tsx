import React from "react";
import useChatName from "../../hooks/useChatName";
import { useCurrentChat } from "../transcript/ChatTranscriptFoundation";

export default function TranscriptBar() {
    const chat = useCurrentChat();
    const chatName = useChatName(chat);

    return (
        <div className="transcript-toolbar">
            <div className="chat-name">
                {chatName}
            </div>
        </div>
    );
}