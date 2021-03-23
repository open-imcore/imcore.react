import React, { useRef } from "react";
import Message from './items/Message';
import InfiniteScroll from "react-infinite-scroll-component";
import { useCurrentChat, useCurrentMessages } from "./ChatTranscriptFoundation"

export default function ChatTranscript() {
    const chat = useCurrentChat()
    const rootRef = useRef(null as unknown as HTMLDivElement)

    const [ messages, loadMore ] = useCurrentMessages()

    return (
        <div className="chat-transcript" id="transcript-root" ref={rootRef}>
            <InfiniteScroll
                dataLength={messages.length}
                next={loadMore}
                hasMore={true}
                style={{ display: 'flex', flexDirection: 'column-reverse' }}
                loader={<p>Wiat</p>}
                endMessage={<p>stahp</p>}
                inverse={true}
                scrollableTarget="transcript-root"
                >
                {messages.map((message, index) => (
                    <Message key={message.id} message={message} nextMessage={messages[index - 1]} prevMessage={messages[index + 1]} />
                ))}
            </InfiniteScroll>
        </div>
    )
}