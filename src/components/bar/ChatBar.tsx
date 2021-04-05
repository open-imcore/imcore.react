import React, { useContext } from "react";
import { ReactComponent as MagnifyingGlass } from "../../assets/magnifying-glass.svg";
import { ReactComponent as PenAndPencil } from "../../assets/pen.pencil.svg";
import { ChatSearchContext } from "../../contexts/ChatSearchContext";

export default function ChatBar() {
    const { searchCriteria, setSearchCriteria } = useContext(ChatSearchContext);

    return (
        <div className="chat-toolbar">
            <label className="search-field">
                <MagnifyingGlass />
                <input type="search" placeholder="Search" value={searchCriteria || ""} onChange={event => {
                    setSearchCriteria((event.target as HTMLInputElement).value);
                }} />
            </label>
            <button className="new-chat">
                <PenAndPencil />
            </button>
        </div>
    );
}