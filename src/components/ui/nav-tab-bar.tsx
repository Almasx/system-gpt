"use client";

import { createContext, useContext } from "react";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTabBar } from "~/lib/hooks/useTabBar";

const NavTabBarProvider = createContext<{
  setActive: ((value: string) => void) | null;
  setRef: ((value: string, ref: HTMLAnchorElement) => void) | null;
}>({ setActive: null, setRef: null });

export const NavTabBar = ({
  children,
  initialTab,
}: {
  children: React.ReactNode;
  initialTab: string;
}) => {
  const path = usePathname();
  const { indicatorRef, setRef, setActive } = useTabBar<
    HTMLAnchorElement,
    HTMLDivElement
  >(initialTab);

  return (
    <div className="relative">
      <NavTabBarProvider.Provider value={{ setActive, setRef }}>
        <div className="flex flex-row gap-1 p-1 border rounded-xl border-gray-light-secondary">
          {children}
        </div>
        <div
          ref={indicatorRef}
          className="absolute w-16 h-8 duration-200 -translate-y-1/2 border rounded-lg top-1/2 bg-light border-gray-light-secondary"
        />
      </NavTabBarProvider.Provider>
    </div>
  );
};

export const LinkTab = ({ href, label }: { href: string; label: string }) => {
  const { setActive, setRef } = useContext(NavTabBarProvider);
  const path = usePathname();

  return (
    <Link
      href={href}
      ref={(tabRef) => setRef?.call(setRef, href, tabRef!)}
      onClick={() => {
        setActive?.call(setActive, href);
      }}
      className={clsx(
        "flex h-8 items-center gap-2 rounded-xl px-4 duration-300 relative z-10",
        path.endsWith(href) ? " text-dark" : "text-dark/30 hover:text-dark"
      )}
    >
      {label}
    </Link>
  );
};
