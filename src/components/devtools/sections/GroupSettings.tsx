import React, { ReactNode, useEffect, useState } from "react";
import { apiClient } from "../../../app/connection";
import { EventBus } from "../../../hooks/useEvent";
import { DSLDebugTools } from "../../react-window-dynamic/DynamicSizeList";
import { useCurrentChat } from "../../transcript/ChatTranscriptFoundation";

function DraftInput({ label, placeholder, value, commit }: { label: ReactNode, placeholder: string | undefined, value: string | undefined, commit: (savedValue: string | undefined | null) => any }) {
    const [ draft, setDraft ] = useState<string | undefined | null>(null!);
    const [ busy, setBusy ] = useState(false);

    if (draft === null) setDraft(value);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    return (
        <label className="detail-row detail-input">
            <span className="detail-label">{label}</span>
            <input type="text" placeholder={placeholder} value={draft!} onChange={e => {
                setDraft(e.target.value);
            }} onKeyDown={async e => {
                if (busy) return;
                
                if (e.key !== "Enter") return;
                e.preventDefault();
                setBusy(true);
                
                try {
                    await commit(draft);
                } finally {
                    setBusy(false);
                }
            }} />
        </label>
    );
}

interface InputProps {
    disabled?: boolean;
    className?: string;
    children?: ReactNode;
}

interface CheckboxProps extends InputProps {
    value: boolean;
    changed: (value: boolean) => any;
}

const mergeClassName = (className: string, className1?: string | undefined) => `${className}${className1 ? ` ${className1}` : ""}`;

type AnonymizedFunction<T> = T extends (...args: infer U) => any ? (...args: U) => Promise<void> : never;

function useBusyController<T extends (...args: any) => any>({ disabled, fn }: { disabled?: boolean, fn: T }): [ boolean, AnonymizedFunction<T> ] {
    const [ busy, setBusy ] = useState(false);
    const canProceed = !(busy || disabled);

    return [
        !canProceed,
        (async (...args: Parameters<T>[]) => {
            if (!canProceed) return;

            setBusy(true);
            await fn(...args);
            setBusy(false);
        }) as unknown as AnonymizedFunction<T>
    ];
}

function DebugCheckbox({ disabled, changed, className, children, value }: CheckboxProps) {
    const [ isDisabled, fire ] = useBusyController({ disabled, fn: changed });

    return (
        <label className={mergeClassName("detail-row detail-checkbox", className)}>
            <span className="detail-label">{children}</span>
            <input disabled={isDisabled} type="checkbox" className="detail-info" checked={value} onChange={async ev => {
                fire(ev.target.checked);
            }} />
        </label>
    );
}

interface ButtonProps extends InputProps {
    click: () => any;
}

function DebugButton({ disabled, click, className, children }: ButtonProps) {
    const [ isDisabled, fire ] = useBusyController({ disabled, fn: click });

    return (
        <button className={mergeClassName("detail-row detail-btn", className)} disabled={isDisabled} onClick={e => {
            e.preventDefault();
            fire();
        }}>
            {children}
        </button>
    );
}

export default function GroupSettings() {
    const currentChat = useCurrentChat();

    if (!currentChat) return null;

    return (
        <>
            <details>
                <summary>Chat Settings</summary>
                
                <div className="debug-details">
                    <DebugCheckbox value={currentChat.readReceipts} changed={readReceipts => apiClient.chats.patchProperties(currentChat.id, { readReceipts })}>
                        Send Read Receipts
                    </DebugCheckbox>

                    <DebugCheckbox value={currentChat.ignoreAlerts} changed={ignoreAlerts => apiClient.chats.patchProperties(currentChat.id, { ignoreAlerts })}>
                        Ignore Alerts
                    </DebugCheckbox>

                    <DebugButton click={() => apiClient.chats.readAllMessages(currentChat.id)}>
                        Mark All As Read
                    </DebugButton>

                    <DebugButton click={() => apiClient.chats.setTyping(currentChat.id, true)}>
                        Start Typing
                    </DebugButton>

                    <DebugButton click={() => apiClient.chats.setTyping(currentChat.id, false)}>
                        Stop Typing
                    </DebugButton>

                    <DebugButton click={() => apiClient.chats.deleteChat(currentChat.id)}>
                        Delete Chat
                    </DebugButton>
                </div>
            </details>
            <details>
                <summary>DSL</summary>

                <div className="debug-details">
                    {DSLDebugTools.map(({ name, event }) => (
                        <DebugButton key={name} click={() => EventBus.emit(event)}>
                            {name}
                        </DebugButton>
                    ))}
                </div>
            </details>
            {currentChat.style === 43 ? (
                <details>
                    <summary>Group Settings</summary>
                    <DraftInput label={<>Group Name</>} placeholder="Group Name" value={currentChat.displayName} commit={newGroupName => {
                        apiClient.chats.rename(currentChat.id, newGroupName || null);
                    }} />

                    <div className="detail-row">
                        <span className="detail-label">Participants</span>
                        {
                            currentChat.participants.map(participant => (
                                <div className="detail-info" key={participant}>
                                    {participant}
                                    <DebugButton click={async () => {
                                        await apiClient.chats.removeParticipants(currentChat.id, [participant]);
                                    }}>
                                        Remove
                                    </DebugButton>
                                </div>
                            ))
                        }
                    </div>
                </details>
            ) : null}
        </>
    );
}