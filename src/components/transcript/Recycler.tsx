import React, { useEffect } from "react";

export default function RecycledElementRenderer<T extends Element, Context extends { id: string }>(renderer: (context: Context) => T, initializer?: (context: Context, el: T) => void, destructor?: (context: Context, el: T) => void) {
    const cache: Map<string, T> = new Map();

    return function Renderer(context: Context) {
        if (!cache.has(context.id)) {
            cache.set(context.id, renderer(context));
        }
        
        const el = cache.get(context.id)!;

        if (initializer) initializer(context, el);

        useEffect(() => () => destructor ? destructor(context, el) : undefined);

        return (
            <div ref={temp => {
                if (temp) temp.replaceWith(el);
            }} />
        );
    };
}
