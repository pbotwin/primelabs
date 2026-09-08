import type { ButtonHTMLAttributes, ReactNode } from "react";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  count?: number;
}
export function IconButton({
  label,
  children,
  count,
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`icon-button ${className}`}
      aria-label={label}
      {...props}
    >
      {children}
      {count ? <span className="counter">{count}</span> : null}
    </button>
  );
}
