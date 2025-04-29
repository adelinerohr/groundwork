"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { useQueryState } from "nuqs";

import { Button } from "@workspace/ui/components/button";
import { DataTableFilter } from "@workspace/ui/components/data-table";
import { InputSearch } from "@workspace/ui/components/input";
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query";
import { MediaQueries } from "@workspace/ui/lib/media-queries";

import { useTransitionContext } from "~/hooks/use-transition-context";
import { ContactStage } from "@workspace/database/constants";
import { searchParams } from "../helpers/contacts-search-params";
import { contactStageLabel } from "~/lib/labels";

export type ContactsFiltersProps = {
  stages: ContactStage[];
};

export function ContactsFilters({
  stages,
}: ContactsFiltersProps): React.JSX.Element {
  const { startTransition } = useTransitionContext();
  const [showMobileSerch, setShowMobileSearch] = React.useState<boolean>(false);
  const smUp = useMediaQuery(MediaQueries.SmUp, { fallback: false });

  const [searchQuery, setSearchQuery] = useQueryState(
    "searchQuery",
    searchParams.searchQuery.withOptions({
      startTransition,
      shallow: false,
    })
  );

  const [selectedStages, setSelectedStages] = useQueryState(
    "stages",
    searchParams.stages.withOptions({
      startTransition,
      shallow: false,
    })
  );

  const [pageIndex, setPageIndex] = useQueryState(
    "pageIndex",
    searchParams.pageIndex.withOptions({
      startTransition,
      shallow: false,
    })
  );

  const handleSearchQueryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target?.value || "";
    if (value !== searchQuery) {
      setSearchQuery(value);
      if (pageIndex !== 0) {
        setPageIndex(0);
      }
    }
  };

  const handleStagesChange = (stages: ContactStage[]): void => {
    setSelectedStages(stages);
    if (pageIndex !== 0) {
      setPageIndex(0);
    }
  };

  const handleShowMobileSearch = (): void => {
    setShowMobileSearch(true);
  };

  const handleHideMobileSearch = (): void => {
    setShowMobileSearch(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DataTableFilter
          title="Stage"
          options={stages.map((stage) => ({
            value: stage,
            label: contactStageLabel[stage],
          }))}
          selected={selectedStages || []}
          onChange={(values) => handleStagesChange(values as ContactStage[])}
        />
      </div>
      <div>
        {smUp ? (
          <InputSearch
            placeholder="Search by name or email..."
            className="w-[240px]"
            value={searchQuery}
            onChange={handleSearchQueryChange}
          />
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleShowMobileSearch}
            >
              <SearchIcon className="size-4 shrink-0" />
            </Button>
            {showMobileSerch && (
              <div className="absolute inset-0 z-30 bg-background pl-3 pr-5">
                <InputSearch
                  autoFocus
                  alwaysShowClearButton
                  placeholder="Search by name or email..."
                  className="h-12 w-full border-none !ring-0"
                  containerClassName="h-12"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  onClear={handleHideMobileSearch}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
