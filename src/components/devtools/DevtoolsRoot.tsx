import React from "react";
import DebugSettings from "./sections/DebugSettings";
import Settings from "./sections/Settings";
import Statistics from "./sections/Statistics";

export default function DevtoolsRoot() {
    return (
        <div>
            <Statistics />
            <DebugSettings />
            <Settings />
        </div>
    );
}