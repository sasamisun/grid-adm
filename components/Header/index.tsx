"use client";

import { useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@heroui/button";
import { useTheme } from "next-themes";
import { IconSun, IconMoon } from "@tabler/icons-react";

const subscribeStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getConnectionInfo = () =>
  `${localStorage.getItem("user")}@${localStorage.getItem("clusterName")}.${localStorage.getItem("database")} on ${localStorage.getItem("host")}:${localStorage.getItem("port")}`;

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const { theme, setTheme } = useTheme();

  // useSyncExternalStore: SSR時はnull、クライアントではlocalStorageから読み取る
  const connectionInfo = useSyncExternalStore(
    subscribeStorage,
    getConnectionInfo,
    () => null
  );

  const handleDisconnect = () => {
    ["host", "port", "clusterName", "user", "password", "database"].forEach(
      (key) => localStorage.removeItem(key)
    );
    router.push("/");
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-zinc-900">
      <span
        className="font-semibold text-sm cursor-pointer text-gray-700 dark:text-zinc-200 hover:text-primary"
        onClick={() => router.push("/")}
      >
        GridDB Adminyare
      </span>

      <div className="flex items-center gap-3">
        {isDashboard && connectionInfo && (
          <span className="text-xs text-gray-500 dark:text-zinc-400 hidden sm:block">
            {connectionInfo}
          </span>
        )}
        {isDashboard && (
          <Button size="sm" color="danger" variant="flat" onPress={handleDisconnect}>
            切断
          </Button>
        )}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="テーマ切り替え"
        >
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </Button>
      </div>
    </div>
  );
};
