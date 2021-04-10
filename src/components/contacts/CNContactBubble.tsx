import { ContactRepresentation } from "imcore-ajax-core";
import React from "react";
import { CNPictureResolver, useResourceURI } from "../../hooks/useResourceURI";
import "../../styles/contacts/CNContactBubble.scss";

function formattedName(contact?: ContactRepresentation | null): string | null {
    if (!contact) return null;

    const { firstName, lastName } = contact;
    if (!firstName && !lastName) return null;

    let initials = "";
    if (firstName) initials += firstName[0].toUpperCase();
    if (lastName) initials += lastName[0].toUpperCase();
    
    return initials;
}

export default function CNContactBubble({ contact, className }: { contact: ContactRepresentation | null; className?: string; }) {
    const contactInitials = formattedName(contact);

    const backgroundPhotoURL = useResourceURI(contact?.hasPicture ? contact.id : null, CNPictureResolver);

    return (
        <div className={`${backgroundPhotoURL ? "cn-bubble" : contactInitials ? "cn-bubble cn-bubble-initials" : "cn-bubble cn-bubble-empty"}${className ? ` ${className}` : ""}`} style={backgroundPhotoURL ? {
            backgroundImage: `url(${backgroundPhotoURL})`
        }: {}}>
            {contactInitials}
        </div>
    );
}