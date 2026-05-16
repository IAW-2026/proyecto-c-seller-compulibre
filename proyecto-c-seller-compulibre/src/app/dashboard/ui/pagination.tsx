import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

function generatePagination(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

function createPageUrl(page: number, query: string) {
  const params = new URLSearchParams();
  params.set("page", page.toString());

  if (query) {
    params.set("query", query);
  }

  return `/dashboard/productos?${params.toString()}`;
}

function PaginationArrow({
  direction,
  href,
  isDisabled,
}: {
  direction: "left" | "right";
  href: string;
  isDisabled: boolean;
}) {
  const Icon = direction === "left" ? ChevronLeftIcon : ChevronRightIcon;

  if (isDisabled) {
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/10 text-gray-300">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 text-primary transition hover:bg-accent/35"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  query = "",
}: {
  currentPage: number;
  totalPages: number;
  query?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2">
      <PaginationArrow
        direction="left"
        href={createPageUrl(currentPage - 1, query)}
        isDisabled={currentPage <= 1}
      />

      <div className="flex items-center gap-2">
        {allPages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex h-9 w-9 items-center justify-center text-sm text-gray-400"
              >
                ...
              </span>
            );
          }

          const pageNumber = Number(page);
          const isActive = pageNumber === currentPage;

          return (
            <Link
              key={pageNumber}
              href={createPageUrl(pageNumber, query)}
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition",
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-primary/15 text-primary hover:bg-accent/35",
              ].join(" ")}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        href={createPageUrl(currentPage + 1, query)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}
