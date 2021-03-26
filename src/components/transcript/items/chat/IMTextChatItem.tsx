import { TextChatItemRepresentation, TextPart, TextPartAttributeType, TextPartType } from "imcore-ajax-core"
import React, { PropsWithoutRef } from "react"
import IMMakeLog from "../../../../util/log"
import { IMItemRenderingContext } from "../Message"

const Log = IMMakeLog("IMTextChatItem")

interface IMTextChatItemRenderContext extends IMItemRenderingContext<TextChatItemRepresentation> {}

interface IMTextPartRenderContext extends IMTextChatItemRenderContext {
    part: TextPart;
}

type IMTextPartProps = PropsWithoutRef<IMTextPartRenderContext>

enum IMTextPartFormattingDirective {
    bold = "text-part-bold",
    underline = "text-part-underline"
}

function ERExtractFormattingDirectivesForIMTextPart(part: TextPart): IMTextPartFormattingDirective[] {
    const directives: Set<IMTextPartFormattingDirective> = new Set()

    if (part.attributes) {
        for (const attr of part.attributes) {
            switch (attr.key) {
                case TextPartAttributeType.bold:
                case TextPartAttributeType.mention:
                    directives.add(IMTextPartFormattingDirective.bold)
                    break
                case TextPartAttributeType.writingDirection:
                    break
                default:
                    Log.warn("No formatting implementation available for TextPartAttributeType", attr.key)
            }
        }
    }

    if (part.type === TextPartType.calendar) directives.add(IMTextPartFormattingDirective.underline)

    return Array.from(directives)
}

function IMTextPartAttributeFormatter({ part, directives: additionalDirectives = [] }: IMTextPartProps & { directives?: IMTextPartFormattingDirective[] }) {
    const directives = ERExtractFormattingDirectivesForIMTextPart(part).concat(additionalDirectives)

    if (!directives.length) {
        return (
            <React.Fragment>
                {part.string}
            </React.Fragment>
        )
    }

    return (
        <span className={directives.join(' ')}>{part.string}</span>
    )
}

function IMTextLinkPart(ctx: IMTextPartProps) {
    return (
        <a href={ctx.part.data}>
            <IMTextPartAttributeFormatter {...ctx} />
        </a>
    )
}

function componentForPart(part: TextPart) {
    switch (part.type) {
        case TextPartType.link:
            return IMTextLinkPart
        case TextPartType.text:
        case TextPartType.calendar:
            return IMTextPartAttributeFormatter
        default:
            Log.warn("No implementation available for text part with type", part.type)
            return IMTextPartAttributeFormatter
    }
}

function IMTextChatItem(ctx: PropsWithoutRef<IMTextChatItemRenderContext>) {
    return (
        <React.Fragment>
            {ctx.item.subject ? (
                <React.Fragment>
                    <IMTextPartAttributeFormatter {...ctx} part={{
                        type: TextPartType.text,
                        string: ctx.item.subject
                    }} directives={[IMTextPartFormattingDirective.bold]} />
                    <br />
                </React.Fragment>
            ) : null}
            {ctx.item.parts.map((part, index) => {
                const Component = componentForPart(part)

                if (!Component) return null
                
                return <Component key={`${ctx.item.id}-${index}`} part={part} {...ctx} />
            })}
        </React.Fragment>
    )
}

export default React.memo(IMTextChatItem, ({ item: prevItem }, { item: newItem }) => JSON.stringify(prevItem) === JSON.stringify(newItem))