import { Button, ButtonGroup, useTheme } from "@primer/react";
import { SunIcon, MoonIcon } from "@primer/octicons-react";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { resolvedColorMode, setColorMode } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <ButtonGroup>
        <Button variant="invisible" aria-label="Light theme">
          <SunIcon />
        </Button>
        <Button variant="invisible" aria-label="Dark theme">
          <MoonIcon />
        </Button>
      </ButtonGroup>
    );
  }

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
