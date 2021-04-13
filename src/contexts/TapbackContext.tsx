import React, { createContext, PropsWithChildren, useCallback, useState } from "react";

export interface TapbackContextState {
    tapbackItemID: string | null;
    isAcknowledging: boolean;
    setTapbackItemID(id: string | null): void;
    close(): void;
}

export const TapbackContext = createContext<TapbackContextState>({
    tapbackItemID: null,
    isAcknowledging: false,
    setTapbackItemID: () => undefined,
    close: () => undefined
});

export function TapbackProvider({ children }: PropsWithChildren<{}>) {
    const [ tapbackItemID, setTapbackItemID ] = useState<string | null>(null);

    const close = useCallback(() => setTapbackItemID(null), []);

    return (
        <TapbackContext.Provider value={{
            tapbackItemID, setTapbackItemID, close,
            isAcknowledging: tapbackItemID !== null
        }}>
            {children}
        </TapbackContext.Provider>
    );
}