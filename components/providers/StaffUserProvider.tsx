"use client";

import { createContext, useContext } from "react";

const StaffUserContext = createContext<any>(null);

export function StaffUserProvider({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  return (
    <StaffUserContext.Provider value={user}>
      {children}
    </StaffUserContext.Provider>
  );
}

export function useStaffUser() {
  return useContext(StaffUserContext);
}