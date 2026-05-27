"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function Search({
  placeholder,
  queryParam = "query",
  pageParam = "page",
  inputId = "search",
}: {
  placeholder: string;
  queryParam?: string;
  pageParam?: string;
  inputId?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    params.set(pageParam, "1");

    if (term) {
      params.set(queryParam, term);
    } else {
      params.delete(queryParam);
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1">
      <label htmlFor={inputId} className="sr-only">
        Buscar
      </label>
      <input
        id={inputId}
        type="search"
        placeholder={placeholder}
        defaultValue={searchParams.get(queryParam)?.toString()}
        onChange={(event) => handleSearch(event.target.value)}
        className="w-full rounded-lg border border-primary/20 bg-white py-2 pl-10 pr-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      <MagnifyingGlassIcon
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
    </div>
  );
}
