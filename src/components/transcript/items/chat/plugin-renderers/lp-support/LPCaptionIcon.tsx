import { AttachmentRepresentation, RichLinkImage } from "imcore-ajax-core";
import React from "react";
import { apiClient } from "../../../../../../app/connection";
import { IMAttachmentResolver, useResourceURI } from "../../../../../../hooks/useResourceURI";
import { LPRenderingContext } from "../LPBalloon";

export interface LPCaptionIconRenderingContext extends LPRenderingContext {
    icon?: RichLinkImage;
    position: "left" | "right";
}

function isSyntheticImage(icon: RichLinkImage): icon is RichLinkImage & { src: string } {
    return icon.type === 99 && typeof (icon as Record<string, string>).src === "string";
}

function iconAttachmentID(icon: RichLinkImage | undefined, attachments: AttachmentRepresentation[]): string | null {
    if (!icon) return null;
    else if (isSyntheticImage(icon)) return null;
    else if (typeof icon.attachmentIndex === "undefined" || !attachments[icon.attachmentIndex]) return null;
    else return attachments[icon.attachmentIndex].id;
}

function computeIconSrc(icon: RichLinkImage | undefined, attachments: AttachmentRepresentation[]) {
    if (!icon) return null;
    else if (isSyntheticImage(icon)) return icon.src;
    else if (typeof icon.attachmentIndex === "undefined" || !attachments[icon.attachmentIndex]) return null;
    else return apiClient.attachmentURL(attachments[icon.attachmentIndex].id);
}

export default function LPCaptionIcon({ icon, attachments, position }: LPCaptionIconRenderingContext) {
    const src = useResourceURI(iconAttachmentID(icon, attachments), IMAttachmentResolver);
    const syntheticSrc = icon && isSyntheticImage(icon) ? icon.src : null || null;

    if (!src) return null;

    return (
        <img alt="Site Icon" className={`lp-caption-icon lp-caption-icon-${position}`} src={src} />
    );
}