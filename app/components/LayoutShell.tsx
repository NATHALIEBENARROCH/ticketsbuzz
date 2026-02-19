"use client";

import Header from "./Header";
import { usePathname } from "next/navigation";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHeaderSearch = pathname !== "/";

  return (
    <>
      <Header showSearch={showHeaderSearch} />
      {children}
    </>
  );
}
