import type { Role } from "@workspace/database/constants";

export type Member = {
  id: string;
  image?: string;
  name: string;
  email: string;
  role: Role;
  isOwner: boolean;
  dateAdded: Date;
  lastLogin?: Date;
};
