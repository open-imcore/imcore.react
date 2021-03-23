import React, { ReactNode, useLayoutEffect, useRef, useState } from "react";

type TransitionContextArrayRepresentation = [ boolean ];
export interface TransitionContextObjectRepresentation {
    isShowing: boolean;
}

export type TransitionContext = TransitionContextObjectRepresentation & TransitionContextArrayRepresentation;

export interface TransitionContentContext extends TransitionContextObjectRepresentation {
    isDisappearing: boolean;
    isAppearing: boolean;
    isTransitioning: boolean;
    didFinish(): void;
}

export interface TransitionProps extends TransitionContextObjectRepresentation {
    children: (ctx: TransitionContentContext) => JSX.Element;
}

function useEffectAfterFirstRun(effect: React.EffectCallback, deps?: React.DependencyList | undefined) {
    const isFirstRun = useRef(true);

    return useLayoutEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        effect();
    }, deps);
}

export default function Transition({ children, ...ctx }: TransitionProps) {
    const [ didComplete, setDidComplete ] = useState(true);
    const [ isTransitioning, setIsTransitioning ] = useState(false);
    const [ isAppearing, setIsAppearing ] = useState(false);
    const [ isDisappearing, setIsDisappearing ] = useState(false);

    useEffectAfterFirstRun(() => {
        if (didComplete) {
            setIsTransitioning(false);
            setIsAppearing(false);
            setIsDisappearing(false);
        }
    }, [didComplete]);

    useEffectAfterFirstRun(() => {
        setDidComplete(false);
        setIsTransitioning(true);
        setIsAppearing(ctx.isShowing);
        setIsDisappearing(!ctx.isShowing);
    }, [ctx.isShowing]);

    const modalContentContext: TransitionContentContext = {
        isDisappearing,
        isAppearing,
        isTransitioning,
        didFinish: () => setDidComplete(true),
        ...ctx
    };

    return (ctx.isShowing || isTransitioning) ? children(modalContentContext) : null;
}