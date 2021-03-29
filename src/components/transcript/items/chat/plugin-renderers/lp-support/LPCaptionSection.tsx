import { RichLinkCaptionSection } from "imcore-ajax-core";
import React, { PropsWithoutRef } from "react";

export interface LPCaptionSectionRenderingContext {
    section?: RichLinkCaptionSection;
    position: "top" | "aboveTop" | "bottom" | "belowBottom";
}

export default function LPCaptionSection({ section, position }: PropsWithoutRef<LPCaptionSectionRenderingContext>) {
    if (!section?.leading && !section?.trailing) return null;

    return (
        <div className={`lp-caption-section lp-caption-section-${position}`}>
            {
                section.leading ? <div className="lp-leading-text">{ section.leading.text }</div> : null
            }
            {
                section.trailing ? <div className="lp-trailing-text">{ section.trailing.text }</div> : null
            }
        </div>
    );
}