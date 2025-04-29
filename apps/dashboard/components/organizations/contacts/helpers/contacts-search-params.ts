import { ContactStage } from "@workspace/database/constants";
import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { GetContactsSortBy } from "~/schemas/contacts/get-contacts-schema";
import { SortDirection } from "~/types/sort-direction";

export const searchParams = {
  pageIndex: parseAsInteger.withDefault(0),
  pageSize: parseAsInteger.withDefault(50),
  sortBy: parseAsStringLiteral(Object.values(GetContactsSortBy)).withDefault(
    GetContactsSortBy.Name
  ),
  sortDirection: parseAsStringLiteral(Object.values(SortDirection)).withDefault(
    SortDirection.Asc
  ),
  searchQuery: parseAsString.withDefault(""),
  stages: parseAsArrayOf(
    parseAsStringLiteral(Object.values(ContactStage))
  ).withDefault([]),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serializer = createSerializer(searchParams);
