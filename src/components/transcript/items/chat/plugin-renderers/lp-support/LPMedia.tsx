import { AttachmentRepresentation, RichLinkAsset, RichLinkAudio, RichLinkCaptionBar, RichLinkImage, RichLinkVideo } from "imcore-ajax-core";
import React from "react";
import { IMAttachmentResolver, useResourceURI } from "../../../../../../hooks/useResourceURI";
import { LPRenderingContext } from "../LPBalloon";
import LPAssetRenderer from "./LPAssetRenderer";
import LPCaptionBar from "./LPCaptionBar";

interface LPMediaRenderingContext extends LPRenderingContext {
    video?: RichLinkVideo;
    image?: RichLinkImage;
    audio?: RichLinkAudio;
    topCaptionBar?: RichLinkCaptionBar;
    bottomCaptionBar?: RichLinkCaptionBar;
    changed: () => any;
}

function attachmentID(asset: RichLinkAsset | undefined, attachments: AttachmentRepresentation[]): string | null {
    if (!asset) return null;
    if (typeof asset.attachmentIndex !== "number") return null;
    if (!attachments[asset.attachmentIndex]) return null;
    return attachments[asset.attachmentIndex].id;
}

export default function LPMedia(ctx: LPMediaRenderingContext) {
    const alternativeURL = ctx.video?.streamingURL || ctx.video?.youTubeURL;

    const innerVideoURL = useResourceURI(alternativeURL ? null : attachmentID(ctx.video, ctx.attachments), IMAttachmentResolver);
    
    const videoURL = alternativeURL || innerVideoURL;
    const imageURL = useResourceURI(attachmentID(ctx.image, ctx.attachments), IMAttachmentResolver);

    if (!videoURL && !imageURL) return null;

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
    );
}