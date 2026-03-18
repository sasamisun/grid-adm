import type * as gs from "@/components/types";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { useState, useEffect, useCallback } from "react";

// HTTPクライアント生成
export const createHttpClient = (auth: gs.AuthInfo): AxiosInstance => {
    const baseURL = `http://${auth.host}:${auth.port}/griddb/v2/${auth.clusterName}/dbs/${auth.database}`;
    const credentials = `${auth.user}:${auth.password}`;
    const base64Credentials = Buffer.from(credentials).toString("base64");
    const authorizationHeader = `Basic ${base64Credentials}`;
    return axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
            Authorization: authorizationHeader,
        },
    });
};

// データベース接続確認
export const connectDb = (client: AxiosInstance) => {
    return client.get("/checkConnection");
};

// コンテナ一覧取得
export const getContainer = (client: AxiosInstance) => {
    return client.get("/containers?limit=10000");
};

// コンテナ情報取得
export const getContainerInfo = (client: AxiosInstance, containerName: string) => {
    return client.get(`/containers/${containerName}/info`);
};

// コンテナ作成
export const postContainer = (client: AxiosInstance, container: gs.Container) => {
    return client.post(`/containers`,container);
};

// コンテナ削除
export const deleteContainer = (client: AxiosInstance, containerName: string[]) => {
    return client.delete(`/containers`,{data:containerName});
};

// ロウ取得
export const rows = (client: AxiosInstance, containerName: string, requestData: gs.RowRequest) => {
    return client.post(`/containers/${containerName}/rows`,requestData);
};

// useGriddb Hook
export const useGriddb = <T>(
    axiosFunc: () => Promise<AxiosResponse<T>>,
    initialState: T,
    autoFetch: boolean = false
) => {
    const [data, setData] = useState<T>(initialState);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(
        async (customFunc?: () => Promise<AxiosResponse<T>>) => {
            setLoading(true);
            setError(null);
            try {
                const res = await (customFunc ? customFunc() : axiosFunc());
                setData(res.data);
                return res; 
            } catch (err: any) {
                setError(err.message || "API Error");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [axiosFunc]
    );

    useEffect(() => {
        if (autoFetch) fetchData();
    }, [autoFetch]);

    return {
        data,
        loading,
        error,
        reload: () => fetchData(),
        execute: (customFunc?: () => Promise<AxiosResponse<T>>) => fetchData(customFunc),
    };
};