import React, { PropsWithChildren, createContext, useContext } from "react";
import { ModalComponent } from "./ModalComponent";
import { ModalContainer } from "./styled";
import { ModalContextType } from "./modal.type";
import { useModalProvider } from "./useModalProvider";

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: PropsWithChildren) {
  const { closeModal, modals, removeModal, value } = useModalProvider();

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.length > 0 ? (
        <ModalContainer pointerEvents="box-none">
          {modals.map((modal, index) => (
            <ModalComponent
              key={modal.id}
              modal={modal}
              index={index}
              isTopModal={index === modals.length - 1}
              requestClose={closeModal}
              removeModal={removeModal}
            />
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
