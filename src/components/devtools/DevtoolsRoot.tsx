import React from "react";
import Statistics from "./sections/Statistics";
import DebugSettings from "./sections/DebugSettings";
import Settings from "./sections/Settings";

export default function DevtoolsRoot() {
    return (
        <div>
            <Statistics />
            <DebugSettings />
            <Settings />
        </div>
    )
}