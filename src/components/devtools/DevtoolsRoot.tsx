import React, { useLayoutEffect, useState } from "react";
import NewWindow from "react-new-window";
import { TracingProvider } from "../../hooks/useTracer";
import DebugSettings from "./sections/DebugSettings";
import GroupSettings from "./sections/GroupSettings";
import Settings from "./sections/Settings";
import Statistics from "./sections/Statistics";
import TracerRoot from "./tracer/TracerRoot";

export default function DevtoolsRoot() {
    const [ showTracer, setShowTracer ] = useState(false);
    const [ showedTracer, setShowedTracer ] = useState(false);

    useLayoutEffect(() => {
        if (showTracer) setShowedTracer(true);
    }, [ showTracer ]);

    return (
        <div className="devtools-root">
            <Statistics />
            <DebugSettings />
            <GroupSettings />
            <Settings />
            <TracingProvider shouldTrace={showedTracer}>
                <details>
                    <summary>Tracer</summary>

                    <button className="detail-row detail-btn" onClick={() => setShowTracer(!showTracer)}>
                        Toggle Tracer
                    </button>

                    {showTracer ? (
                        <NewWindow>
                            <TracerRoot />
                        </NewWindow>
                    ) : null}
                </details>
            </TracingProvider>
        </div>
    );
}