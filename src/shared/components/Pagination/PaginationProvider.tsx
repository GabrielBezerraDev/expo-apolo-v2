import React, {
  createContext,
  PropsWithChildren,
  useContext,
} from "react";
import { usePaginationProvider } from "./usePaginationProvider";

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
  const value = usePaginationProvider(initialItemsPerPage);

  return <PaginationContext.Provider value={value}>{children}</PaginationContext.Provider>;
}

export function usePagination() {
  const context = useContext(PaginationContext);

  if (!context) {
    throw new Error("usePagination must be used within a PaginationProvider");
  }

  return context;
}
