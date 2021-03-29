import { createContext, useCallback, useEffect, useRef } from "react";

export const DynamicListContext = createContext<
    Partial<{ setSize: (id: string, size: number) => void }>
>({});

export const useInvertScrollDirection = (enabled: boolean) => {
    const ref = useRef<HTMLDivElement>();

    const invertedWheelEvent = useCallback((e: WheelEvent) => {
        if (ref.current) {
            ref.current.scrollTop += -e.deltaY;
            e.preventDefault();
        }
    }, []);

    useEffect(
        () => () => {
            if (ref.current) {
                ref.current.removeEventListener("wheel", invertedWheelEvent);
            }
        },
        []
    );

    const repair = useCallback(() => {
        if (!ref.current) return;

        ref.current.removeEventListener("wheel", invertedWheelEvent);
        if (enabled) ref.current.addEventListener("wheel", invertedWheelEvent);
    }, [ref, enabled, invertedWheelEvent]);

    useEffect(() => repair(), [enabled, repair, ref]);

    return (incomingRef: HTMLDivElement | null) => {
        if (!incomingRef) {
            return;
        }

        ref.current = incomingRef;
    };
};

export function isMacOS() {
    return navigator.userAgent.toLowerCase().includes("mac os x");
}