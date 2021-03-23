import React, { useEffect } from "react";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowProps } from "react-virtualized";
import Message from './items/Message';
import { useCurrentChat, useMessages } from "./ChatTranscriptFoundation"
import { MessageRepresentation } from "imcore-ajax-core";

const cache = new CellMeasurerCache({
    fixedWidth: true
})

export default function ChatTranscript() {
    const chat = useCurrentChat()
    const [ messages ] = useMessages(chat?.id)

    useEffect(() => {
        cache.clearAll();
    }, [chat?.id])

    function rowRenderer({
        index,
        key,
        parent,
        style
    }: ListRowProps) {
        const message = messages[index] as MessageRepresentation

        return (
            <CellMeasurer
                cache={cache}
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
                >
                {({ measure, registerChild }) => (
                    <Message eRef={registerChild} changed={measure} style={style} message={message} nextMessage={messages[index + 1]} prevMessage={messages[index - 1]} />
                )}
            </CellMeasurer>
        )
    }

    return (
        <div className="chat-transcript">
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        height={height}
                        width={width}
                        rowCount={messages.length}
                        deferredMeasurementCache={cache}
                        rowHeight={cache.rowHeight}
                        rowRenderer={rowRenderer}
                        className="chat-transcript-list"
                    />
                )}
            </AutoSizer>
        </div>
    )
}