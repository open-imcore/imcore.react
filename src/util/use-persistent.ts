import { useEffect, useRef, useState } from "react";

const persistentCache: Map<string, VersionedValue<any>> = new Map();

interface VersionedValue<T> {
    value: T;
    revision: number;
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

function overwrite<T>(key: string, newValue: T): void {
    persistentCache.set(key, {
        value: newValue,
        revision: (persistentCache.get(key)?.revision || -1) + 1
    });
    localStorage.setItem(key, JSON.stringify(newValue));

    if (!persistentObservers.has(key)) return;
    
    for (const observer of persistentObservers.get(key)!) {
        observer(newValue);
    }
}

export function getPersistentValue<T>(key: string, defaultValue: T): VersionedValue<T> {
    if (persistentCache.has(key)) return persistentCache.get(key) as VersionedValue<T>;
    else return persistentCache.set(key, {
        value: read(key, defaultValue),
        revision: 0
    }).get(key) as VersionedValue<T>;
}

export function observePersistent<T>(key: string, fn: (newValue: T) => void): () => void {
    if (!persistentObservers.has(key)) persistentObservers.set(key, new Set());
    persistentObservers.get(key)!.add(fn);

    return () => {
        persistentObservers.get(key)?.delete(fn);
    };
}

export function usePersistent<T = any>(key: string, defaultValue: T): [T, (newValue: T) => void] {
    const [persistentValue, setPersistentValue] = useState(null! as T);
    const revision = useRef(-1);
    const latest = getPersistentValue(key, defaultValue);

    if (revision.current !== latest.revision) {
        setPersistentValue(latest.value);
        revision.current = latest.revision;
    }

    useEffect(() => observePersistent<T>(key, newValue => {
        setPersistentValue(newValue);
    }));

    return [persistentValue, newValue => {
        overwrite(key, newValue);
    }];
}