import { ContactRepresentation } from "imcore-ajax-core";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectHandleIDToContact } from "../app/reducers/contacts";

export function useContactResolver(handleIDs: string[]): Array<ContactRepresentation | null> {
    const [resolved, setResolved] = useState([] as Array<ContactRepresentation | null>)
    const handleIDToContact = useSelector(selectHandleIDToContact)

    useEffect(() => {
        setResolved(handleIDs.map(handleID => handleIDToContact[handleID] || null))
    }, [handleIDs, handleIDToContact])

    return resolved
}