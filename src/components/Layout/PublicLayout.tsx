// src/components/layout/PublicLayout.tsx
import { Outlet } from "react-router-dom";
import Header from "./Header";

const PublicLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default PublicLayout;