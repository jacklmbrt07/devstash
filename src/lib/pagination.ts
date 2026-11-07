export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  offset: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export function parsePageParam(
  value: string | string[] | undefined,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function getPaginationState(
  page: number,
  pageSize: number,
  total: number,
): PaginationState {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  return {
    page: currentPage,
    pageSize,
    total,
    totalPages,
    offset: (currentPage - 1) * pageSize,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}

/** Build a same-path href with an updated `page` query param. */
export function pageHref(pathname: string, page: number): string {
  if (page <= 1) return pathname;
  return `${pathname}?page=${page}`;
}
