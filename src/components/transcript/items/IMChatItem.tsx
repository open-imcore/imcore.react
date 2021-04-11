import { AnyChatItemModel, ChatItemType, ChatRepresentation, MessageRepresentation } from "imcore-ajax-core";
import React, { PropsWithChildren, useContext, useMemo, useRef } from "react";
import { IMURI } from "../../../context-menu";
import { TapbackContext } from "../../../contexts/TapbackContext";
import "../../../styles/transcript/items/IMChatItem.scss";
import AcknowledgmentPickerPresenter from "../acknowledgments/AcknowledgmentPickerPresenter";
import IMAttachmentChatItem from "./chat/IMAttachmentChatItem";
import IMPluginChatItem from "./chat/IMPluginChatItem";
import IMTextChatItem from "./chat/IMTextChatItem";
import IMTypingChatItem from "./chat/IMTypingChatItem";
import { extractAcknowledgments, IMItemIsJumbo } from "./IMChatItem.Foundation";
import { IMItemRenderingContext } from "./Message";

type ChatItemComponentRenderer = ((opts: {
    item: AnyChatItemModel["payload"],
    message: MessageRepresentation,
    chat: ChatRepresentation,
    changed: IMItemRenderingContext["changed"],
    index: number
}) => JSX.Element) | null;

function chatItemComponentForItem(item: AnyChatItemModel): ChatItemComponentRenderer {
    switch (item.type) {
        case ChatItemType.text:
            return IMTextChatItem as ChatItemComponentRenderer;
        case ChatItemType.attachment:
            return IMAttachmentChatItem as ChatItemComponentRenderer;
        case ChatItemType.plugin:
            return IMPluginChatItem as ChatItemComponentRenderer;
        case ChatItemType.typing:
            return IMTypingChatItem as ChatItemComponentRenderer;
        case ChatItemType.sticker:
        default:
            return null;
    }
}

export function isChatItem(item: AnyChatItemModel) {
    return !!chatItemComponentForItem(item);
}

export default function IMChatItem({ item, message, chat, changed, index }: PropsWithChildren<IMItemRenderingContext>) {
    if (item.type === ChatItemType.plugin && item.payload.fallback) item = item.payload.fallback;
    const Component = chatItemComponentForItem(item) as ChatItemComponentRenderer;

    const acknowledgments = extractAcknowledgments(item);
    const isJumbo = useMemo(() => IMItemIsJumbo(item), [item]);

    const { tapbackItemID } = useContext(TapbackContext);

    const itemContainer = useRef<HTMLDivElement>(null);

    const isAcknowledgingCurrent = tapbackItemID === item.payload.id;

    if (!Component) return null;

    return (
        <>
            <div ref={itemContainer} className={`chat-item-container${isJumbo ? " chat-item-jumbo" : ""}`} attr-is-acknowledging={(tapbackItemID === item.payload.id).toString()} attr-imcore-uri={IMURI.fromItem(item)} data-has-acknowledgments={(acknowledgments.length > 0).toString()} attr-chat-item-id={item.payload.id}>
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

                {
                    isAcknowledgingCurrent ? (
                        <AcknowledgmentPickerPresenter rootRef={itemContainer} />
                    ) : null
                }
            </div>
        </>
    );
}