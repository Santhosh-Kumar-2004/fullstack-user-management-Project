// src/contexts/AppContext.jsx
import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("login");
  const [inputValue, setInputValue] = useState("");

  return (
    <AppContext.Provider value={{ currentPage, setCurrentPage, inputValue, setInputValue }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
