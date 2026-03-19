
"use client";

import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import type { Container } from "../types";
import { createHttpClient, rows, putRows, deleteRows, useGriddb } from "@/hooks/useGriddbAccess";
import type { RowRequest } from "../types";
import { SqlEditor } from "@/components/SqlEditor";

type TabItem = {
    id: string;
    type: "container" | "sql";
    title: string;
    data?: Container;
};

export type RightPaneHandle = {
    addContainerTab: (container: Container) => void;
    addSqlTab: () => void;
    closeContainerTab: (containerName: string) => void;
};

type RightPaneProps = {
    client: ReturnType<typeof createHttpClient>;
    onActiveContainerChange?: (name: string | null) => void;
    containerNames?: string[];
};

const RightPane = forwardRef<RightPaneHandle, RightPaneProps>(({ client, onActiveContainerChange, containerNames = [] }, ref) => {
    const [tabs, setTabs] = useState<TabItem[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    useEffect(() => {
        if (!onActiveContainerChange) return;
        const activeTab = tabs.find(t => t.id === activeTabId);
        onActiveContainerChange(activeTab?.type === "container" ? activeTab.title : null);
    }, [activeTabId, tabs, onActiveContainerChange]);

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

    const closeContainerTab = (containerName: string) => {
        const tab = tabs.find(t => t.type === "container" && t.title === containerName);
        if (tab) closeTab(tab.id);
    };

    useImperativeHandle(ref, () => ({
        addContainerTab,
        addSqlTab,
        closeContainerTab
    }));

    const tabsWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = tabsWrapperRef.current;
        if (!wrapper) return;
        const handleWheel = (e: WheelEvent) => {
            const tabList = wrapper.querySelector('[role="tablist"]');
            if (tabList && e.deltaY !== 0) {
                e.preventDefault();
                tabList.scrollLeft += e.deltaY;
            }
        };
        wrapper.addEventListener("wheel", handleWheel, { passive: false });
        return () => wrapper.removeEventListener("wheel", handleWheel);
    }, []);

    return (
        <div className="flex flex-col h-full w-full">
            <div ref={tabsWrapperRef}>
            <Tabs
                selectedKey={activeTabId ?? ""}
                onSelectionChange={(key) => { if (key !== "addSql") setActiveTabId(key as string); }}
                aria-label="Options"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider overflow-x-auto",
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
                            <SqlEditor
                                containerNames={containerNames}
                                onTitleChange={(title) =>
                                    setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, title } : t))
                                }
                            />
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
        </div>
    );
});

export default RightPane;

