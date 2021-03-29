import React from "react";

export default React.memo(function IMTypingChatItem() {
    return (
        <div className="typing-item">
            <div className="typing-dot-1" />
            <div className="typing-dot-2" />
            <div className="typing-dot-3" />
        </div>
    );
});