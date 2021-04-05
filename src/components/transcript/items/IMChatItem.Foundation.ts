import createRegex from "emoji-regex/RGI_Emoji";
import { AcknowledgmentChatItemRepresentation, AnyChatItemModel, ChatItemType } from "imcore-ajax-core";

export function extractAcknowledgments(item: AnyChatItemModel): AcknowledgmentChatItemRepresentation[] {
    switch (item.type) {
        case ChatItemType.text:
        case ChatItemType.attachment:
        case ChatItemType.plugin:
            if (!item.payload.acknowledgments) return [];

            const acknowledgments: AcknowledgmentChatItemRepresentation[] = [];

            for (const acknowledgment of item.payload.acknowledgments) {
                if (acknowledgment.acknowledgmentType < 3000) acknowledgments.push(acknowledgment);
            }

            return acknowledgments.sort((ack1, ack2) => ack1.fromMe ? -1 : (ack2.time - ack1.time));
        default:
            return [];
    }
}

function emojiCount(str: string) {
    const joiner = "\u{200D}";
    const split = str.split(joiner);
    let count = 0;
    
    for(const s of split){
        //removing the variation selectors
        const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join("")).length;
        count += num;
    }
    
    //assuming the joiners are used appropriately
    return count / split.length;
}

const regex = createRegex();

function IMTextChatItemIsJumbo(text: string): boolean {
    if (emojiCount(text) > 3) return false;

    return text.replace(/\s/g, "").replace(regex, "").length === 0;
}

export function IMItemIsJumbo(item: AnyChatItemModel): boolean {
    return item.type === ChatItemType.text && !item.payload.subject && IMTextChatItemIsJumbo(item.payload.text);
}