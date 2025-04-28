import { type Role } from "~/lib/constants";
import type { PersonalDetails } from "~/types/account/personal-details";

type ActiveOrganizationPermissions = { isOwner: boolean; role: Role };

export type Profile = PersonalDetails & ActiveOrganizationPermissions;
