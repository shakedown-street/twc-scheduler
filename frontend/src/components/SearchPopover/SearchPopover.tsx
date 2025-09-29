/* eslint-disable @typescript-eslint/no-explicit-any */

import { http } from '@/lib/http';
import { useDebounce } from '@/utils/debounce';
import { Loader } from 'lucide-react';
import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export type SearchPopoverProps = {
  endpoint: string;
  onChange: (value: any) => void;
  parameter: string;
  renderMatch: (match: any) => React.ReactNode;
  searchLabel?: string;
  trigger: React.ReactNode;
};

export const SearchPopover = ({
  endpoint,
  onChange,
  parameter,
  renderMatch,
  searchLabel,
  trigger,
}: SearchPopoverProps) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [matches, setMatches] = React.useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = React.useState(false);

  const debouncedSearch = useDebounce((value: string) => {
    setMatchesLoading(true);
    http
      .get(`${endpoint}?${parameter}=${value}`)
      .then((res) => {
        setMatches(res.data.results);
      })
      .finally(() => {
        setMatchesLoading(false);
      });
  }, 500);

  function renderMatches() {
    if (matchesLoading) {
      return (
        <div className="mt-4 flex items-center justify-center">
          <Loader className="h-4 w-4 animate-spin" />
        </div>
      );
    }

    if (!searchValue || matches.length < 1) {
      return null;
    }

    return (
      <div className="mt-4 max-h-48 overflow-auto">
        {matches.map((match: any, idx: number) => {
          return (
            <div
              className="hover:bg-primary hover:text-primary-foreground flex items-center rounded-md px-3 text-sm leading-8"
              key={idx}
              onClick={() => {
                onChange(match);
                setPopoverOpen(false);
              }}
            >
              {renderMatch(match)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
        <PopoverContent className="p-4">
          <Label className="mb-2" htmlFor="search">
            {searchLabel ? searchLabel : 'Search'}
          </Label>
          <Input
            autoFocus
            className="w-full"
            id="search"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (e.target.value.length > 0) {
                debouncedSearch(e.target.value);
              } else {
                setMatches([]);
              }
            }}
          />
          {renderMatches()}
        </PopoverContent>
      </Popover>
    </>
  );
};
