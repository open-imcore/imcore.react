import React, { PropsWithChildren, useMemo } from "react";
import { AnyChatItemModel, ChatItemType, ChatRepresentation, MessageRepresentation } from "imcore-ajax-core";
import { IMItemRenderingContext } from "./Message";
import IMTextChatItem from "./chat/IMTextChatItem";
import IMAttachmentChatItem from "./chat/IMAttachmentChatItem";
import IMPluginChatItem from "./chat/IMPluginChatItem";
import "../../../styles/transcript/items/IMChatItem.scss";
import { extractAcknowledgments, IMItemIsJumbo } from "./IMChatItem.Foundation"
import IMTypingChatItem from "./chat/IMTypingChatItem";

function componentForItem(item: AnyChatItemModel) {
    switch (item.type) {
        case ChatItemType.text:
            return IMTextChatItem;
        case ChatItemType.attachment:
            return IMAttachmentChatItem
        case ChatItemType.plugin:
            return IMPluginChatItem
        case ChatItemType.typing:
            return IMTypingChatItem
        case ChatItemType.sticker:
        default:
            return null
    }
}

export function isChatItem(item: AnyChatItemModel) {
    return !!componentForItem(item);
}

export default function IMChatItem({ item, message, chat, changed, index }: PropsWithChildren<IMItemRenderingContext>) {
    const Component = componentForItem(item) as ((opts: {
        item: AnyChatItemModel['payload'],
        message: MessageRepresentation,
        chat: ChatRepresentation,
        changed: IMItemRenderingContext['changed'],
        index: number
    }) => JSX.Element) | null

    const acknowledgments = extractAcknowledgments(item)
    const isJumbo = useMemo(() => IMItemIsJumbo(item), [item]);

    if (!Component) return null

    return (
        <>
            <div className={`chat-item-container${isJumbo ? ' chat-item-jumbo' : ''}`} data-has-acknowledgments={(acknowledgments.length > 0).toString()}>
                <div className="chat-item" data-item-type={item.type} attr-from-me={message.fromMe.toString()}>
                    <div className="item-inner">
                        <Component index={index} item={item.payload} message={message} chat={chat} changed={changed} key={item.payload.id} />
                    </div>
                </div>

                {
                    acknowledgments.length ? (
                        <div className="acknowledgment-overlay" data-acknowledgment-count={acknowledgments.length} data-acknowledgment-from-me={acknowledgments.some(a => a.fromMe).toString()}>
                            {acknowledgments.slice(0, 3).map(ack => (
                                <div className="acknowledgment-item" key={ack.id} data-ack-type={ack.acknowledgmentType} data-from-me={ack.fromMe} />
                            ))}
                        </div>
                    ) : null
                }
            </div>
        </>
    )
}