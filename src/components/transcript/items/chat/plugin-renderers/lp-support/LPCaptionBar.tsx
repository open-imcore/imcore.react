import { RichLinkCaptionBar } from "imcore-ajax-core";
import React from "react";
import { LPRenderingContext } from "../LPBalloon";
import LPCaptionIcon from "./LPCaptionIcon";
import LPCaptionSection from "./LPCaptionSection";

export interface LPCaptionBarRenderingContext extends LPRenderingContext {
    captionBar: RichLinkCaptionBar;
}

export default function LPCaptionBar({ id, captionBar: { aboveTop, top, bottom, belowBottom, leadingIcon, trailingIcon }, attachments }: LPCaptionBarRenderingContext) {
    if (!aboveTop && !top && !bottom && !belowBottom && !leadingIcon && !trailingIcon) return null;

    return (
        <div className="lp-caption-bar">
            <LPCaptionIcon id={id} icon={leadingIcon} attachments={attachments} position="left" />
            {
                (aboveTop || top || bottom || belowBottom) ? (
                    <div className="lp-text-stack">
                        <LPCaptionSection position="aboveTop" section={aboveTop} />
                        <LPCaptionSection position="top" section={top} />
                        <LPCaptionSection position="bottom" section={bottom} />
                        <LPCaptionSection position="belowBottom" section={belowBottom} />
                    </div>
                ) : null
            }
            <LPCaptionIcon id={id} icon={trailingIcon} attachments={attachments} position="right" />
        </div>
    );
}