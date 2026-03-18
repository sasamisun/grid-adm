"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Panel} from "@/components/Panel";
import type { AuthInfo } from "../../components/types";

export default function Dashboard() {
  const router = useRouter();
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = localStorage.getItem("host");
      const port = localStorage.getItem("port");
      const clusterName = localStorage.getItem("clusterName");
      const user = localStorage.getItem("user");
      const password = localStorage.getItem("password");
      const database = localStorage.getItem("database");

      // 値が揃っているかチェック
      if (!host || !port || !clusterName || !user || !password || !database) {
        router.push("/"); // 前のページに戻る
      } else {
        setAuthInfo({ host, port, clusterName, user, password, database });
      }
    }
  }, [router]);
  if (!authInfo) {
    return <p>Loading...</p>; // 値チェック中
  }
  return (
    <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
      <Panel auth={authInfo} />
    </div>
  );
}

