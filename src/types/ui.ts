import type { ChangeEvent, FocusEvent } from "react";

export interface IField<T> {
  value?: string;
  onChange?: (e: ChangeEvent<T>) => void;
  onBlur?: (e: FocusEvent<T>) => void;
  name?: string;
  error?: string;
}

export interface IModal {
  visible: boolean;
  setVisible: (event?: unknown) => void;
}
