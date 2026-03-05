"use client";

import React from "react";

type IconProps = {
  size?: number;
  className?: string;
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function Base({
  size = 22,
  className,
  children,
}: React.PropsWithChildren<IconProps>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Base>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M20 7.5 10.2 17.3 4 11.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Base>
  );
}

export function IconList(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M7 6h14M7 12h14M7 18h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 6h.01M4 12h.01M4 18h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Base>
  );
}

export function IconInbox(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M4 4h16v11a2 2 0 0 1-2 2h-3l-1.2 2h-3.6L9 17H6a2 2 0 0 1-2-2V4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Base>
  );
}

export function IconChart(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M4 19V5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 16l4-4 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 19H4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Base>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Base>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Base>
  );
}