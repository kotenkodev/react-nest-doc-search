import { type ReactNode } from "react";
import {
  ThemeProvider as PrimerThemeProvider,
  BaseStyles,
} from "@primer/react";

type ColorMode = "auto" | "day" | "night" | "light" | "dark";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const stored = localStorage.getItem("theme");
  const savedTheme: ColorMode =
    stored === "light" ||
    stored === "night" ||
    stored === "day" ||
    stored === "dark"
      ? stored
      : "auto";

  return (
    <PrimerThemeProvider colorMode={savedTheme}>
      <BaseStyles>{children}</BaseStyles>
    </PrimerThemeProvider>
  );
}
