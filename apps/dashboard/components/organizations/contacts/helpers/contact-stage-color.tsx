import { ContactStage } from "@workspace/database/constants";

export const contactStageColor: Record<ContactStage, string> = {
  [ContactStage.PAST]: "bg-gray-600 ring-1 ring-gray-100 dark:ring-gray-900",
  [ContactStage.POTENTIAL]:
    "bg-orange-600  ring-1 ring-orange-100 dark:ring-orange-900",
  [ContactStage.DEAD]: "bg-red-600 ring-1 ring-red-100 dark:ring-red-900",
  [ContactStage.ACTIVE]:
    "bg-green-600 ring-1 ring-green-100 dark:ring-green-900",
};
