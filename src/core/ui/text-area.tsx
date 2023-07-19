"use client";

import { forwardRef, useRef } from "react";

import clsx from "clsx";
import type { IField } from "~/core/ui/types";

export type ITextAreaFieldProps<T> = {
  className?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  label?: string;
  placeholder?: string;
} & IField<T>;

const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  ITextAreaFieldProps<HTMLTextAreaElement>
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
  ) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    return (
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
          <textarea
            name={name}
            {...{ value: value }}
            ref={(node) => {
              textAreaRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              }
            }}
            style={{ resize: "none" }}
            onChange={(e) => {
              if (textAreaRef.current) {
                // We need to reset the height momentarily to get the correct scrollHeight for the textarea
                textAreaRef.current.style.height = "0px";
                const scrollHeight = textAreaRef.current.scrollHeight;

                // We then set the height directly, outside of the render loop
                // Trying to set this with state or a textAreaRef will product an incorrect value.
                textAreaRef.current.style.height = scrollHeight + "px";
              }
              onChange && onChange(e);
            }}
            onBlur={(e) => {
              onBlur && onBlur(e);
            }}
            placeholder={placeholder}
            className={clsx(
              " border-gray-light-secondary bg-light ",
              "peer ease w-full rounded-2xl border px-5 pt-4 py-3 text-sm focus:outline-none",
              "text-dark  placeholder:text-dark/30 ",
              error && "border-red-500 bg-red-500/10",
              startIcon !== null && "pl-12",
              className
            )}
          />
          {endIcon !== null && (
            <div className="absolute right-5 bottom-2">{endIcon}</div>
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
    );
  }
);

TextAreaField.displayName = "TextAreaField";

export default TextAreaField;
