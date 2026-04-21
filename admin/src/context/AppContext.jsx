import { createContext } from "react";

export const AppContext = createContext();

const AppcontextProvider = (props) => {
  const currency = "$";

  const calculateAge = (dob) => {
    if (!dob) return "N/A";

    const birthDate = new Date(dob);

    if (isNaN(birthDate)) return "N/A";

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };
  const value = {
    calculateAge,
    currency,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppcontextProvider;
