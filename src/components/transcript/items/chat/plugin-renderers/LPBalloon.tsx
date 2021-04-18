import { AttachmentRepresentation, Color, RichLink } from "imcore-ajax-core";
import React, { PropsWithoutRef } from "react";
import LPCaptionBar from "./lp-support/LPCaptionBar";
import LPMedia from "./lp-support/LPMedia";

export type LPRenderingContext = PropsWithoutRef<{
    attachments: AttachmentRepresentation[];
    id: string;
}>;

interface LPBalloonRenderingContext extends LPRenderingContext {
    richLink: RichLink;
    changed: () => any;
    className?: string;
}

function makeRGBA(color: Color | undefined) {
    if (!color) return undefined;
    return `rgba(${color.red},${color.green},${color.blue},${color.alpha})`;
}

export default function LPBalloon({ className, richLink, changed, attachments, id }: LPBalloonRenderingContext) {
    const lightBackground = makeRGBA(richLink.backgroundColor?.light);
    const darkBackground = makeRGBA(richLink.backgroundColor?.dark);

    const Element = richLink.url ? "a" : "div";

    return (
        <Element href={richLink.url} target="_blank" className={className ? `lp-balloon ${className}` : "lp-balloon"} style={{
            "--light-lp-background-override": lightBackground,
            "--dark-lp-background-override": darkBackground
        } as any}>
            <LPMedia id={id} changed={changed} video={richLink.video} image={richLink.image} audio={richLink.audio} topCaptionBar={richLink.mediaTopCaptionBar} bottomCaptionBar={richLink.mediaBottomCpationBar} attachments={attachments} />
            {
                richLink.quotedText ? (
                    <div className="lp-quoted-text">{ richLink.quotedText }</div>
                ) : null
            }
            {
                richLink.captionBar ? (
                    <LPCaptionBar id={id} captionBar={richLink.captionBar} attachments={attachments} />
                ) : null
            }
        </Element>
    );
}