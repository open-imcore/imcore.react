import React from "react";
import { ParticipantChangeTranscriptChatItemRepresentation } from "imcore-ajax-core";
import { useFormattedHandle } from "../../../../hooks/useFormattedHandles";
import { IMItemRenderingContext } from "../Message";

export type IMParticipantChangeItemRenderingContext = IMItemRenderingContext<ParticipantChangeTranscriptChatItemRepresentation>;

export default function IMParticipantChangeItem({ item }: IMParticipantChangeItemRenderingContext) {
    const formattedInitiator = useFormattedHandle(item.initiatorID);
    const formattedTarget = useFormattedHandle(item.targetID);

    return (
        <div className="transcript-label">
            {formattedInitiator} <span className="transcript-label-value">{item.changeType ? "removed" : "added"} {formattedTarget} from the conversation.</span>
        </div>
    )
}