import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type PaginationMeta = {
  currentPage: number;
  lastPage: number;
  totalItems: number;
};

export type PaginationContextValue = PaginationMeta & {
  itemsPerPage: number;
  offset: number;
  setCurrentPage: (page: number) => void;
  setLastPage: (page: number) => void;
  setTotalItems: (total: number) => void;
  setPaginationMeta: (meta: Partial<PaginationMeta>) => void;
  sendToFirstPage: () => void;
  sendToLastPage: () => void;
  nextPage: () => void;
  previousPage: () => void;
};

type PaginationProviderProps = PropsWithChildren<{
  initialItemsPerPage?: number;
}>;

const PaginationContext = createContext<PaginationContextValue | undefined>(undefined);

export function PaginationProvider({
  children,
  initialItemsPerPage = 10,
}: PaginationProviderProps) {
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
    setCurrentPageState((current) => Math.min(current, nextLastPage));
  }, []);

  const setTotalItems = useCallback((total: number) => {
    setTotalItemsState(Math.max(0, total));
  }, []);

  const setPaginationMeta = useCallback((meta: Partial<PaginationMeta>) => {
    if (typeof meta.totalItems === "number") setTotalItemsState(Math.max(0, meta.totalItems));
    if (typeof meta.lastPage === "number") {
      const nextLastPage = Math.max(1, meta.lastPage);
      setLastPageState(nextLastPage);
      setCurrentPageState((current) => Math.min(current, nextLastPage));
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
    setCurrentPageState((current) => (current < lastPage ? current + 1 : current));
  }, [lastPage]);

  const previousPage = useCallback(() => {
    setCurrentPageState((current) => (current > 1 ? current - 1 : current));
  }, []);

  const value = useMemo<PaginationContextValue>(
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

  return <PaginationContext.Provider value={value}>{children}</PaginationContext.Provider>;
}

export function usePagination() {
  const context = useContext(PaginationContext);

  if (!context) {
    throw new Error("usePagination must be used within a PaginationProvider");
  }

  return context;
}
