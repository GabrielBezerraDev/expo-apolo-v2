import { useCallback, useMemo, useState } from "react";
import type { PaginationContextValue, PaginationMeta } from "./PaginationProvider";

export function usePaginationProvider(initialItemsPerPage: number) {
  const [currentPage, setCurrentPageState] = useState(1);
  const [lastPage, setLastPageState] = useState(1);
  const [totalItems, setTotalItemsState] = useState(0);
  const itemsPerPage = initialItemsPerPage;

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(Math.max(1, page));
  }, []);

  const setLastPage = useCallback((page: number) => {
    const nextLastPage = Math.max(1, page);
    setLastPageState(nextLastPage);
    setCurrentPageState(current => Math.min(current, nextLastPage));
  }, []);

  const setTotalItems = useCallback((total: number) => {
    setTotalItemsState(Math.max(0, total));
  }, []);

  const setPaginationMeta = useCallback((meta: Partial<PaginationMeta>) => {
    if (typeof meta.totalItems === "number") setTotalItemsState(Math.max(0, meta.totalItems));
    if (typeof meta.lastPage === "number") {
      const nextLastPage = Math.max(1, meta.lastPage);
      setLastPageState(nextLastPage);
      setCurrentPageState(current => Math.min(current, nextLastPage));
    }
    if (typeof meta.currentPage === "number") setCurrentPageState(Math.max(1, meta.currentPage));
  }, []);

  const sendToFirstPage = useCallback(() => {
    setCurrentPageState(1);
  }, []);

  const sendToLastPage = useCallback(() => {
    setCurrentPageState(lastPage);
  }, [lastPage]);

  const nextPage = useCallback(() => {
    setCurrentPageState(current => (current < lastPage ? current + 1 : current));
  }, [lastPage]);

  const previousPage = useCallback(() => {
    setCurrentPageState(current => (current > 1 ? current - 1 : current));
  }, []);

  return useMemo<PaginationContextValue>(
    () => ({
      currentPage,
      lastPage,
      totalItems,
      itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      setCurrentPage,
      setLastPage,
      setTotalItems,
      setPaginationMeta,
      sendToFirstPage,
      sendToLastPage,
      nextPage,
      previousPage,
    }),
    [
      currentPage,
      itemsPerPage,
      lastPage,
      nextPage,
      previousPage,
      sendToFirstPage,
      sendToLastPage,
      setCurrentPage,
      setLastPage,
      setPaginationMeta,
      setTotalItems,
      totalItems,
    ],
  );
}
