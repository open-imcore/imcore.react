import { AcknowledgmentChatItemRepresentation, AcknowledgmentType, AnyChatItemModel, ChatItemAcknowledgableRepresentation, ChatItemType, MessageRepresentation } from "imcore-ajax-core";
import React from "react";
import { apiClient, receiveMessages } from "../../../app/connection";
import "../../../styles/ack-picker/AcknowledgmentPicker.scss";
import { extractAcknowledgments } from "../items/IMChatItem.Foundation";

export interface AcknowledgmentPickerProps {
    message: MessageRepresentation;
    chatItem: AnyChatItemModel;
}

function itemIsAcknowledgable(type: AnyChatItemModel["type"], item: AnyChatItemModel["payload"]): item is ChatItemAcknowledgableRepresentation {
    switch (type) {
        case ChatItemType.text:
        case ChatItemType.plugin:
        case ChatItemType.attachment:
            return true;
        default:
            return false;
    }
}

interface AcknowledgmentButtonProps extends AcknowledgmentPickerProps {
    ackFromMe: AcknowledgmentChatItemRepresentation | null;
    name: string;
    type: AcknowledgmentType;
}

enum AcknowledgmentName {
    heart = "heart",
    thumbsUp = "thumbs-up",
    thumbsDown = "thumbs-down",
    emphasize = "emphasize",
    question = "question",
    haha = "haha-en"
}

function AcknowledgmentButton({ name, type, ackFromMe, message, chatItem }: AcknowledgmentButtonProps) {
    const isSelected = ackFromMe?.acknowledgmentType === type;

    return (
        <div className="acknowledgment-button" attr-acknowledgment-name={name} attr-selected={isSelected.toString()} onClick={async () => {
            const sendType = isSelected ? type + 1000 : type;

            // store.dispatch(stageAcknowledgmentOverride({
            //     type: sendType,
            //     messageID: message.id,
            //     chatItemID: chatItem.payload.id
            // }));

            const ackMessage = await apiClient.messages.createAssociatedMessage(chatItem.payload.id, message.id, sendType);
            receiveMessages([ ackMessage ]);
        }}>

        </div>
    );
}

export default function AcknowledgmentPicker({ message, chatItem }: AcknowledgmentPickerProps) {
    const acknowledgments = extractAcknowledgments(chatItem);

    if (!itemIsAcknowledgable(chatItem.type, chatItem.payload)) return null;

    const ackFromMe = acknowledgments[0]?.fromMe ? acknowledgments[0] : null;

    return (
        <div className="acknowledgment-picker">
            {([
                [AcknowledgmentName.heart, AcknowledgmentType.heart],
                [AcknowledgmentName.thumbsUp, AcknowledgmentType.thumbsup],
                [AcknowledgmentName.thumbsDown, AcknowledgmentType.thumbsdown],
                [AcknowledgmentName.haha, AcknowledgmentType.ha],
                [AcknowledgmentName.emphasize, AcknowledgmentType.exclamation],
                [AcknowledgmentName.question, AcknowledgmentType.questionmark]
            ] as [AcknowledgmentName, AcknowledgmentType][]).map(([ name, type ]) => (
                <AcknowledgmentButton message={message} chatItem={chatItem} ackFromMe={ackFromMe} name={name} type={type} key={name} />
            ))}
        </div>
    );
}