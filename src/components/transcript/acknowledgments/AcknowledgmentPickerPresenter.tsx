import React, { RefObject, useContext, useEffect, useMemo, useState } from "react";
import { IMURI } from "../../../context-menu";
import { TapbackContext } from "../../../contexts/TapbackContext";
import "../../../styles/transcript/AcknowledgmentPickerPresenter.scss";
import AcknowledgmentPicker from "./AcknowledgmentPicker";

interface Size {
    height: number;
    width: number;
}

function useSize(ref: RefObject<Element>) {
    const [ size, setSize ] = useState<Size>({
        height: 0,
        width: 0
    });

    const observer = useMemo(() => new ResizeObserver(([ entry ]: ResizeObserverEntry[]) => {
        const { width, height } = entry.contentRect;

        if (width !== size.width || height !== size.width) {
            setSize({
                width,
                height
            });
        }
    }), []);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const element = ref.current;

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    });

    return size;
}

export default function AcknowledgmentPickerPresenter({ rootRef }: {
    rootRef: RefObject<HTMLDivElement>
}) {
    const { tapbackItemID } = useContext(TapbackContext);

    const { width, height } = useSize(rootRef);

    if (!tapbackItemID) return null;

    const { message, rawItem: chatItem } = IMURI.forItem(tapbackItemID);

    let xInset = width < 220 ? -5 : (width - 200);

    if (message!.fromMe) {
        xInset = width < 220 ? (width - 215) : -15;
    }

    return (
        <div className="acknowledgment-picker-container" style={{
            transform: `translate(${xInset}px, -40px)`
        }} attr-from-me={message!.fromMe.toString()}>
            <AcknowledgmentPicker message={message!} chatItem={chatItem!} />
        </div>
    );
}