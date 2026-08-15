import { useTheme } from "@primer/react";
import { Toaster } from "sonner";

export default function AppToaster() {
  const { resolvedColorMode } = useTheme();

  const sonnerTheme =
    resolvedColorMode === "night" || resolvedColorMode === "dark"
      ? "dark"
      : "light";

  return <Toaster theme={sonnerTheme} position="bottom-right" richColors />;
}
