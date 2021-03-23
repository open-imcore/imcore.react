import { AttachmentChatItemRepresentation, AttachmentRepresentation } from "imcore-ajax-core";
import React, { PropsWithoutRef, useEffect } from "react";
import { IMItemRenderingContext } from "../Message";
import { apiClient } from "../../../../app/connection"

interface IMAttachmentChatItemRenderContext extends IMItemRenderingContext<Omit<AttachmentChatItemRepresentation, "metadata"> & { metadata?: CanaryAttachmentRepresentation }> {}

interface Size {
    width: number;
    height: number;
}

interface CanaryAttachmentRepresentation extends AttachmentRepresentation {
    size?: Size;
}

enum IMAttachmentRenderingFormat {
    image = "image",
    video = "video",
    file = "file"
}

function ERComputeRenderingFormat({ metadata }: AttachmentChatItemRepresentation) {
    switch (metadata?.mime?.split("/")?.[0] || "") {
        case "image":
            return IMAttachmentRenderingFormat.image
        case "video":
            return IMAttachmentRenderingFormat.video
        default:
            return IMAttachmentRenderingFormat.file
    }
}

const IMVideoRenderCache: Map<string, HTMLVideoElement> = new Map();
const IMImageRenderCache: Map<string, HTMLImageElement> = new Map();

function IMAttachmentChatItem({ item, message, changed }: PropsWithoutRef<IMAttachmentChatItemRenderContext>) {
    const renderingFormat = ERComputeRenderingFormat(item)
    const url = apiClient.attachmentURL(item.transferID)
    const { width, height } = item.metadata?.size || {}
    
    useEffect(() => () => {
        IMVideoRenderCache.get(item.id)?.removeEventListener("loadeddata", changed);
        IMImageRenderCache.get(item.id)?.removeEventListener("load", changed);
    });

    switch (renderingFormat) {
        case IMAttachmentRenderingFormat.image:
            if (!IMVideoRenderCache.has(item.id)) {
                const element = document.createElement("img");
                element.setAttribute("width", width?.toString() || "100%");
                element.height = height!;
                element.draggable = true;
                element.src = url;
                element.alt = message.description!;
                element.addEventListener("load", changed);

                IMImageRenderCache.set(item.id, element);
            }

            return (
                <div ref={temp => {
                    if (temp) temp.replaceWith(IMImageRenderCache.get(item.id)!)
                }} />
            )
        case IMAttachmentRenderingFormat.video:
            if (!IMVideoRenderCache.has(item.id)) {
                const element = document.createElement("video");
                element.width = width!;
                element.height = height!;
                element.preload = "auto";
                element.draggable = true;
                element.src = url;
                element.controls = true;
                element.addEventListener("loadeddata", changed);

                IMVideoRenderCache.set(item.id, element);
            }

            return (
                <div ref={temp => {
                    if (temp) temp.replaceWith(IMVideoRenderCache.get(item.id)!)
                }} />
            )
        default:
            return null
    }
}

export default React.memo(IMAttachmentChatItem, ({ item: prevItem }, { item: newItem }) => JSON.stringify(prevItem) === JSON.stringify(newItem))