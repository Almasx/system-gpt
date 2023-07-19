"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useEffect, useState } from "react";

import clsx from "clsx";
import { Spinner } from "./spinner";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "text";
  content?: "text" | "icon";
  ripple?: boolean;
  children: ReactNode;
  onClick?: (event?: unknown) => void;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

const Button = ({
  children,
  onClick,
  variant = "primary",
  content = "text",
  ripple = true,
  className = "",
  disabled = false,
  loading = false,
  ...props
}: ButtonProps) => {
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState<boolean>(false);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      setTimeout(() => setIsRippling(false), 300);
    } else setIsRippling(false);
  }, [coords]);

  useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);

  return (
    <button
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        props.type !== "submit" && event.preventDefault();
        const { left, top } = event.currentTarget.getBoundingClientRect();
        setCoords({ x: event.clientX - left, y: event.clientY - top });
        onClick && onClick(event);
      }}
      disabled={disabled || loading}
      className={clsx(
        "flex flex-row items-center justify-center rounded-lg sm:rounded-xl",
        "relative overflow-hidden transition-colors", // others
        [
          content === "text" && [
            "box-content px-3 py-2 text-sm sm:text-base",
            "font-semibold sm:font-bold ",
          ],
          content === "icon" && ["box-border "],
        ],
        [
          variant === "primary" && [
            "bg-primary", // background
            content === "text" && "text-light ", // typography
          ],
          variant === "secondary" && [
            "border border-gray-dark !font-medium", // box model
            "bg-dark/60 hover:bg-dark-secondary", // background
            " backdrop-blur-xl",
            content === "text" && "text-light/60", // typography
          ],
          variant === "text" && [
            "bg-transparent hover:bg-dark-secondary", // background
            content === "text" && "text-primary ", // typography
          ],
        ],
        "disabled:cursor-not-allowed disabled:bg-primary/80",
        className
      )}
      {...props}
    >
      {isRippling && (
        <span
          className={clsx(
            "absolute block h-5 w-5 animate-ripple-effect rounded-full bg-light/20 opacity-100",
            !ripple && "hidden"
          )}
          style={{ left: coords.x, top: coords.y }}
        />
      )}
      {loading ? (
        <Spinner className=" h-7 w-7 fill-white text-light/10" />
      ) : (
        <span className="relative z-10 ">{children}</span>
      )}
    </button>
  );
};

export default Button;
