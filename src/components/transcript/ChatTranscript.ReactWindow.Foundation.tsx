import { createContext, useCallback, useEffect, useRef } from "react";

export const DynamicListContext = createContext<
    Partial<{ setSize: (id: string, size: number) => void }>
>({});

export const useInvertScrollDirection = (enabled: boolean = isMacOS()) => {
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

    return (incomingRef: HTMLDivElement | null) => {
        if (!enabled || !incomingRef) {
            return;
        }

        ref.current = incomingRef;

        if (ref.current) {
            ref.current.addEventListener("wheel", invertedWheelEvent);
        }
    };
};

export function isMacOS() {
    return navigator.userAgent.toLowerCase().includes('mac os x')
}