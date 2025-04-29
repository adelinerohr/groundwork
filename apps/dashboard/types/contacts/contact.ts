import { ContactStage } from "@workspace/database/constants";

export type Contact = {
  id: string;
  image?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  stage: ContactStage;
};
