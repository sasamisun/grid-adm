"use client";
import styles from "./header.module.scss";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname()

  return (
    <div className="headerArea">
      <h1 className="headerText" onClick={() => router.push("/")}>
        {pathname}
      </h1>
    </div>
  );
};