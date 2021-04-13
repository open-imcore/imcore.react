import { MessageRepresentation } from "imcore-ajax-core";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import AutoSizer from "react-virtualized-auto-sizer";
import { apiClient } from "../../app/connection";
import { selectVisibilityState } from "../../app/reducers/presence";
import { TapbackContext } from "../../contexts/TapbackContext";
import { findAncestor } from "../../util/dom";
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

const acknowledgingProps = {
    "attr-is-acknowledging": "true"
};

const notAcknowledgingProps = {
    "attr-is-acknowledging": "false"
};

export default function ChatTranscript() {
    const chat = useCurrentChat();
    const [ messages, loadMore ] = useCurrentMessages();

    const [lastDeliveredFromMe, lastReadFromMe] = useMemo(() => getLastReadAndDeliveredFromMe(messages), [JSON.stringify(messages)]);

    const unreadCount = chat?.unreadMessageCount || 0;
    const isVisible = useSelector(selectVisibilityState);

    const [ processing, setIsProcessing ] = useState(false);

    const { close: clearTapbackView, isAcknowledging, tapbackItemID } = useContext(TapbackContext);

    const getID = useCallback((index: number) => messages[index]?.id || "-1", [messages]);

    useEffect(() => {
        (async () => {
            if (unreadCount > 0 && isVisible && chat) {
                if (processing) return;
                setIsProcessing(true);
                await apiClient.chats.readAllMessages(chat.id);
                setIsProcessing(false);
            }
        })();
    }, [unreadCount, isVisible, chat]);

    useEffect(() => {
        clearTapbackView();
    }, [chat]);

    const memoState = useMemo(() => ({ lastDeliveredFromMe, lastReadFromMe }), [ lastDeliveredFromMe, lastReadFromMe ]);

    const getProps = (index: number) => tapbackItemID?.endsWith(messages[index].id) ? acknowledgingProps : notAcknowledgingProps;

    const itemKey = useCallback((index: number, data: MessageRepresentation[]) => data[index].id, []);

    return (
        <div className="chat-transcript transcript-react-window" attr-is-acknowledging={isAcknowledging.toString()} onClick={event => {
            if (!(event.target instanceof HTMLElement)) return;
            if (!isAcknowledging) return;

            const isSafe = findAncestor(event.target, el => el.classList.contains("acknowledgment-picker-container"));

            if (isSafe) return;

            clearTapbackView();
        }}>
            <div className="message-transcript-container">
                <AutoSizer>
                    {({ height, width }) => (
                        <DynamicSizeList
                            height={height}
                            width={width}
                            nonce={chat?.id}
                            itemData={messages}
                            getID={getID}
                            itemCount={messages.length}
                            nearEnd={loadMore}
                            memoState={memoState}
                            isSame={compareMessageRenderProps}
                            itemKey={itemKey}
                            getProps={getProps}
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