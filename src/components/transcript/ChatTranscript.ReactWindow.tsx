import { AutoSizer } from "react-virtualized";
import { areEqual, ListChildComponentProps, VariableSizeList } from "@ericrabil/react-window";
import { ChatContext, useCurrentChat, useCurrentMessages } from "./ChatTranscriptFoundation";
import React, { CSSProperties, MutableRefObject, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MessageRepresentation } from "imcore-ajax-core";
import Message from "./items/Message";
import { DynamicListContext, useInvertScrollDirection } from "./ChatTranscript.ReactWindow.Foundation";
import IMMakeLog from "../../util/log";
import Composition from "./composition/Composition";

const Log = IMMakeLog("ChatTranscript.ReactWindow");

type RowRenderingContext<T extends { id: string }, MemoState> = Omit<RowMeasurerProps<T, MemoState>, "children"> & {
    ref: MutableRefObject<Element | null>;
};

interface RowRenderer<T extends { id: string }, MemoState> {
    (ctx: RowRenderingContext<T, MemoState>): ReactNode
}

interface RowMeasurerProps<T extends { id: string }, MemoState> {
    index: number;
    id: string;
    width: number;
    data: T[];
    style: CSSProperties;
    children: RowRenderer<T, MemoState>;
    memoState: MemoState;
}

function RowMeasurer<T extends { id: string }, MemoState>({ index, id, width, data, style, children, memoState }: RowMeasurerProps<T, MemoState>) {
    const { setSize } = useContext(DynamicListContext)
    const rowRoot = useRef<null | HTMLDivElement>(null)

    const observer = useRef(new ResizeObserver((([ entry ]: ResizeObserverEntry[]) => {
        if (setSize && entry.contentRect.height) {
            setSize(id, entry.contentRect.height)
        }
    })))
    
    useEffect(() => {
        if (rowRoot.current) {
            observer.current.disconnect()
            observer.current.observe(rowRoot.current)
        }
    }, [id, setSize, width])

    return (
        <div style={style}>
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
    )
}

interface DynamicSizeListProps<T extends { id: string }, MemoState> {
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
    memoState: MemoState;
}

const sizeStorage: Map<string, Record<string, number>> = new Map();

function DynamicSizeList<T extends { id: string }, MemoState>(props: DynamicSizeListProps<T, MemoState>) {
    const listRef = useRef<VariableSizeList | null>(null);
    const scrollWatcher = useInvertScrollDirection()

    const sizeMap = React.useRef<{ [key: string]: number }>({});

    const setSize = React.useCallback((id: string, size: number) => {
        // Performance: Only update the sizeMap and reset cache if an actual value changed
        if (sizeMap.current[id] !== size) {
            Log.debug("DynamicSizeList caught resize", { id, from: sizeMap.current[id], to: size })
            sizeMap.current = { ...sizeMap.current, [id]: size };
            
            if (listRef.current) {
                // Clear cached data and rerender
                Log.debug("DynamicSizeList rerendering VariableSizeList")
                listRef.current.resetAfterIndex(0);
            }
        }
    }, []);

    useEffect(() => {
        sizeStorage.set(props.nonce || "", sizeMap.current = sizeStorage.get(props.nonce || "") || {})
        listRef.current?.resetAfterIndex(0)
        Log.debug("Cleared caches")
    }, [props.nonce])

    const getSize = React.useCallback((index: number) => {
        return sizeMap.current[props.getID(index)] || 25;
    }, [props.itemData, sizeMap]);

    // Increases accuracy by calculating an average row height
    // Fixes the scrollbar behaviour described here: https://github.com/bvaughn/react-window/issues/408
    const calcEstimatedSize = React.useCallback(() => {
        const keys = Object.keys(sizeMap.current);
        const estimatedHeight = keys.reduce((p, i) => p + sizeMap.current[i], 0);
        return estimatedHeight / keys.length;
    }, []);

    return (
        <DynamicListContext.Provider value={{ setSize }}>
            <VariableSizeList
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
                >
                {rowProps => (
                    <RowMeasurer {...rowProps} id={rowProps.data[rowProps.index].id} key={rowProps.data[rowProps.index].id} width={props.width} memoState={props.memoState}>
                        {props.children as any}
                    </RowMeasurer>
                )}
            </VariableSizeList>
        </DynamicListContext.Provider>
    )
}

function cmp<T>(...entries: [T, T][]) {
    return entries.every(([ e1, e2 ]) => JSON.stringify(e1) === JSON.stringify(e2))
}
interface MemoState { lastDeliveredFromMe?: string; lastReadFromMe?: string; }

function MessageRenderer({ ref, index, data, memoState: { lastDeliveredFromMe, lastReadFromMe } }: RowRenderingContext<MessageRepresentation, MemoState>) {
    return (
        <Message
            eRef={ref as any}
            message={data[index]}
            nextMessage={data[index - 1]}
            prevMessage={data[index + 1]}
            lastDeliveredFromMe={lastDeliveredFromMe}
            lastReadFromMe={lastReadFromMe}
        />
    )
}

export default function ChatTranscript() {
    const chat = useCurrentChat()
    const [ messages, loadMore ] = useCurrentMessages(true)

    const [lastDeliveredFromMe, lastReadFromMe] = useMemo(() => [messages.find(message => message.fromMe && message.isDelivered)?.id, messages.find(message => message.fromMe && message.timeRead)?.id], [JSON.stringify(messages)])

    return (
        <div className="chat-transcript transcript-react-window">
            <ChatContext.Provider value={{ chat: chat || null }}>
                <div className="message-transcript-container">
                    <AutoSizer>
                        {({ height, width }) => (
                            <DynamicSizeList
                                height={height}
                                width={width}
                                nonce={chat?.id}
                                itemData={messages}
                                getID={index => messages[index]?.id || '-1'}
                                itemCount={messages.length}
                                nearEnd={loadMore}
                                memoState={{ lastDeliveredFromMe, lastReadFromMe }}
                                >
                                {MessageRenderer}
                            </DynamicSizeList>
                        )}
                    </AutoSizer>
                </div>
                <Composition />
            </ChatContext.Provider>
        </div>
    )
}