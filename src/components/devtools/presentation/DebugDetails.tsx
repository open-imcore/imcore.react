import React from "react";

export type Stringable = string | number | boolean | null | undefined;

export default function DebugDetails({ details }: { details: [Stringable, Stringable][] }) {
    return (
        <div className="debug-details">
            {details.map(([ name, value ], index) => (
                <div className="detail-row" key={index}>
                    <span className="detail-label">{name?.toString()}</span>
                    <span className="detail-info">{value?.toString()}</span>
                </div>
            ))}
        </div>
    );
}