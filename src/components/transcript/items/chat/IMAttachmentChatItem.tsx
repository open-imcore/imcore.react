import { AttachmentChatItemRepresentation, AttachmentRepresentation } from "imcore-ajax-core";
import React, { PropsWithoutRef } from "react";
import { apiClient } from "../../../../app/connection";
import RecycledElementRenderer from "../../Recycler";
import { IMItemRenderingContext } from "../Message";

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
    switch (metadata?.mime?.substring(0, 5) || "") {
        case "image":
            return IMAttachmentRenderingFormat.image;
        case "video":
            return IMAttachmentRenderingFormat.video;
        default:
            return IMAttachmentRenderingFormat.file;
    }
}

interface AttachmentRenderingContext {
    id: string;
    url: string;
    changed: () => any;
    width?: number;
    height?: number;
    description?: string;
}

const IMImageAttachmentRenderer = RecycledElementRenderer(({ width, height, url, description }: AttachmentRenderingContext) => {
    const element = document.createElement("img");
    element.setAttribute("width", width?.toString() || "100%");
    element.height = height!;
    element.draggable = true;
    element.src = url;
    element.alt = description!;

    return element;
}, ({ changed }, el) => {
    el.addEventListener("load", changed);
}, ({ changed }, el) => {
    el.removeEventListener("load", changed);
});

const IMVideoAttachmentRenderer = RecycledElementRenderer(({ width, height, url }: AttachmentRenderingContext) => {
    const element = document.createElement("video");
    element.width = width!;
    element.height = height!;
    element.preload = "auto";
    element.draggable = true;
    element.src = url;
    element.controls = true;

    return element;
}, ({ changed }, el) => {
    el.addEventListener("loadedmetadata", changed);
}, ({ changed }, el) => {
    el.removeEventListener("loadedmetadata", changed);
});

function IMRenderingImplementation(item: IMAttachmentChatItemRenderContext["item"]) {
    switch (ERComputeRenderingFormat(item)) {
        case IMAttachmentRenderingFormat.image:
            return IMImageAttachmentRenderer;
        case IMAttachmentRenderingFormat.video:
            return IMVideoAttachmentRenderer;
        default:
            return null;
    }
}

function IMAttachmentChatItem({ item, message, changed }: PropsWithoutRef<IMAttachmentChatItemRenderContext>) {
    const url = apiClient.attachmentURL(item.transferID);
    const { width, height } = item.metadata?.size || {};

    const RenderingImplementation = IMRenderingImplementation(item);

    if (!RenderingImplementation) return null;

    return (
        <RenderingImplementation id={item.id} width={width} height={height} url={url} changed={changed} description={message.description} />
    );
}

export default React.memo(IMAttachmentChatItem, ({ item: prevItem }, { item: newItem }) => JSON.stringify(prevItem) === JSON.stringify(newItem));