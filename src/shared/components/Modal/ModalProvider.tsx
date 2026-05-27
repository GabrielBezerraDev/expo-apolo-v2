import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { BackHandler } from "react-native";
import { ModalComponent } from "./ModalComponent";
import { ModalContainer } from "./styled";
import { ModalConfig, ModalContextType, ModalOptions } from "./modal.type";

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: PropsWithChildren) {
  const [modals, setModals] = useState<ModalConfig[]>([]);
  const idCounter = useRef(0);

  const openModal = useCallback((component: React.ReactNode, options?: ModalOptions) => {
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
      current.map(modal => (modal.id === id ? { ...modal, options: { ...modal.options, ...options } } : modal))
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

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.length > 0 ? (
        <ModalContainer pointerEvents="box-none">
          {modals.map((modal, index) => (
            <ModalComponent key={modal.id} modal={modal} index={index} requestClose={closeModal} removeModal={removeModal} />
          ))}
        </ModalContainer>
      ) : null}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  return context;
}
