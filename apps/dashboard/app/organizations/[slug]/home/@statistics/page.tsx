import * as React from "react";
import { searchParamsCache } from "~/components/organizations/home/helpers/home-search-params";
import { ClientCard } from "~/components/organizations/home/statistics/client-card";
import { getClientData } from "~/data/statistics/get-client-data";

export default async function StatisticsPage({ searchParams }: NextPageProps) {
  const parsedSearchParams = await searchParamsCache.parse(searchParams);
  const data = await getClientData(parsedSearchParams);

  return <ClientCard data={data} />;
}
