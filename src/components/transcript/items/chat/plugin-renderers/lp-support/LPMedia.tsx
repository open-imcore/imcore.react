import { AttachmentRepresentation, RichLinkAsset, RichLinkAudio, RichLinkCaptionBar, RichLinkImage, RichLinkVideo } from "imcore-ajax-core";
import { LPRenderingContext } from "../LPBalloon";
import React, { useEffect, useMemo, useRef } from "react";
import { apiClient } from "../../../../../../app/connection";
import LPCaptionBar from "./LPCaptionBar";
import LPAssetRenderer from "./LPAssetRenderer";

interface LPMediaRenderingContext extends LPRenderingContext {
    video?: RichLinkVideo;
    image?: RichLinkImage;
    audio?: RichLinkAudio;
    topCaptionBar?: RichLinkCaptionBar;
    bottomCaptionBar?: RichLinkCaptionBar;
    changed: () => any;
}

function attachmentURL(asset: RichLinkAsset | undefined, attachments: AttachmentRepresentation[]) {
    if (!asset) return null
    if (typeof asset.attachmentIndex !== "number") return null
    if (!attachments[asset.attachmentIndex]) return null
    return apiClient.attachmentURL(attachments[asset.attachmentIndex].id)
}

export default function LPMedia(ctx: LPMediaRenderingContext) {
    const videoURL = ctx.video?.streamingURL || ctx.video?.youTubeURL || attachmentURL(ctx.video, ctx.attachments)
    const imageURL = attachmentURL(ctx.image, ctx.attachments)

    if (!videoURL && !imageURL) return null

    return (
        <div className="lp-media">
            {
                ctx.topCaptionBar ? (
                    <LPCaptionBar id={ctx.id} captionBar={ctx.topCaptionBar} attachments={ctx.attachments} />
                ) : null
            }
            <LPAssetRenderer imageURL={imageURL} videoURL={videoURL} id={ctx.id} changed={ctx.changed} />
            {
                ctx.bottomCaptionBar ? (
                    <LPCaptionBar id={ctx.id} captionBar={ctx.bottomCaptionBar} attachments={ctx.attachments} />
                ) : null
            }
        </div>
    )
}