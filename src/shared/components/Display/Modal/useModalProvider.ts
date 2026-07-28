import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BackHandler } from "react-native";
import { ModalConfig, ModalContextType, ModalOptions } from "./modal.type";

export function useModalProvider() {
  const [modals, setModals] = useState<ModalConfig[]>([]);
  const idCounter = useRef(0);
  const modalIdsByGroup = useRef(new Map<string, string>());
  const modalGroupsById = useRef(new Map<string, string>());

  const openModal = useCallback((component: ReactNode, options?: ModalOptions) => {
    const groupId = options?.groupId;
    const activeModalId = groupId ? modalIdsByGroup.current.get(groupId) : undefined;
    if (activeModalId) return activeModalId;

    idCounter.current += 1;
    const id = `modal-${Date.now()}-${idCounter.current}`;

    if (groupId) {
      modalIdsByGroup.current.set(groupId, id);
      modalGroupsById.current.set(id, groupId);
    }

    setModals(current => sortModals([...current, { id, component, options }]));
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
    setModals(current =>
      current.map(modal =>
        modal.options?.preventClose ? modal : { ...modal, closing: true },
      ),
    );
  }, []);

  const updateModal = useCallback((id: string, options: Partial<Omit<ModalOptions, "groupId">>) => {
    setModals(current =>
      sortModals(
        current.map(modal =>
          modal.id === id
            ? { ...modal, options: { ...modal.options, ...options } }
            : modal,
        ),
      ),
    );
  }, []);

  const removeModal = useCallback((id: string) => {
    const groupId = modalGroupsById.current.get(id);
    if (groupId && modalIdsByGroup.current.get(groupId) === id) {
      modalIdsByGroup.current.delete(groupId);
    }
    modalGroupsById.current.delete(id);

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

function sortModals(modals: ModalConfig[]) {
  return modals.sort(
    (first, second) => (first.options?.priority ?? 0) - (second.options?.priority ?? 0),
  );
}
