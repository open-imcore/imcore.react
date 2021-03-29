import { GroupTitleChangeItemRepresentation } from "imcore-ajax-core";
import React from "react";
import { useFormattedHandle } from "../../../../hooks/useFormattedHandles";
import { IMItemRenderingContext } from "../Message";

export type IMGroupTitleTranscriptItemRenderingContext = IMItemRenderingContext<GroupTitleChangeItemRepresentation>;

export default function IMGroupTitleChangeItem({ item, message }: IMGroupTitleTranscriptItemRenderingContext) {
    const formattedSender = useFormattedHandle(item.sender);

    return <div className="transcript-label">{formattedSender} <span className="transcript-label-value">named the conversation "{item.title}".</span></div>;
}