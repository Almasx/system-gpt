"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  active?: boolean;
  onClick?: (event?: unknown) => void;
  className?: string;
}

const Badge = ({ children, active, onClick, className = "" }: BadgeProps) => {
  return (
    <button
      type="button"
      className={clsx(
        className,
        "rounded-xl border px-3 py-1 outline-none duration-150 ease-in-out hover:bg-dark hover:text-light",
        "bg-light/60 backdrop-blur-sm text-sm",
        active
          ? "flex flex-row items-center border-transparent bg-dark text-white  "
          : "border-gray-light-secondary"
      )}
      onClick={(event) => {
        onClick && onClick(event);
      }}
    >
      {children}
    </button>
  );
};

export default Badge;
