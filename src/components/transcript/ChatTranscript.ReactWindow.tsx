import { MessageRepresentation } from "imcore-ajax-core";
import React, { CSSProperties, MutableRefObject, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import AutoSizer from "react-virtualized-auto-sizer";
import { areEqual, ListChildComponentProps, VariableSizeList } from "react-window";
import { selectUseInvertedScrolling } from "../../app/reducers/debug";
import { chatItemChanged } from "../../app/reducers/presence";
import { store } from "../../app/store";
import IMMakeLog from "../../util/log";
import { DynamicListContext, useInvertScrollDirection } from "./ChatTranscript.ReactWindow.Foundation";
import { useCurrentChat, useCurrentMessages } from "./ChatTranscriptFoundation";
import Composition from "./composition/Composition";
import Message from "./items/Message";
import { itemsAreShallowEqual } from "./items/Message.foundation";

const Log = IMMakeLog("ChatTranscript.ReactWindow", "info");

type RowRenderingContext<T extends { id: string }, MemoState> = RowMeasurerPropsWithoutChildren<T, MemoState> & {
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

type RowMeasurerPropsWithoutChildren<T extends { id: string }, MemoState> = Omit<RowMeasurerProps<T, MemoState>, "children">;

function RowMeasurer<T extends { id: string }, MemoState>({ index, id, width, data, style, children, memoState }: RowMeasurerProps<T, MemoState>) {
    const { setSize } = useContext(DynamicListContext);
    const rowRoot = useRef<null | HTMLDivElement>(null);

    const observer = useRef(new ResizeObserver((([ entry ]: ResizeObserverEntry[]) => {
        if (setSize && entry.contentRect.height) {
            setSize(id, entry.contentRect.height);
        }
    })));
    
    useEffect(() => {
        if (rowRoot.current) {
            observer.current.disconnect();
            observer.current.observe(rowRoot.current);
        }
    }, [id, setSize, width]);

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
    );
}

export type TypedListChildComponentProps<T = any> = Omit<ListChildComponentProps, "data"> & {
    data: T;
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
    isSame?: (oldProps: RowMeasurerPropsWithoutChildren<T, MemoState>, newProps: RowMeasurerPropsWithoutChildren<T, MemoState>) => boolean;
    memoState: MemoState;
    itemKey?: (index: number, data: T[]) => string;
}

const sizeStorage: Map<string, Record<string, number>> = new Map();

function DynamicSizeList<T extends { id: string }, MemoState>(props: DynamicSizeListProps<T, MemoState>) {
    const listRef = useRef<VariableSizeList | null>(null);
    const scrollWatcher = useInvertScrollDirection(useSelector(selectUseInvertedScrolling));

    const sizeMap = React.useRef<{ [key: string]: number }>({});

    const setSize = React.useCallback((id: string, size: number) => {
        // Performance: Only update the sizeMap and reset cache if an actual value changed
        if (sizeMap.current[id] !== size) {
            Log.debug("DynamicSizeList caught resize", { id, from: sizeMap.current[id], to: size });
            sizeMap.current = { ...sizeMap.current, [id]: size };
            sizeStorage.set(props.nonce!, sizeMap.current);
            
            if (listRef.current) {
                // Clear cached data and rerender
                Log.debug("DynamicSizeList rerendering VariableSizeList");
                listRef.current.resetAfterIndex(0);
            }
        }
    }, [props.nonce]);

    useEffect(() => {
        sizeMap.current = sizeStorage.get(props.nonce!) || {};
        listRef.current?.resetAfterIndex(0);
        listRef.current?.scrollToItem(0);
        Log.debug("Cleared caches");
    }, [props.nonce]);

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

    const MemoizedRowMeasurer = useMemo(() => {
        MemoLog.debug("Regenerating memo component");

        const createRendererProps = (rowProps: TypedListChildComponentProps<T[]>, listProps: DynamicSizeListProps<T, MemoState> = props, memoState: MemoState = props.memoState): Omit<RowMeasurerProps<T, MemoState>, "children"> => ({
            ...rowProps,
            id: rowProps.data[rowProps.index].id,
            width: listProps.width,
            memoState
        });

        function Renderer(rowProps: ListChildComponentProps) {
            return (
                <RowMeasurer {...createRendererProps(rowProps)} key={rowProps.data[rowProps.index].id}>
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
                itemKey={props.itemKey}
                >
                {MemoizedRowMeasurer}
            </VariableSizeList>
        </DynamicListContext.Provider>
    );
}

const MemoLog = IMMakeLog("MessageMemo", "error");

function messagesAreRenderSame(prevMessage: MessageRepresentation | undefined, nextMessage: MessageRepresentation | undefined) {
    if ((!prevMessage && !nextMessage) || !(prevMessage && nextMessage)) return false;

    if (prevMessage.id !== nextMessage.id) {
        MemoLog.info("MessageID not equal (%s !== %s)", prevMessage.id, nextMessage.id);
        return false;
    }
    else if (!itemsAreShallowEqual(prevMessage, nextMessage)) {
        MemoLog.info("Items are not shallow equal (%o !== %o)", prevMessage, nextMessage);
        return false;
    }
    else {
        MemoLog.debug("Items are same");
        return true;
    }
}

interface MessagesMemoState {
    lastDeliveredFromMe?: string;
    lastReadFromMe?: string;
}

function compareMessageRenderProps(prevProps: RowMeasurerPropsWithoutChildren<MessageRepresentation, MessagesMemoState>, nextProps: RowMeasurerPropsWithoutChildren<MessageRepresentation, MessagesMemoState>): boolean {
    const prevBeforeMessage = prevProps.data[prevProps.index - 1];
    const nextBeforeMessage = nextProps.data[nextProps.index - 1];

    const prevMessage = prevProps.data[prevProps.index];
    const nextMessage = nextProps.data[nextProps.index];

    const prevAfterMessage = prevProps.data[prevProps.index + 1];
    const nextAfterMessage = nextProps.data[nextProps.index + 1];

    return (
        messagesAreRenderSame(prevBeforeMessage, nextBeforeMessage)
     && messagesAreRenderSame(prevMessage, nextMessage)
     && messagesAreRenderSame(prevAfterMessage, nextAfterMessage)
    );
}

function getLastReadAndDeliveredFromMe(messages: MessageRepresentation[]): [string | undefined, string | undefined] {
    let lastDeliveredFromMe: string | undefined = undefined, lastReadFromMe: string | undefined = undefined;

    for (const { id, fromMe, isDelivered, timeRead } of messages) {
        if (!lastDeliveredFromMe && fromMe && isDelivered) lastDeliveredFromMe = id;
        if (!lastReadFromMe && fromMe && timeRead) lastReadFromMe = id;
        if (lastDeliveredFromMe && lastReadFromMe) break;
    }

    return [lastDeliveredFromMe, lastReadFromMe];
}

function searchNodeForMessageRelations(node: Node): {
    chatItemID: string | null;
    messageID: string | null;
} {
    let chatItemID: string | null = null, messageID: string | null = null;

    let next: Node | null = node;
    while (next !== null) {
        if (next instanceof HTMLElement) {
            if (!chatItemID) chatItemID = next.getAttribute("attr-chat-item-id");
            if (!messageID) messageID = next.getAttribute("attr-message-id");
        }

        if ((chatItemID && messageID) || (messageID && !chatItemID)) break;

        next = next.parentNode;
    }

    return {
        chatItemID,
        messageID
    };
}

export default function ChatTranscript() {
    const chat = useCurrentChat();
    const [ messages, loadMore ] = useCurrentMessages();

    const [lastDeliveredFromMe, lastReadFromMe] = useMemo(() => getLastReadAndDeliveredFromMe(messages), [JSON.stringify(messages)]);

    const itemKey = useCallback((index: number, data: MessageRepresentation[]) => data[index].id, []);

    return (
        <div className="chat-transcript transcript-react-window" onMouseOver={event => {
            if (!(event.target instanceof Node)) return;
            const { messageID, chatItemID } = searchNodeForMessageRelations(event.target);

            if (!messageID) return;
            store.dispatch(chatItemChanged({ messageID, chatItemID }));
        }}>
            <div className="message-transcript-container">
                <AutoSizer>
                    {({ height, width }) => (
                        <DynamicSizeList
                            height={height}
                            width={width}
                            nonce={chat?.id}
                            itemData={messages}
                            getID={index => messages[index]?.id || "-1"}
                            itemCount={messages.length}
                            nearEnd={loadMore}
                            memoState={{ lastDeliveredFromMe, lastReadFromMe }}
                            isSame={compareMessageRenderProps}
                            itemKey={itemKey}
                            >
                            {({ ref, index, data }) => (
                                <Message
                                    eRef={ref as any}
                                    message={data[index]}
                                    nextMessage={data[index - 1]}
                                    prevMessage={data[index + 1]}
                                    lastDeliveredFromMe={lastDeliveredFromMe}
                                    lastReadFromMe={lastReadFromMe}
                                />
                            )}
                        </DynamicSizeList>
                    )}
                </AutoSizer>
            </div>
            <Composition />
        </div>
    );
}