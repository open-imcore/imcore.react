import { ContactRepresentation } from "imcore-ajax-core";
import React, { PropsWithChildren, useLayoutEffect, useState } from "react";
import { apiClient } from "../../app/connection";
import "../../styles/contacts/CNContactBubble.scss";

export default function CNContactBubble(props: PropsWithChildren<{ contact: ContactRepresentation | null; className?: string; }>) {
    const contact = props.contact;
    const [backgroundPhotoURL, setBackgroundPhotoURL] = useState(null as string | null);
    const [contactInitials, setContactInitials] = useState(null as string | null);

    useLayoutEffect(() => {
        setBackgroundPhotoURL(contact?.hasPicture ? apiClient.contactPhotoURL(contact.id) : null);

        if (contact) {
            const { firstName, lastName } = contact;
            if (!firstName && !lastName) setContactInitials(null);
            else {
                let initials = "";
                if (firstName) initials += firstName[0].toUpperCase();
                if (lastName) initials += lastName[0].toUpperCase();
                setContactInitials(initials);
            }
        } else {
            setContactInitials(null);
        }
    }, [contact]);

    return (
        <div className={`${backgroundPhotoURL ? "cn-bubble" : contactInitials ? "cn-bubble cn-bubble-initials" : "cn-bubble cn-bubble-empty"}${props.className ? ` ${props.className}` : ""}`} style={backgroundPhotoURL ? {
            backgroundImage: `url(${backgroundPhotoURL})`
        }: {}}>
            {contactInitials}
        </div>
    );
}