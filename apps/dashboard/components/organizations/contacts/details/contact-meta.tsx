"use client";

import * as React from "react";

import { ResponsiveScrollArea } from "@workspace/ui/components/scroll-area";
import { MediaQueries } from "@workspace/ui/lib/media-queries";

import { Contact } from "~/types/contacts/contact";
import { ContactDetailsSection } from "./contact-details-section";
import { ContactStageSection } from "./contact-stage-section";

export type ContactMetaProps = {
  contact: Contact;
};

export function ContactMeta({ contact }: ContactMetaProps): React.JSX.Element {
  return (
    <ResponsiveScrollArea
      breakpoint={MediaQueries.MdUp}
      mediaQueryOptions={{ ssr: true }}
      className="h-full"
    >
      <div className="size-full divide-y border-b md:w-[360px] md:min-w-[360px]">
        <ContactDetailsSection contact={contact} />
        <ContactStageSection contact={contact} />
      </div>
    </ResponsiveScrollArea>
  );
}
