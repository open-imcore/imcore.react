import React, { useLayoutEffect, useRef, useState } from "react";
import { useFormattedReceipt } from "../../../util/receipt-formatting";

const readReceiptTransitionManager: Map<string, boolean> = new Map();

function useEffectAfterFirstRun(effect: React.EffectCallback, deps?: React.DependencyList | undefined) {
    const isFirstRun = useRef(true);

    return useLayoutEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        effect();
    }, deps);
}

export default function MessageReceiptController({ showReceipt, timeRead, id }: { showReceipt: boolean, timeRead: number, id: string }) {
    const formattedReceipt = useFormattedReceipt(showReceipt ? timeRead : null);

    const [isComplete, setIsComplete] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isAppearing, setIsAppearing] = useState(false);
    const [isDisappearing, setIsDisappearing] = useState(false);

    if (!readReceiptTransitionManager.has(id)) readReceiptTransitionManager.set(id, showReceipt)
    else if (!isTransitioning && readReceiptTransitionManager.get(id) !== showReceipt) {
        setIsAppearing(showReceipt);
        setIsDisappearing(!showReceipt);
        setIsTransitioning(true);
        setIsComplete(false);
    }

    useEffectAfterFirstRun(() => {
        if (isComplete) {
            readReceiptTransitionManager.set(id, showReceipt);
            setIsTransitioning(false);
            setIsAppearing(false);
            setIsDisappearing(false);
        }
    }, [isComplete]);

    return (
        showReceipt || isTransitioning ? (
            <span
                className="transcript-label message-receipt"
                attr-is-transitioning={isTransitioning.toString()}
                attr-is-appearing={isAppearing.toString()}
                attr-is-disappearing={isDisappearing.toString()}
                onAnimationEnd={() => setIsComplete(true)}
                >
                {timeRead ? (
                    <>Read <span className="transcript-label-value">{formattedReceipt}</span></>
                ) : "Delivered"}
            </span>
        ) : null
    )
}