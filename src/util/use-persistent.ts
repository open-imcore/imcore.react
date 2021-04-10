import { useEffect, useMemo, useRef, useState } from "react";

const persistentCache: Map<string, VersionedValue<any>> = new Map();

export interface VersionedValue<T> {
    value: T;
    readonly revision: number;
    readonly observe: (cb: (newValue: T) => any) => () => void;
}

type VersionedObserver<T> = Parameters<VersionedValue<T>["observe"]>[0];

export interface VersionedValueWithStateAdapter<T> extends VersionedValue<T> {
    readonly useAsState: () => T;
}

export function makeVanillaVersionedValue<T>(defaultValue: T): VersionedValueWithStateAdapter<T> {
    const observers: Set<VersionedObserver<T>> = new Set();

    const versionedValue = new Proxy({
        value: defaultValue,
        revision: 0,
        observe: (cb: (newValue: T) => any) => {
            observers.add(cb);

            return () => {
                observers.delete(cb);
            };
        },
        useAsState: () => {
            const [ value, setValue ] = useState<T>();
            const revision = useRef(-1);

            if (revision.current !== versionedValue.revision) {
                setValue(versionedValue.value);
                revision.current = versionedValue.revision;
            }

            useEffect(() => versionedValue.observe((newValue: T) => {
                setValue(newValue);
                revision.current = versionedValue.revision;
            }));

            return value!;
        }
    }, {
        set(target, property, value) {
            switch (property) {
                case "value":
                    target.value = value;
                    target.revision++;

                    for (const observer of observers) {
                        observer(value);
                    }

                    break;
                default:
                    return false;
            }

            return true;
        }
    });

    return versionedValue;
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