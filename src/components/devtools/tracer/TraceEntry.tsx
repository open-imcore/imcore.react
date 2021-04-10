import { AnyTraceData, TraceType } from "imcore-ajax-core";
import React from "react";
import RESTTrace from "./trace-renderers/RESTTrace";
import WSTrace from "./trace-renderers/WSTrace";

interface TraceRenderer {
    (props: { data: AnyTraceData }): JSX.Element;
}

const formatter = new Intl.DateTimeFormat(undefined, {
    timeStyle: "short"
} as any);

const formatTime = (timestamp: number) => formatter.format(timestamp);

export default function TraceEntry({
    data
}: { data: AnyTraceData }) {
    let Component: TraceRenderer;

    switch (data.type) {
        case TraceType.rest:
            Component = RESTTrace as TraceRenderer;
            break;
        case TraceType.ws:
            Component = WSTrace as TraceRenderer;
            break;
        default:
            return null;
    }

    return (
        <div className="trace-entry">
            <div className="trace-inner">
                <Component data={data} />
            </div>
            <code className="trace-timestamp">
                {formatTime(data.timestamp)}
            </code>
        </div>
    );
}