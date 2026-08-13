import { Link } from "react-router-dom";
import logo from "@/assets/logo.svg";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({
  size = 32,
  showText = true,
  className = "",
}: LogoProps) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2 text-(--fgColor-default) hover:text-(--fgColor-muted) transition-colors no-underline! shrink-0 whitespace-nowrap ${className}`}
    >
      <img
        src={logo}
        alt="DocSearch logo"
        width={size}
        height={size}
        className="transition-transform duration-200 group-hover:scale-110"
      />
      {showText && (
        <span className="text-xl font-semibold leading-none tracking-tight">
          DocSearch
        </span>
      )}
    </Link>
  );
}
