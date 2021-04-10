import { WSTraceData } from "imcore-ajax-core";
import React from "react";
import JSONView from "react-json-view";
import "./WSTrace.scss";

export default function WSTrace({
    data: {
        timestamp,
        payload,
        fromMe,
        fromServer
    }
}: { data: WSTraceData }) {
    return (
        <div className="ws-trace-entry" attr-from-me={fromMe.toString()} attr-from-server={fromServer.toString()}>
            <code className="ws-trace-label">
                {payload.type}
            </code>
            <div className="ws-trace-data">
                <JSONView name={null} collapsed={true} src={payload.data} />
            </div>
        </div>
    );
}