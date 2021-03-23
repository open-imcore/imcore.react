import { AnyChatItemModel, ChatRepresentation, MessageRepresentation } from "imcore-ajax-core";
import React, { PropsWithRef, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectHandleIDToContact } from "../../../app/reducers/contacts";
import { useFormattedHandles } from "../../../hooks/useFormattedHandles";
import "../../../styles/transcript/items/Message.scss";
import IMChatItem, { isChatItem } from "./IMChatItem";
import IMTranscriptItem, { isTranscriptItem } from "./IMTranscriptItem";
import { analyzeMessage, messagesAreContiguous } from "./Message.foundation";
import { formatPhoneNumber } from "../../../hooks/useFormattedHandles"
import { ChatContext } from "../ChatTranscriptFoundation";
import { ChatStyle } from "../../chat/ChatBubble";
import CNContactBubble from "../../contacts/CNContactBubble";
import { useFormattedReceipt } from "../../../util/receipt-formatting";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export interface IMItemRenderingContext<Item = AnyChatItemModel> {
    item: Item
    message: MessageRepresentation
    chat: ChatRepresentation
    changed: () => any
}

function componentForItem(item: AnyChatItemModel) {
    if (isTranscriptItem(item)) return IMTranscriptItem
    else if (isChatItem(item)) return IMChatItem
    else return null
}

export function messageIsEmpty(message: MessageRepresentation) {
    return message.items.filter(i => componentForItem(i)).length === 0
}

function useContact(message: MessageRepresentation) {
    return useSelector(selectHandleIDToContact)[message.sender || ""] || null
}

function useMessageSenderName(message: MessageRepresentation) {
    const contact = useContact(message)

    if (contact?.fullName) return contact.fullName
    else return formatPhoneNumber(message.sender || "<< system >>")
}

function usePrevious<T>(value: T, defaultValue: T): T {
    const ref = useRef<T>(defaultValue);

    useEffect(() => {
        ref.current = value;
    });

    return ref.current!;
}

const readReceiptTransitionManager: Map<string, boolean> = new Map();

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

function Message({ eRef, message, nextMessage, prevMessage, lastDeliveredFromMe, lastReadFromMe, changed, style }: PropsWithRef<{
    message: MessageRepresentation,
    nextMessage?: MessageRepresentation,
    prevMessage?: MessageRepresentation,
    lastDeliveredFromMe?: string | null,
    lastReadFromMe?: string | null,
    style?: any,
    changed?: () => any,
    eRef?: (elm: Element) => any
}>) {
    const chat = useContext(ChatContext).chat!
    const messageSenderContact = useContact(message)
    const { beginningContiguous, endingContiguous, showImage, showName } = useMemo(() => analyzeMessage({
        message,
        nextMessage,
        chat,
        prevMessage
    }), [JSON.stringify(message), JSON.stringify(nextMessage), JSON.stringify(prevMessage), chat])

    changed = changed || (() => undefined)

    const items = message.items.map((item, index) => {
        const Component = componentForItem(item)

        if (!Component) return null
        
        return <Component key={item.payload.id} changed={changed!} item={item} message={message} chat={chat} />
    }).filter(item => item)

    const messageIsTranscriptMessage = message.items.every(isTranscriptItem);
    const nextIsTranscript = nextMessage?.items.every(isTranscriptItem) || false;
    const prevIsTranscript = prevMessage?.items.every(isTranscriptItem) || false;

    const senderName = useMessageSenderName(message)

    const showReceipt = chat.style === ChatStyle.solo && message.fromMe && (lastDeliveredFromMe === message.id || lastReadFromMe === message.id);

    const formattedReceipt = useFormattedReceipt(showReceipt ? message.timeRead : null);

    const [isComplete, setIsComplete] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isAppearing, setIsAppearing] = useState(false);
    const [isDisappearing, setIsDisappearing] = useState(false);

    if (!readReceiptTransitionManager.has(message.id)) readReceiptTransitionManager.set(message.id, showReceipt)
    else if (!isTransitioning && readReceiptTransitionManager.get(message.id) !== showReceipt) {
        setIsAppearing(showReceipt);
        setIsDisappearing(!showReceipt);
        setIsTransitioning(true);
        setIsComplete(false);
    }

    useEffectAfterFirstRun(() => {
        if (isComplete) {
            readReceiptTransitionManager.set(message.id, showReceipt);
            setIsTransitioning(false);
            setIsAppearing(false);
            setIsDisappearing(false);
        }
    }, [isComplete]);

    const showTimestamp = !prevMessage || (prevMessage.time - message.time) > (1000 * 60 * 60);

    return (
        items.length ? (
            <div className="message-container" ref={eRef as unknown as React.ClassAttributes<HTMLDivElement>['ref']} style={style}>
                <div className="message" attr-prev-contiguous={beginningContiguous.toString()} attr-next-contiguous={endingContiguous.toString()} attr-next-transcript-contiguous={(messageIsTranscriptMessage && nextIsTranscript).toString()} attr-prev-transcript-contiguous={(messageIsTranscriptMessage && prevIsTranscript).toString()} attr-from-me={message.fromMe.toString()} attr-service={message.service}>
                    {
                        messageIsTranscriptMessage ? items : <>
                            {
                                (chat.style === ChatStyle.group && !message.fromMe) ? (
                                    <div className="buddy-picture-track">
                                        {showImage ? (
                                            <CNContactBubble contact={messageSenderContact} />
                                        ) : null}
                                    </div>
                                ) : null
                            }
                            <div className="items-track">
                                { showName ? (
                                    <div className="buddy-name">{senderName}</div>
                                ) : null}
                                {items}
                                { showReceipt || isTransitioning ? (
                                    <span
                                        className="transcript-label message-receipt"
                                        attr-is-transitioning={isTransitioning.toString()}
                                        attr-is-appearing={isAppearing.toString()}
                                        attr-is-disappearing={isDisappearing.toString()}
                                        onAnimationEnd={() => setIsComplete(true)}
                                        >
                                        {message.timeRead ? (
                                            <>Read <span className="transcript-label-value">{formattedReceipt}</span></>
                                        ) : "Delivered"}
                                    </span>
                                ) : null}
                            </div>
                        </>
                    }
                </div>
            </div>
        ) : null
    )
}

function omit<T, K extends keyof T>(obj: T, key: K): Omit<T, K> {
    const newObject = Object.assign({}, obj);
    delete newObject[key];
    return newObject;
}

export default React.memo(Message, (prevProps, nextProps) => {
    function itemChangedViaMemoState(item: MessageRepresentation) {
        if (!item.fromMe) return false;
        else if (prevProps.lastDeliveredFromMe === item.id && nextProps.lastDeliveredFromMe !== item.id) return true;
        else if (nextProps.lastDeliveredFromMe === item.id && prevProps.lastDeliveredFromMe !== item.id) return true;
        else if (prevProps.lastReadFromMe === item.id && nextProps.lastReadFromMe !== item.id) return true;
        else if (nextProps.lastReadFromMe === item.id && prevProps.lastReadFromMe !== item.id) return true;
        else return false;
    }

    if (itemChangedViaMemoState(prevProps.message) || itemChangedViaMemoState(nextProps.message)) return false;
    else if (prevProps.message.id !== nextProps.message.id) return false;
    else if (JSON.stringify(prevProps.message.items) !== JSON.stringify(nextProps.message.items)) return false;
    else return true;
})