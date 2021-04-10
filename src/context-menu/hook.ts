import { MouseEventHandler, useContext, useEffect } from "react";
import { useContextMenu as useReactContexify } from "react-contexify";
import { findAncestor } from "../util/dom";
import { CTX_ID, IMCORE_ATTRIBUTE } from "./const";
import { ContextMenuContext } from "./context";
import { IMURI } from "./uri";

function findURI(el: HTMLElement): IMURI | null {
    const uriElement = findAncestor(el, element => element.hasAttribute(IMCORE_ATTRIBUTE));
    if (!uriElement) return null;
    return IMURI.fromRaw(uriElement.getAttribute(IMCORE_ATTRIBUTE)!);
}

export function useContextMenu(): MouseEventHandler<HTMLDivElement> {
    const { show, hideAll } = useReactContexify({
        id: CTX_ID
    });

    const { setURI, donateCloser } = useContext(ContextMenuContext);

    useEffect(() => {
        donateCloser(hideAll);
    }, [hideAll]);

    return (ev) => {
        if (!(ev.target instanceof HTMLElement)) {
            return;
        }

        const uri = findURI(ev.target);

        if (!uri) return;

        ev.preventDefault();

        setURI(uri);
        
        show(ev);
    };
}