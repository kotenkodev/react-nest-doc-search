import { type ReactNode } from "react";
import {
  ThemeProvider as PrimerThemeProvider,
  BaseStyles,
} from "@primer/react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const savedTheme = (localStorage.getItem("theme") as any) || "auto";

  return (
    <PrimerThemeProvider colorMode={savedTheme}>
      <BaseStyles>{children}</BaseStyles>
    </PrimerThemeProvider>
  );
}
