import * as React from "react";
import { BuildingIcon, UserIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarProps,
} from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

export type ContactAvatarProps = AvatarProps & {
  src?: string;
  alt?: string;
};

export function ContactAvatar({
  src,
  alt,
  className,
  ...other
}: ContactAvatarProps): React.JSX.Element {
  return (
    <Avatar className={cn("size-4 flex-none shrink-0", className)} {...other}>
      <AvatarImage src={src} alt={alt ?? "avatar"} />
      <AvatarFallback>
        <UserIcon className="size-4 shrink-0 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
}
