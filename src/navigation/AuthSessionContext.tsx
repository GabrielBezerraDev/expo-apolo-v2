import React, { createContext, PropsWithChildren, useContext } from "react";

type AuthSessionContextValue = {
  login: () => void;
  logout: () => void;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

type AuthSessionProviderProps = PropsWithChildren<AuthSessionContextValue>;

export function AuthSessionProvider({ children, login, logout }: AuthSessionProviderProps) {
  return (
    <AuthSessionContext.Provider value={{ login, logout }}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }

  return context;
}
