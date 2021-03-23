import React from "react";
import { IMItemRenderingContext } from "../Message";
import { GroupTitleChangeItemRepresentation } from "imcore-ajax-core";
import { useFormattedHandle } from "../../../../hooks/useFormattedHandles";

export type IMGroupTitleTranscriptItemRenderingContext = IMItemRenderingContext<GroupTitleChangeItemRepresentation>;

export default function IMGroupTitleChangeItem({ item, message }: IMGroupTitleTranscriptItemRenderingContext) {
    const formattedSender = useFormattedHandle(item.sender);

    return <div className="transcript-label">{formattedSender} <span className="transcript-label-value">named the conversation "{item.title}".</span></div>
}