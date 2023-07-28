"use client";

import { createContext, useContext } from "react";

import clsx from "clsx";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import Button from "./button";

interface IModalProps {
  children: React.ReactNode;
  visible: boolean;
  setVisible?: (visibility: boolean) => void;
}

const ModalContext = createContext<((visibility: boolean) => void) | undefined>(
  undefined
);

const Root = ({ children, visible, setVisible }: IModalProps) => {
  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-20 h-screen duration-150",
        "bg-black/50",
        !visible && "invisible opacity-0",
        visible && "visible flex items-center justify-center opacity-100"
      )}
      onClick={() => setVisible?.call(setVisible, false)}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <ModalContext.Provider value={setVisible}>
          {children}
        </ModalContext.Provider>
      </div>
    </div>,
    document.body
  );
};

interface DialogProps {
  onConfirm: (event?: any) => void;
  onCancel: (event?: any) => void;
  description: string;
  label: string;
}

const Dialog = ({ label, description, onConfirm, onCancel }: DialogProps) => {
  const setVisible = useContext(ModalContext);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h6 className="text-xl font-semibold">{label}</h6>{" "}
          <button
            className="absolute top-6 right-6"
            onClick={() => setVisible?.call(setVisible, false)}
          >
            <X />
          </button>
        </div>
        <p>{description}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onConfirm}>Да</Button>
      </div>
    </div>
  );
};

const Confirm = ({ onConfirm }: { onConfirm: (event?: any) => void }) => {
  <Button onClick={onConfirm}>Да</Button>;
};

export const Modal = { Root, Dialog, Action: { Confirm } };
