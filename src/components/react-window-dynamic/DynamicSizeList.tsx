import { VariableSizeListProps } from "@erics-world/react-window";
import React, { CSSProperties, MutableRefObject, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { areEqual, ListChildComponentProps, VariableSizeList } from "react-window";
import { selectUseInvertedScrolling } from "../../app/reducers/debug";
import { EventTypes, useEvent } from "../../hooks/useEvent";
import IMMakeLog from "../../util/log";
import { DynamicListContext, hostIsMacOS, useInvertScrollDirection } from "./DynamicSizeList.Foundation";

export type RowRenderingContext<T extends { id: string },
 MemoState> = RowMeasurerPropsWithoutChildren<T, MemoState> & {
    ref: MutableRefObject<Element | null>;
};

export interface RowRenderer<T extends { id: string }, MemoState> {
    (ctx: RowRenderingContext<T, MemoState>): ReactNode
}

export interface RowMeasurerProps<T extends { id: string }, MemoState> {
    index: number;
    id: string;
    width: number;
    data: T[];
    style: CSSProperties;
    children: RowRenderer<T, MemoState>;
    memoState: MemoState;
    rootProps?: object;
}

export type RowMeasurerPropsWithoutChildren<T extends { id: string }, MemoState> = Omit<RowMeasurerProps<T, MemoState>, "children">;

export function RowMeasurer<T extends { id: string }, MemoState>({ index, id, rootProps = {}, width, data, style, children, memoState }: RowMeasurerProps<T, MemoState>) {
    const { setSize } = useContext(DynamicListContext);
    const rowRoot = useRef<null | HTMLDivElement>(null);

    const observer = useMemo(() => new ResizeObserver((([ entry ]: ResizeObserverEntry[]) => {
        if (setSize && entry.contentRect.height) {
            setSize(id, entry.contentRect.height);
        }
    })), []);
    
    useEffect(() => {
        if (rowRoot.current) {
            observer.disconnect();
            observer.observe(rowRoot.current);
        }
    }, [id, setSize, width]);

    return (
        <div style={style} {...rootProps}>
            {children({
                ref: rowRoot,
                index,
                data,
                id,
                width,
                style,
                memoState
            })}
        </div>
    );
}

export type TypedListChildComponentProps<T = any> = Omit<ListChildComponentProps, "data"> & {
    data: T;
}

const Log = IMMakeLog("ReactWindow.DynamicSizeList", "info");

export interface DynamicSizeListProps<T extends { id: string }, MemoState> {
    height: number;
    width: number;
    nonce?: string;
    itemData: T[];
    getID: (index: number) => string;
    itemCount: number;
    children: RowRenderer<T, MemoState>;
    overscanCount?: number;
    outerRef?: any;
    innerRef?: any;
    nearEnd?: () => void;
    isSame?: (oldProps: RowMeasurerPropsWithoutChildren<T, MemoState>, newProps: RowMeasurerPropsWithoutChildren<T, MemoState>) => boolean;
    memoState: MemoState;
    itemKey?: (index: number, data: T[]) => string;
    getProps?: (index: number) => object;
}

const sizeStorage: Map<string, Record<string, number>> = new Map();

export const DSLDebugTools: Array<{
    name: string;
    event: keyof EventTypes
}> = [
    { name: "Reset DSL", event: "resetDynamicSizeList" },
    { name: "Dump DSL ListRef", event: "dumpDSLListRef" },
    { name: "Dump DSL SizeMap", event: "dumpDSLMeasurements" },
    { name: "Rescroll DSL", event: "dslRescroll" }
];

const styleCaches: Record<string, object> = {};

class PatchedVariableSizeList extends (VariableSizeList as unknown as {
    new(props: VariableSizeListProps): VariableSizeList & {
        _getItemStyle: (index: number) => object;
    }
}) {
    constructor(props: VariableSizeListProps) {
        super(props);

        // @ts-ignore
        if (this._getItemStyle) {
            const oldGetItemStyle = this._getItemStyle;

            super._getItemStyle = this._getItemStyle = (index: number) => {
                const style = oldGetItemStyle(index);

                const token = JSON.stringify(style);

                if (styleCaches[JSON.stringify(style)]) {
                    return styleCaches[token];
                }
                
                return styleCaches[token] = style;
            };
        }
    }
}

export default function DynamicSizeList<T extends { id: string }, MemoState>(props: DynamicSizeListProps<T, MemoState>) {
    const listRef = useRef<PatchedVariableSizeList | null>(null);
    const scrollWatcher = useInvertScrollDirection(useSelector(selectUseInvertedScrolling) || hostIsMacOS);

    const sizeMap = React.useRef<{ [key: string]: number }>({});

    const resetList = useCallback(async () => {
        Log.debug("Resetting DynamicSizeList");

        listRef.current?.resetAfterIndex(0);
    }, [listRef]);

    const setSize = React.useCallback((id: string, size: number) => {
        // Performance: Only update the sizeMap and reset cache if an actual value changed
        if (sizeMap.current[id] !== size) {
            Log.debug("DynamicSizeList caught resize", { id, from: sizeMap.current[id], to: size });
            sizeMap.current = { ...sizeMap.current, [id]: size };
            sizeStorage.set(props.nonce!, sizeMap.current);
            
            if (listRef.current) {
                // Clear cached data and rerender
                Log.debug("DynamicSizeList rerendering VariableSizeList");
                resetList();
            }
        }
    }, [props.nonce, listRef, resetList, sizeMap]);

    useEvent("resetDynamicSizeList", resetList);

    useEvent("dumpDSLListRef", () => console.log(listRef.current));
    useEvent("dumpDSLMeasurements", () => console.log(sizeMap.current));

    useEvent("dslRescroll", () => {
        listRef.current?.scrollTo((listRef.current.state as { scrollOffset: number }).scrollOffset);
    });

    useEffect(() => {
        resetList();
    }, [props.itemData.length]);

    useEffect(() => {
        sizeMap.current = sizeStorage.get(props.nonce!) || {};
        listRef.current?.resetAfterIndex(0);
        listRef.current?.scrollToItem(0);
        Log.debug("Cleared caches");
    }, [props.nonce]);

    const getSize = React.useCallback((index: number) => (
        sizeMap.current[props.getID(index)] || 25
    ), [props.itemData, sizeMap]);

    // Increases accuracy by calculating an average row height
    // Fixes the scrollbar behaviour described here: https://github.com/bvaughn/react-window/issues/408
    const calcEstimatedSize = React.useCallback(() => {
        const keys = Object.keys(sizeMap.current);
        const estimatedHeight = keys.reduce((p, i) => p + sizeMap.current[i], 0);
        return estimatedHeight / keys.length;
    }, [sizeMap]);

    const MemoizedRowMeasurer = useMemo(() => {
        Log.debug("Regenerating memo component");

        const createRendererProps = (rowProps: TypedListChildComponentProps<T[]>, listProps: DynamicSizeListProps<T, MemoState> = props, memoState: MemoState = props.memoState): Omit<RowMeasurerProps<T, MemoState>, "children"> => ({
            ...rowProps,
            id: rowProps.data[rowProps.index].id,
            width: listProps.width,
            memoState
        });

        function Renderer(rowProps: ListChildComponentProps) {
            return (
                <RowMeasurer {...createRendererProps(rowProps)} rootProps={props.getProps ? props.getProps(rowProps.index) : undefined} key={rowProps.data[rowProps.index].id}>
                    {props.children as any}
                </RowMeasurer>
            );
        }

        return props.isSame ? React.memo<ListChildComponentProps>(Renderer, (prevProps, nextProps) => {
            return areEqual(prevProps, nextProps) && props.isSame!(createRendererProps(prevProps), createRendererProps(nextProps));
        }) : Renderer;
    }, [props.isSame, props.memoState]);

    return (
        <DynamicListContext.Provider value={{ setSize }}>
            <PatchedVariableSizeList
                ref={listRef}
                width={props.width}
                height={props.height}
                itemCount={props.itemCount}
                itemData={props.itemData}
                itemSize={getSize}
                estimatedItemSize={calcEstimatedSize()}
                outerRef={scrollWatcher}
                overscanCount={props.overscanCount}
                onItemsRendered={props.nearEnd ? ({ overscanStartIndex, overscanStopIndex }) => overscanStopIndex >= (props.itemData.length - 10) ? props.nearEnd!() : undefined : undefined}
                itemKey={props.itemKey}
                >
                {MemoizedRowMeasurer}
            </PatchedVariableSizeList>
        </DynamicListContext.Provider>
    );
}