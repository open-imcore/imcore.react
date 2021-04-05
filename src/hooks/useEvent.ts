import { EventEmitter, EventListener } from "eventemitter3";
import { useEffect } from "react";

export interface EventTypes {
    resetDynamicSizeList: [];
    dumpDSLMeasurements: [];
    dumpDSLListRef: [];
    dslRescroll: [];
}

export const EventBus = new EventEmitter<EventTypes>();

export function useEvent<T extends keyof EventTypes>(event: T, fn: EventListener<EventTypes, T>) {
    useEffect(() => {
        EventBus.on(event, fn);

        return () => {
            EventBus.off(event, fn);
        };
    });
}