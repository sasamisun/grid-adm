"use client";
import { useRouter } from "next/navigation";
import { Form, Input, Button } from "@heroui/react";
import React, { useEffect, useState } from "react";
import type { AuthInfo, DBError } from "../types";
import { createHttpClient, useGriddb, connectDb } from "@/hooks/useGriddbAccess";

export const LoginForm = () => {
    const router = useRouter();
    //const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const DEFAULT_VAL = Object.freeze({
        host: "localhost",
        port: "8081",
        clusterName: "my_cluster",
        user: "admin",
        password: "admin",
        database: "public",
    });

    // SSR安全なlocalStorage読み込み
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [clusterName, setClusterName] = useState("");
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [database, setDatabase] = useState("");


    const getLocalVal = (key: string, defaultVal: string) => {
        const item = localStorage.getItem(key);
        if (item) {
            return item;
        } else {
            return defaultVal;
        }
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            setHost(localStorage.getItem("host") || DEFAULT_VAL.host);
            setPort(localStorage.getItem("port") || DEFAULT_VAL.port);
            setClusterName(localStorage.getItem("clusterName") || DEFAULT_VAL.clusterName);
            setUser(localStorage.getItem("user") || DEFAULT_VAL.user);
            setPassword(localStorage.getItem("password") || DEFAULT_VAL.password);
            setDatabase(localStorage.getItem("database") || DEFAULT_VAL.database);
        }
    }, []);

    const { execute, loading, error } = useGriddb<DBError>(
        () => connectDb(createHttpClient({ host, port, clusterName, user, password, database })),
        { version: "", errorCode: 0, errorMessage: "" },
        false
    );

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newAuth: AuthInfo = {
            host: String(formData.get("host") || DEFAULT_VAL.host),
            port: String(formData.get("port") || DEFAULT_VAL.port),
            clusterName: String(formData.get("cluster_name") || DEFAULT_VAL.clusterName),
            user: String(formData.get("user_name") || DEFAULT_VAL.user),
            password: String(formData.get("password") || DEFAULT_VAL.password),
            database: String(formData.get("database") || DEFAULT_VAL.database)
        };

        // localStorage更新
        Object.entries(newAuth).forEach(([key, value]) => localStorage.setItem(key, value));

        // API実行
        const newClient = createHttpClient(newAuth);
        const response = await execute(() => connectDb(newClient));

        if (response && response.status === 200) {
            router.push("/dashboard");
        }

    };

    return (
        <Form
            className="w-full justify-center items-center space-y-4"
            onSubmit={onSubmit}
            onReset={() => {
                // 状態をクリア
                setHost("");
                setPort("");
                setClusterName("");
                setUser("");
                setPassword("");
                setDatabase("");

                // localStorageをクリア
                Object.keys(DEFAULT_VAL).forEach((key) => localStorage.removeItem(key));
            }}
        >
            <div className="flex flex-col gap-4 max-w-md">
                <Input
                    label="Host"
                    labelPlacement="inside"
                    name="host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                />
                <Input
                    label="Port"
                    labelPlacement="inside"
                    name="port"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                />
                <Input
                    label="ClusterName"
                    labelPlacement="inside"
                    name="cluster_name"
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                />
                <Input
                    label="User"
                    labelPlacement="inside"
                    name="user_name"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                />
                <Input
                    label="Password"
                    labelPlacement="inside"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                    label="Database"
                    labelPlacement="inside"
                    name="database"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                />

                <div className="flex gap-4">
                    <Button className="w-full" color="primary" type="submit">Connect</Button>
                    <Button type="reset" variant="bordered">Reset</Button>
                </div>

                {loading && <p>Checking connection...</p>}
                {error && <p>Error: {error}</p>}
            </div>
        </Form>
    );
};