import { AnyChatItemModel, ChatItemType, ChatRepresentation, MessageRepresentation } from "imcore-ajax-core";
import React, { PropsWithChildren } from "react";
import { IMURI } from "../../../context-menu";
import "../../../styles/transcript/items/IMTranscriptItem.scss";
import { useFormattedTimestamp } from "../../../util/receipt-formatting";
import { IMItemRenderingContext } from "./Message";
import IMDateSeparatorItem from "./transcript/IMDateSeparatorItem";
import IMGroupTitleChangeItem from "./transcript/IMGroupTitleChangeItem";
import IMParticipantChangeItem from "./transcript/IMParticipantChangeItem";

export const DATE_SEPARATOR_TYPE: ChatItemType = Symbol("DATE_SEPARATOR") as unknown as ChatItemType;

const transcriptTypes = [
    ChatItemType.date,
    ChatItemType.participantChange,
    ChatItemType.groupAction,
    ChatItemType.groupTitle,
    DATE_SEPARATOR_TYPE
];

function itemIsTranscriptLike(item: AnyChatItemModel) {
    return transcriptTypes.includes(item.type);
}

function componentForItem(item: AnyChatItemModel) {
    switch (item.type) {
        case ChatItemType.groupTitle:
            return IMGroupTitleChangeItem;
        case ChatItemType.participantChange:
            return IMParticipantChangeItem;
        case DATE_SEPARATOR_TYPE:
            return IMDateSeparatorItem;
        default:
            return null;
    }
}

export function isTranscriptItem(item: AnyChatItemModel) {
    return itemIsTranscriptLike(item) && componentForItem(item) !== null;
}

export default function IMTranscriptItem({ item, message, chat }: PropsWithChildren<IMItemRenderingContext>) {
    const Component = componentForItem(item) as ((opts: {
        item: AnyChatItemModel["payload"],
        message: MessageRepresentation,
        chat: ChatRepresentation
    }) => JSX.Element) | null;

    const { date, time } = useFormattedTimestamp(message.time) || {};

    if (!Component) return null;

    return (
        <div className="transcript-item-container" attr-imcore-uri={IMURI.fromItem(item)} >
            <div className="transcript-label">{date} <span className="transcript-label-value">{time}</span></div>
            <Component item={item.payload} message={message} chat={chat} key={item.payload.id} />
        </div>
    );
}