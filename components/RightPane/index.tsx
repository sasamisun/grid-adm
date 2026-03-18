
"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@heroui/react";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import type { Container } from "../types";
import { createHttpClient, rows, useGriddb } from "@/hooks/useGriddbAccess";
import type { RowRequest } from "../types";

type TabItem = {
    id: string;
    type: "container" | "sql";
    title: string;
    data?: Container;
};

export type RightPaneHandle = {
    addContainerTab: (container: Container) => void;
    addSqlTab: () => void;
};

type RightPaneProps = {
    client: ReturnType<typeof createHttpClient>;
};

const RightPane = forwardRef<RightPaneHandle, RightPaneProps>(({ client }, ref) => {
    const [tabs, setTabs] = useState<TabItem[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    const addContainerTab = (container: Container) => {
        // 既存タブに同じ名前があるか確認
        const existingTab = tabs.find(tab => tab.type === "container" && tab.title === container.container_name);

        if (existingTab) {
            // 既存タブがあれば、そのタブをアクティブにする
            setActiveTabId(existingTab.id);
            return;
        }

        // 新規タブを追加
        const newTab: TabItem = {
            id: crypto.randomUUID(),
            type: "container",
            title: container.container_name,
            data: container
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
    };

    const addSqlTab = () => {
        const newTab: TabItem = {
            id: crypto.randomUUID(),
            type: "sql",
            title: "SQL Editor"
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
    };

    const closeTab = (id: string) => {
        setTabs((prev) => prev.filter((tab) => tab.id !== id));
        if (activeTabId === id) {
            setActiveTabId(tabs.length > 1 ? tabs[0].id : null);
        }
    };

    useImperativeHandle(ref, () => ({
        addContainerTab,
        addSqlTab
    }));

    return (
        <div className="flex flex-col h-full w-full">
            <Tabs
                selectedKey={activeTabId ?? ""}
                onSelectionChange={(key) => setActiveTabId(key as string)}
                aria-label="Options"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    tab: "max-w-fit px-1 h-12",
                    tabContent: "group-data-[selected=true]:text-[#0070f3]",
                }}
                color="primary"
                variant="light"
            >
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        title={
                            <div className="flex items-center gap-2">
                                {tab.title}
                                <Chip className="close-maru" variant="bordered" size="sm" onClick={() => closeTab(tab.id)}>✕</Chip>
                            </div>
                        }
                    >
                        {tab.type === "container" && tab.data && (
                            <ContainerTab client={client} container={tab.data} />
                        )}
                        {tab.type === "sql" && (
                            <div>
                                <h2>SQL Editor</h2>
                                <textarea className="w-full h-40 border p-2" placeholder="Enter SQL query here..." />
                                <Button color="primary" className="mt-2">実行</Button>
                            </div>
                        )}
                    </Tab>
                ))}
                <Tab key="addSql" title={
                    <div className="flex items-center gap-2">
                        <Chip variant="light" size="sm" onClick={addSqlTab}>+SQL</Chip>
                    </div>
                }>
                </Tab>
            </Tabs>
        </div>
    );
});

export default RightPane;

// コンテナタブの中身
const ContainerTab = ({ client, container }: { client: any; container: Container }) => {
    const requestData: RowRequest = {
        offset: 0,
        limit: 1000,
        condition: "",
        sort: ""
    };

    const fetchRows = () => rows(client, container.container_name, requestData);

    const { data, loading, error, execute } = useGriddb(fetchRows, {
        columns: [],
        rows: [],
        total: 0,
        offset: 0,
        limit: 0
    }, true);

    return (
        <div>
            <h2>{container.container_name}</h2>
            <p>Type: {container.container_type}</p>
            <p>RowKey: {container.rowkey ? "Yes" : "No"}</p>

            <h3>Columns:</h3>
            <ul>
                {container.columns.map((col: any, idx: number) => (
                    <li key={idx}>
                        {col.name} ({col.type})
                    </li>
                ))}
            </ul>

            <Button color="primary" className="mt-4" onPress={() => execute()}>
                更新
            </Button>

            {loading && <p>Loading rows...</p>}
            {error && <p>Error: {error}</p>}

            {data.rows.length > 0 && (
                <Table aria-label="Database Table" className="mt-4">
                    <TableHeader>
                        {data.columns.map((col: any) => (
                            <TableColumn key={col.name}>{col.name}</TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {data.rows.map((row: any, idx: number) => (
                            <TableRow key={idx}>
                                {row.map((cell: any, i: number) => (
                                    <TableCell key={i}>{cell ?? "-"}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>

    );
};
