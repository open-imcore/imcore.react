import { AnyTraceData } from "imcore-ajax-core";
import React, { createContext, PropsWithChildren, useContext, useState } from "react";
import { useEvent } from "./useEvent";

export interface TracingContextState {
    traceData: AnyTraceData[];
    clear: () => void;
}

export const TracingContext = createContext<TracingContextState>({
    traceData: [],
    clear: () => undefined
});

export function TracingProvider({ children, shouldTrace = false }: PropsWithChildren<{ shouldTrace?: boolean }>) {
    const [ traceData, setTraceData ] = useState<AnyTraceData[]>([]);

    useEvent("trace", data => {
        if (!shouldTrace) return;
        setTraceData([
            ...traceData,
            data
        ].sort((t1, t2) => t1.timestamp - t2.timestamp));
    });

    return (
        <TracingContext.Provider value={{
            traceData,
            clear: () => setTraceData([])
        }}>
            {children}
        </TracingContext.Provider>
    );
}

export function useTracer(): AnyTraceData[] {
    const { traceData } = useContext(TracingContext);

    return traceData;
}