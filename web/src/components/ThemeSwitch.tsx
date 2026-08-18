import { Button, ButtonGroup, useTheme } from "@primer/react";
import { SunIcon, MoonIcon } from "@primer/octicons-react";

export default function ThemeSwitch() {
  const { resolvedColorMode, setColorMode } = useTheme();

  return (
    <ButtonGroup>
      <Button
        variant={resolvedColorMode === "light" ? "primary" : "invisible"}
        onClick={() => {
          setColorMode("light");
          localStorage.setItem("theme", "light");
        }}
        aria-label="Light theme"
      >
        <SunIcon />
      </Button>
      <Button
        variant={resolvedColorMode === "night" ? "primary" : "invisible"}
        onClick={() => {
          setColorMode("night");
          localStorage.setItem("theme", "night");
        }}
        aria-label="Night theme"
      >
        <MoonIcon />
      </Button>
    </ButtonGroup>
  );
}
