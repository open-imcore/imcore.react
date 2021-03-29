import React from "react";

export interface DebugBooleanContext {
    name: string;
    value: boolean;
    onInput: (value: boolean) => any;
}

export default function DebugBoolean({ name, value, onInput }: DebugBooleanContext) {
    return (
        <label className="detail-row detail-checkbox">
            <span className="detail-label">{name}</span>
            <input type="checkbox" className="detail-info" checked={value} onInput={e => onInput(!value)} />
        </label>
    );
}