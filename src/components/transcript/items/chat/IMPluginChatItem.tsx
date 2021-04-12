import { PluginChatItemRepresentation } from "imcore-ajax-core";
import React, { PropsWithoutRef } from "react";
import IMMakeLog from "../../../../util/log";
import { IMItemRenderingContext } from "../Message";
import LPBalloon from "./plugin-renderers/LPBalloon";
import MSMessageExtensionBalloonPlugin from "./plugin-renderers/MSMessageExtensionBalloonPlugin";

interface IMPluginChatItemRenderContext extends IMItemRenderingContext<PluginChatItemRepresentation> {
}

const Log = IMMakeLog("IMPluginChatItem");

function componentForItem(item: PluginChatItemRepresentation): null | ((ctx: Partial<PluginChatItemRepresentation>) => JSX.Element) {
    switch (item.bundleID.split(":")[0]) {
        case "com.apple.messages.URLBalloonProvider":
            if (!item.richLink) return null;
            return LPBalloon as unknown as ReturnType<typeof componentForItem>;
        case "com.apple.messages.MSMessageExtensionBalloonPlugin":
            return MSMessageExtensionBalloonPlugin as unknown as ReturnType<typeof componentForItem>;
        default:
            Log.warn("No implementation available for item with bundleID", item.bundleID);
            return null;
    }
}

function IMPluginChatItem({ item }: PropsWithoutRef<IMPluginChatItemRenderContext>) {
    const Component = componentForItem(item);

    if (!Component) return null;

    return (
        <Component {...item} />
    );
}

export default React.memo(IMPluginChatItem, ({ item: prevItem }, { item: newItem }) => JSON.stringify(prevItem) === JSON.stringify(newItem));