import { useEffect, useMemo, useRef, useState } from "react";

const persistentCache: Map<string, VersionedValue<any>> = new Map();

interface VersionedValue<T> {
    value: T;
    revision: number;
    observe: (cb: (newValue: T) => any) => () => void;
}

const persistentObservers: Map<string, Set<(newValue: any) => void>> = new Map();

function read<T>(key: string, defaultValue: T): T {
    const value = localStorage.getItem(key);
    if (!value) return defaultValue;

    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
}

const versionedValueFactory = <T>(key: string, defaultValue: T) => new Proxy({
    value: read(key, defaultValue),
    revision: 0,
    observe: (cb: (newValue: T) => any) => observePersistent(key, cb)
}, {
    set(target, property, value) {
        switch (property) {
            case "value":
                localStorage.setItem(key, JSON.stringify(value));
                target.value = value;
                target.revision += 1;

                if (!persistentObservers.has(key)) break;
    
                for (const observer of persistentObservers.get(key)!) {
                    observer(value);
                }

                break;
            case "revision":
                throw new Error("Revision cannot be mutated externally.");
        }

        return true;
    }
});

export function getPersistentValue<T>(key: string, defaultValue: T): VersionedValue<T> {
    if (persistentCache.has(key)) return persistentCache.get(key) as VersionedValue<T>;
    else return persistentCache.set(key, versionedValueFactory(key, defaultValue)).get(key) as VersionedValue<T>;
}

function observePersistent<T>(key: string, fn: (newValue: T) => void): () => void {
    if (!persistentObservers.has(key)) persistentObservers.set(key, new Set());
    persistentObservers.get(key)!.add(fn);

    return () => {
        persistentObservers.get(key)?.delete(fn);
    };
}

export function usePersistent<T = any>(key: string, defaultValue: T): [T, (newValue: T) => void] {
    const [persistentValue, setPersistentValue] = useState(null! as T);
    const revision = useRef(-1);
    const latest = useMemo(() => getPersistentValue(key, defaultValue), []);

    if (revision.current !== latest.revision) {
        setPersistentValue(latest.value);
        revision.current = latest.revision;
    }

    useEffect(() => latest.observe(newValue => {
        setPersistentValue(newValue);
    }));

    return [persistentValue, newValue => {
        getPersistentValue(key, newValue).value = newValue;
    }];
}