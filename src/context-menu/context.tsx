import React, { createContext, PropsWithChildren, useRef, useState } from "react";
import { IMURI } from "./uri";

export interface ContextMenuState {
    uri: IMURI | null;
    setURI(uri: IMURI | null): void;
    donateCloser(cb: () => void): void;
    close(): void;
}

export const ContextMenuContext = createContext<ContextMenuState>({
    uri: null,
    setURI: () => undefined,
    donateCloser: () => undefined,
    close: () => undefined
});

export function ContextMenuContextProvider({ children }: PropsWithChildren<{}>) {
    const [ uri, setURI ] = useState<IMURI | null>(null);
    const closer = useRef<() => void>(() => undefined);

    return (
        <ContextMenuContext.Provider value={{ uri, setURI, close: () => closer.current(), donateCloser: newCloser => closer.current = newCloser }}>
            {children}
        </ContextMenuContext.Provider>
    );
}