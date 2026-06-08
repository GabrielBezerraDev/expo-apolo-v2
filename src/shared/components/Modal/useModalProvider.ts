import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BackHandler } from "react-native";
import { ModalConfig, ModalContextType, ModalOptions } from "./modal.type";

export function useModalProvider() {
  const [modals, setModals] = useState<ModalConfig[]>([]);
  const idCounter = useRef(0);

  const openModal = useCallback((component: ReactNode, options?: ModalOptions) => {
    idCounter.current += 1;
    const id = `modal-${Date.now()}-${idCounter.current}`;

    setModals(current => [...current, { id, component, options }]);
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(current => current.map(modal => (modal.id === id ? { ...modal, closing: true } : modal)));
  }, []);

  const closeTopModal = useCallback(() => {
    setModals(current => {
      const topModal = current[current.length - 1];
      if (!topModal || topModal.options?.preventClose) return current;

      return current.map(modal => (modal.id === topModal.id ? { ...modal, closing: true } : modal));
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(current => current.map(modal => ({ ...modal, closing: true })));
  }, []);

  const updateModal = useCallback((id: string, options: Partial<ModalOptions>) => {
    setModals(current =>
      current.map(modal => (modal.id === id ? { ...modal, options: { ...modal.options, ...options } } : modal)),
    );
  }, []);

  const removeModal = useCallback((id: string) => {
    setModals(current => current.filter(modal => modal.id !== id));
  }, []);

  useEffect(() => {
    if (modals.length === 0) return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      closeTopModal();
      return true;
    });

    return () => subscription.remove();
  }, [closeTopModal, modals.length]);

  const value: ModalContextType = {
    openModal,
    closeModal,
    closeAllModals,
    closeTopModal,
    updateModal,
  };

  return {
    closeModal,
    modals,
    removeModal,
    value,
  };
}
