import React from "react";
import { useTracer } from "../../../hooks/useTracer";
import TraceEntry from "./TraceEntry";
import "./TracerRoot.scss";


export default function TracerRoot() {
    const traceData = useTracer();

    return (
        <div className="tracer-root">
            <div className="tracer-header">
                Tracer
            </div>
            <div className="tracer-data">
                {traceData.map(data => (
                    <TraceEntry key={data.timestamp} data={data} />
                ))}
            </div>
        </div>
    );
}