import React from 'react';
import { http } from '~/http';
import { debounceRef } from '~/utils/debounce';
import { Input } from '../Input/Input';
import { RadixPopover } from '../RadixPopover/RadixPopover';
import { Spinner } from '../Spinner/Spinner';
import './SearchPopover.scss';

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
  const [matches, setMatches] = React.useState<any>([]);
  const [matchesLoading, setMatchesLoading] = React.useState(false);

  const debouncedSearch = debounceRef((value: string) => {
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
        <div className="mt-4">
          <Spinner />
        </div>
      );
    }

    if (!searchValue || matches.length < 1) {
      return null;
    }

    return (
      <ul className="SearchPopover__matchList">
        {matches.map((match: any, idx: number) => {
          return (
            <li
              className="SearchPopover__match"
              key={idx}
              onClick={() => {
                onChange(match);
                setPopoverOpen(false);
              }}
            >
              {renderMatch(match)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      <RadixPopover className="p-4" open={popoverOpen} onOpenChange={setPopoverOpen} trigger={trigger}>
        <Input
          autoFocus
          fluid
          id="search"
          label={searchLabel ? searchLabel : 'Search'}
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
      </RadixPopover>
    </>
  );
};
