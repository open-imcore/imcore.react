import { useState } from "react";

type AnonymizedFunction<T> = T extends (...args: infer U) => any ? (...args: U) => Promise<void> : never;

export function useBusyController<T extends (...args: any) => any>(props: { disabled?: boolean, fn: T } | T): [ boolean, AnonymizedFunction<T> ] {
    if (typeof props === "function") props = { disabled: false, fn: props };
    const { disabled = false, fn } = props;

    const [ busy, setBusy ] = useState(false);
    const canProceed = !(busy || disabled);

    return [
        !canProceed,
        (async (...args: Parameters<T>[]) => {
            if (!canProceed) return;

            setBusy(true);
            await fn(...args);
            setBusy(false);
        }) as unknown as AnonymizedFunction<T>
    ];
}