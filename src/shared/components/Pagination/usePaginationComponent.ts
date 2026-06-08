import { useWindowDimensions } from "react-native";
import { usePagination } from "./PaginationProvider";
import { usePaginationAnimation } from "./usePaginationAnimation";

export function usePaginationComponent(itemLabel: string) {
  const {
    nextPage,
    sendToLastPage,
    previousPage,
    sendToFirstPage,
    currentPage,
    lastPage,
    totalItems,
  } = usePagination();
  const { width } = useWindowDimensions();
  const { paginationStyle } = usePaginationAnimation();

  const isNarrow = width < 420;
  const isVeryNarrow = width < 340;
  const buttonSize = isVeryNarrow ? 22 : isNarrow ? 26 : 30;
  const fontSize = isVeryNarrow ? 11 : isNarrow ? 12 : 14;
  const arrowsGap = isVeryNarrow ? 4 : isNarrow ? 6 : 10;
  const labelText = isNarrow
    ? `${currentPage}/${lastPage} • ${totalItems} ${itemLabel}`
    : `Página ${currentPage} de ${lastPage} | Total de ${itemLabel}: ${totalItems}`;

  return {
    arrowsGap,
    buttonSize,
    fontSize,
    isNarrow,
    labelText,
    nextPage,
    paginationStyle,
    previousPage,
    sendToFirstPage,
    sendToLastPage,
    width,
  };
}
