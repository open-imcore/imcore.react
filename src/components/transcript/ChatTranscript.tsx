import { MessageRepresentation } from "imcore-ajax-core";
import React, { useCallback, useMemo } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { chatItemChanged } from "../../app/reducers/presence";
import { store } from "../../app/store";
import IMMakeLog from "../../util/log";
import DynamicSizeList, { RowMeasurerPropsWithoutChildren } from "../react-window-dynamic/DynamicSizeList";
import { useCurrentChat, useCurrentMessages } from "./ChatTranscriptFoundation";
import Composition from "./composition/Composition";
import Message from "./items/Message";
import { itemsAreShallowEqual } from "./items/Message.foundation";

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