import RecycledElementRenderer from "../../../../Recycler";

export interface LPAssetRenderingConext {
    videoURL?: string | null;
    imageURL?: string | null;
    changed: () => any;
    id: string;
}

const LPAssetRenderer = RecycledElementRenderer<HTMLElement, LPAssetRenderingConext>(({ videoURL, imageURL, changed }) => {
    if (videoURL) {
        const element = document.createElement("video");
        element.className = "lp-video";
        element.src = videoURL;
        if (imageURL) element.poster = imageURL;
        element.controls = true;

        return element;
    } else if (imageURL) {
        const element = document.createElement("img");
        element.alt = "Rich Link Banner";
        element.src = imageURL;

        return element;
    } else return document.createElement("div");
}, ({ changed }, el) => {
    el.addEventListener("loadedmetadata", changed);
    el.addEventListener("load", changed);
}, ({ changed }, el) => {
    el.removeEventListener("loadedmetadata", changed);
    el.removeEventListener("load", changed);
});

export default LPAssetRenderer;