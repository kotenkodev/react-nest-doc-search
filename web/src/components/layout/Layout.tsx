import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuthStore } from "../../store/useAuthStore";

export default function Layout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-dvh bg-(--bgColor-default) text-(--fgColor-default) flex flex-col">
      {isAuthenticated() && <Navbar />}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
