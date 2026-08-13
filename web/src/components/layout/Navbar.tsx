import { Button, PageHeader, Text } from "@primer/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import Logo from "./Logo";
import ThemeSwitch from "../ThemeSwitch";
import { SignOutIcon } from "@primer/octicons-react";

export default function Navbar() {
  const { email, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="pb-2 border-b border-(--borderColor-default) w-full">
      <PageHeader
        as="header"
        className="pt-5 relative max-w-7xl mx-auto w-full"
      >
        <PageHeader.TitleArea className="px-2 sm:px-4">
          <Logo size={32} />
        </PageHeader.TitleArea>

        <PageHeader.Actions className="px-2 sm:px-4 flex items-center gap-2 sm:gap-4">
          <div className="md:absolute md:inset-y-0 md:left-1/2 md:-translate-x-1/2 flex items-center md:pt-5">
            <ThemeSwitch />
          </div>

          <Text className="text-sm font-semibold flex items-center gap-2">
            <Text as="span" className="hidden sm:inline">
              Welcome, {email}
            </Text>
            <Button
              variant="danger"
              trailingVisual={<SignOutIcon />}
              onClick={handleLogout}
              size="small"
            >
              Logout
            </Button>
          </Text>
        </PageHeader.Actions>
      </PageHeader>
    </div>
  );
}
