import type { InvitationStatus, Role } from "@workspace/database/constants";

export type Invitation = {
  id: string;
  token: string;
  status: InvitationStatus;
  email: string;
  role: Role;
  lastSent?: Date;
  dateAdded: Date;
};
