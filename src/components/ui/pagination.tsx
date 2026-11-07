import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { pageHref } from "@/lib/pagination";
import { cn } from "cn";

export function Pagination({
  pathname,
  page,
  totalPages,
}: {
  pathname: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >
      {hasPrev ? (
        <Link
          href={pageHref(pathname, page - 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          aria-label="Previous page"
        >
          <ChevronLeft />
          Prev
        </Link>
      ) : (
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "pointer-events-none opacity-40",
          )}
          aria-disabled="true"
        >
          <ChevronLeft />
          Prev
        </span>
      )}

      {pages.map((pageNumber) => {
        const isCurrent = pageNumber === page;
        if (isCurrent) {
          return (
            <span
              key={pageNumber}
              aria-current="page"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "min-w-8 tabular-nums",
              )}
            >
              {pageNumber}
            </span>
          );
        }

        return (
          <Link
            key={pageNumber}
            href={pageHref(pathname, pageNumber)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "min-w-8 tabular-nums",
            )}
          >
            {pageNumber}
          </Link>
        );
      })}

      {hasNext ? (
        <Link
          href={pageHref(pathname, page + 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          aria-label="Next page"
        >
          Next
          <ChevronRight />
        </Link>
      ) : (
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "pointer-events-none opacity-40",
          )}
          aria-disabled="true"
        >
          Next
          <ChevronRight />
        </span>
      )}
    </nav>
  );
}
