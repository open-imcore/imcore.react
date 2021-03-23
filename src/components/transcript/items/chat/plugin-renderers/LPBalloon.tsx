import React, { PropsWithoutRef } from "react";
import { AttachmentRepresentation, Color, RichLink } from "imcore-ajax-core";
import LPCaptionBar from "./lp-support/LPCaptionBar";
import LPMedia from "./lp-support/LPMedia";

export type LPRenderingContext = PropsWithoutRef<{
    attachments: AttachmentRepresentation[];
}>;

interface LPBalloonRenderingContext extends LPRenderingContext {
    richLink: RichLink;
    changed: () => any;
}

function makeRGBA(color: Color | undefined) {
    if (!color) return undefined
    return `rgba(${color.red},${color.green},${color.blue},${color.alpha})`
}

export default function LPBalloon({ richLink, changed, attachments }: LPBalloonRenderingContext) {
    const backgroundRGBA = makeRGBA(richLink.backgroundColor)

    const Element = richLink.url ? "a" : "div"

    return (
        <Element href={richLink.url} target="_blank" className="lp-balloon" style={{
            background: backgroundRGBA
        }}>
            <LPMedia changed={changed} video={richLink.video} image={richLink.image} audio={richLink.audio} topCaptionBar={richLink.mediaTopCaptionBar} bottomCaptionBar={richLink.mediaBottomCpationBar} attachments={attachments} />
            {
                richLink.quotedText ? (
                    <div className="lp-quoted-text">{ richLink.quotedText }</div>
                ) : null
            }
            {
                richLink.captionBar ? (
                    <LPCaptionBar captionBar={richLink.captionBar} attachments={attachments} />
                ) : null
            }
        </Element>
    )
}