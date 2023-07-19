"use client";

import clsx from "clsx";
import { forwardRef } from "react";
import type { IField } from "~/core/ui/types";

export type ITextFieldProps<T> = {
  className?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  label?: string;
  placeholder?: string;
} & IField<T>;

const TextField = forwardRef<
  HTMLInputElement,
  ITextFieldProps<HTMLInputElement>
>(
  (
    {
      className = "",
      startIcon = null,
      endIcon = null,
      value,
      name,
      onChange,
      onBlur,
      label,
      placeholder,
      error,
    },
    ref
  ) => (
    <>
      <div
        className={clsx(
          className,
          "relative",
          (endIcon !== null ||
            startIcon !== null ||
            label !== undefined ||
            error !== undefined) &&
            "flex flex-col "
        )}
      >
        {startIcon !== null && (
          <div className="absolute mr-3 -translate-y-1/2 left-5 top-1/2">
            {startIcon}
          </div>
        )}
        <input
          name={name}
          {...{ value: value }}
          ref={ref}
          onChange={(e) => {
            onChange && onChange(e);
          }}
          onBlur={(e) => {
            onBlur && onBlur(e);
          }}
          placeholder={placeholder}
          className={clsx(
            " border-gray-light-secondary bg-light ",
            "peer ease w-full rounded-2xl border px-5 py-3 text-sm focus:outline-none",
            "text-dark  placeholder:text-dark/30 ",
            error && "border-red-500 bg-red-500/10",
            startIcon !== null && "pl-12",
            className
          )}
        />
        {endIcon !== null && (
          <div className="absolute -translate-y-1/2 right-5 top-1/2">
            {endIcon}
          </div>
        )}
        {label !== undefined && (
          <label
            htmlFor={name}
            className="bg-light/80 text-dark absolute border border-gray-light-secondary py-0.5
                 top-1.5 z-10 origin-[0] -translate-y-4 translate-x-3 transform
                 rounded-md px-1.5 text-xs uration-300
                 "
          >
            {label}
          </label>
        )}
        {error && (
          <p className="pl-1 mt-2 text-sm text-red-600 dark:text-red-500">
            {error}
          </p>
        )}
      </div>
    </>
  )
);

TextField.displayName = "TextField";

export default TextField;