// コンテナタブの中身
const ContainerTab = ({ client, container }: { client: any; container: Container }) => {
    const requestData: RowRequest = { offset: 0, limit: 1000, condition: "", sort: "" };
    const fetchRows = () => rows(client, container.container_name, requestData);
    const { data, loading, error, execute } = useGriddb(fetchRows, {
        columns: [], rows: [], total: 0, offset: 0, limit: 0
    }, true);

    // 編集中セル
    const [editingCell, setEditingCell] = useState<{ rowIdx: number; colIdx: number; isNew: boolean } | null>(null);
    const [editValue, setEditValue] = useState("");
    // 既存行の編集 (rowIdx -> 編集後の全カラム値)
    const [editedRows, setEditedRows] = useState<Record<number, any[]>>({});
    // 新規行
    const [newRows, setNewRows] = useState<any[][]>([]);
    // 削除予定の既存行インデックス
    const [deletedIndices, setDeletedIndices] = useState<Set<number>>(new Set());
    // 選択行
    const [selectedRow, setSelectedRow] = useState<{ idx: number; isNew: boolean } | null>(null);
    // 保存状態
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const hasPendingChanges = Object.keys(editedRows).length > 0 || newRows.length > 0 || deletedIndices.size > 0;

    // データ再取得時にペンディング状態をリセット
    useEffect(() => {
        setEditedRows({});
        setNewRows([]);
        setDeletedIndices(new Set());
        setSelectedRow(null);
        setEditingCell(null);
        setSaveError(null);
    }, [data]);

    const getDefaultValue = (type: string): any => {
        switch (type) {
            case "INTEGER": case "LONG": case "SHORT": case "BYTE": return 0;
            case "FLOAT": case "DOUBLE": return 0.0;
            case "BOOL": return false;
            case "TIMESTAMP": return new Date().toISOString().replace(/\.\d{3}Z$/, ".000Z");
            default: return "";
        }
    };

    const castValue = (value: string, type: string): any => {
        if (value === "" || value === null) return null;
        switch (type) {
            case "INTEGER": case "LONG": case "SHORT": case "BYTE": return parseInt(value, 10);
            case "FLOAT": case "DOUBLE": return parseFloat(value);
            case "BOOL": return value === "true";
            default: return value;
        }
    };

    const handleAddRow = () => {
        const emptyRow = container.columns.map(col => getDefaultValue(col.type));
        const newIdx = newRows.length;
        setNewRows(prev => [...prev, emptyRow]);
        setSelectedRow({ idx: newIdx, isNew: true });
    };

    const handleDeleteRow = () => {
        if (!selectedRow) return;
        if (selectedRow.isNew) {
            setNewRows(prev => prev.filter((_, i) => i !== selectedRow.idx));
        } else {
            setDeletedIndices(prev => new Set([...prev, selectedRow.idx]));
        }
        setSelectedRow(null);
    };

    const handleCellClick = (rowIdx: number, colIdx: number, isNew: boolean, currentValue: any) => {
        if (!isNew && deletedIndices.has(rowIdx)) return;
        setEditingCell({ rowIdx, colIdx, isNew });
        setEditValue(currentValue === null || currentValue === undefined ? "" : String(currentValue));
    };

    const handleCellConfirm = () => {
        if (!editingCell) return;
        const { rowIdx, colIdx, isNew } = editingCell;
        const colType = container.columns[colIdx]?.type ?? "STRING";
        const typedValue = castValue(editValue, colType);
        if (isNew) {
            setNewRows(prev => {
                const updated = prev.map((r, i) => i === rowIdx ? [...r] : r);
                updated[rowIdx][colIdx] = typedValue;
                return updated;
            });
        } else {
            setEditedRows(prev => {
                const base = prev[rowIdx] ? [...prev[rowIdx]] : [...data.rows[rowIdx]];
                base[colIdx] = typedValue;
                return { ...prev, [rowIdx]: base };
            });
        }
        setEditingCell(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            const rowsToUpsert: any[][] = [
                ...Object.entries(editedRows)
                    .filter(([idx]) => !deletedIndices.has(Number(idx)))
                    .map(([, row]) => row),
                ...newRows,
            ];
            if (rowsToUpsert.length > 0) {
                const res = await putRows(client, container.container_name, rowsToUpsert);
                if (res.status !== 200) throw new Error(`Save failed: ${res.status}`);
            }
            if (deletedIndices.size > 0 && container.rowkey) {
                const keys = Array.from(deletedIndices).map(idx => {
                    return data.rows[idx][0]; // 常に元データからrowkeyを取得（型保持のため）
                });
                const res = await deleteRows(client, container.container_name, keys);
                if (res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
            }
            await execute(); // リロード (useEffect でペンディング状態もリセット)
        } catch (err: any) {
            setSaveError(err.response?.data?.errorMessage || err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleRevert = () => {
        setEditedRows({});
        setNewRows([]);
        setDeletedIndices(new Set());
        setEditingCell(null);
        setSelectedRow(null);
        setSaveError(null);
    };

    const rowClass = (idx: number, isNew: boolean) => {
        if (isNew) return selectedRow?.isNew && selectedRow.idx === idx ? "bg-green-200" : "bg-green-100";
        if (deletedIndices.has(idx)) return "bg-red-100 opacity-60";
        if (selectedRow?.idx === idx && !selectedRow.isNew) return "bg-blue-100";
        if (editedRows[idx]) return "bg-yellow-50";
        return "hover:bg-gray-50";
    };

    const renderCell = (value: any, rowIdx: number, colIdx: number, isNew: boolean) => {
        const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.colIdx === colIdx && editingCell?.isNew === isNew;
        if (isEditing) {
            return (
                <input
                    autoFocus
                    className="w-full border border-blue-400 px-1 py-0.5 text-sm outline-none rounded"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={handleCellConfirm}
                    onKeyDown={e => {
                        if (e.key === "Enter") handleCellConfirm();
                        if (e.key === "Escape") setEditingCell(null);
                    }}
                />
            );
        }
        return (
            <span
                className="block w-full min-h-10 px-1 cursor-text"
                onClick={() => handleCellClick(rowIdx, colIdx, isNew, value)}
            >
                {value === null || value === undefined
                    ? <span className="text-gray-400 italic text-xs">null</span>
                    : String(value)}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-2">
            {/* コンテナ情報バー */}
            <div className="flex gap-2 items-center flex-wrap">
                <Chip size="sm" variant="flat" color="secondary">{container.container_type}</Chip>
                <Chip size="sm" variant="flat" color={container.rowkey ? "primary" : "default"}>
                    RowKey: {container.rowkey ? "Yes" : "No"}
                </Chip>
                <span className="text-xs text-gray-400">{container.columns.length} columns</span>
            </div>

            {/* ツールバー */}
            <div className="flex gap-2 items-center flex-wrap">
                <Button size="sm" variant="flat" onPress={() => execute()} isDisabled={saving}>更新</Button>
                <Button size="sm" color="success" variant="flat" onPress={handleAddRow} isDisabled={saving}>+ 行追加</Button>
                <Button
                    size="sm" color="danger" variant="flat"
                    onPress={handleDeleteRow}
                    isDisabled={saving || !selectedRow || (!selectedRow.isNew && !container.rowkey)}
                >行削除</Button>
                <Button size="sm" color="primary" onPress={handleSave} isLoading={saving} isDisabled={!hasPendingChanges}>保存</Button>
                <Button size="sm" variant="bordered" onPress={handleRevert} isDisabled={!hasPendingChanges || saving}>元に戻す</Button>
                {saveError && <span className="text-red-500 text-sm">{saveError}</span>}
            </div>

            {/* 凡例 */}
            {hasPendingChanges && (
                <div className="flex gap-3 text-xs text-gray-500">
                    <span><span className="inline-block w-3 h-3 bg-green-100 border mr-1" />新規</span>
                    <span><span className="inline-block w-3 h-3 bg-yellow-50 border mr-1" />編集済み</span>
                    <span><span className="inline-block w-3 h-3 bg-red-100 border mr-1" />削除予定</span>
                </div>
            )}

            {loading && <p className="text-sm text-gray-500">Loading rows...</p>}
            {error && <p className="text-sm text-red-500">Error: {error}</p>}

            {/* テーブル */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            {container.columns.map((col, i) => (
                                <th key={col.name} className="border border-gray-300 px-2 py-1 text-left font-medium whitespace-nowrap">
                                    <span>{col.name}</span>
                                    {container.rowkey && i === 0 && (
                                        <span className="ml-1 text-blue-400">🔑</span>
                                    )}
                                    <span className="ml-1 text-xs font-normal text-gray-400">({col.type})</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row: any[], idx: number) => {
                            const displayRow = editedRows[idx] ?? row;
                            return (
                                <tr
                                    key={idx}
                                    className={`${rowClass(idx, false)} cursor-pointer`}
                                    onClick={() => { if (!editingCell) setSelectedRow({ idx, isNew: false }); }}
                                >
                                    {displayRow.map((cell: any, colIdx: number) => (
                                        <td key={colIdx} className="border border-gray-200 px-1 py-0.5">
                                            {deletedIndices.has(idx)
                                                ? <span className="line-through text-gray-400">{cell === null ? "null" : String(cell)}</span>
                                                : renderCell(cell, idx, colIdx, false)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                        {newRows.map((row, newIdx) => (
                            <tr
                                key={`new-${newIdx}`}
                                className={`${rowClass(newIdx, true)} cursor-pointer`}
                                onClick={() => { if (!editingCell) setSelectedRow({ idx: newIdx, isNew: true }); }}
                            >
                                {row.map((cell: any, colIdx: number) => (
                                    <td key={colIdx} className="border border-gray-200 px-1 py-0.5">
                                        {renderCell(cell, newIdx, colIdx, true)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && data.rows.length === 0 && newRows.length === 0 && (
                    <p className="text-gray-400 text-sm mt-2">ロウがありません</p>
                )}
            </div>
        </div>
    );
};
