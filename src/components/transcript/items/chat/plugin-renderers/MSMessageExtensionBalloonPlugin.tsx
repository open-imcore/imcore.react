import { AttachmentRepresentation, MessagesExtension, MessagesExtensionLayoutInfo, RichLink, RichLinkCaptionBar, RichLinkCpationText } from "imcore-ajax-core";
import React, { PropsWithoutRef } from "react";
import LPBalloon from "./LPBalloon";

interface MSMessageExtensionRenderingContext extends PropsWithoutRef<{}> {
    extension?: MessagesExtension;
    attachments: AttachmentRepresentation[];
    id: string;
    changed: () => void;
}

function makeText(text: string): RichLinkCpationText {
    return {
        text,
        textScale: 1
    };
}

function generateCaptionBar({ caption, subcaption, secondarySubcaption, tertiarySubcaption }: MessagesExtensionLayoutInfo): RichLinkCaptionBar | undefined {
    if (!caption && !subcaption && !secondarySubcaption && !tertiarySubcaption) return;

    return {
        top: (caption || secondarySubcaption) ? {
            leading: caption ? makeText(caption) : undefined,
            trailing: secondarySubcaption ? makeText(secondarySubcaption) : undefined
        } : undefined,
        bottom: (subcaption || tertiarySubcaption) ? {
            leading: subcaption ? makeText(subcaption) : undefined,
            trailing: tertiarySubcaption ? makeText(tertiarySubcaption) : undefined
        } : undefined
    };
}

function generateMediaBottomCaptionBar({ imageTitle, imageSubtitle }: MessagesExtensionLayoutInfo): RichLinkCaptionBar | undefined {
    if (!imageTitle && !imageSubtitle) return;

    return {
        top: imageTitle ? {
            leading: makeText(imageTitle)
        } : undefined,
        bottom: imageSubtitle ? {
            leading: makeText(imageSubtitle)
        } : undefined
    };
}

function generateMediaTopCaptionBar(appIcon: string | undefined): (RichLinkCaptionBar & { leadingIcon: { src: string } }) | undefined {
    if (!appIcon) return;

    return {
        leadingIcon: {
            type: 99,
            src: appIcon
        }
    };
}

function generateRichLink({ layoutInfo, appName, appIcon }: MessagesExtension, attachments: AttachmentRepresentation[]): RichLink {
    return {
        captionBar: generateCaptionBar(layoutInfo || {}),
        mediaBottomCpationBar: generateMediaBottomCaptionBar(layoutInfo || {}),
        mediaTopCaptionBar: generateMediaTopCaptionBar(appIcon),
        image: attachments[0] ? {
            attachmentIndex: 0,
            type: 0
        } : undefined
    };
}

export default function MSMessageExtensionBalloonPlugin({ extension, attachments, changed, id }: MSMessageExtensionRenderingContext) {
    if (!extension) return null;

    return <LPBalloon className="lp-message-extension-compat" id={id} richLink={generateRichLink(extension, attachments)} attachments={attachments} changed={changed} />;
}