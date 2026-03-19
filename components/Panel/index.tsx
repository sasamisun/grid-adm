"use client";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState, useRef, useMemo } from "react";
import { createHttpClient, useGriddb, getContainer, getContainerInfo, postContainer, deleteContainer } from "@/hooks/useGriddbAccess";
import { AuthInfo, Containers, Container, Column, typeName } from "../types";
import { IconRefresh, IconTablePlus, IconTrash } from '@tabler/icons-react';
import RightPane, { RightPaneHandle } from '@/components/RightPane';
import { Chip } from "@heroui/react";

type PanelProps = {
    auth: AuthInfo;
};



export const Panel = ({ auth }: PanelProps) => {
    const rightPaneRef = useRef<RightPaneHandle>(null);
    const client = useMemo(() => createHttpClient(auth), [auth]);

    // コンテナ一覧取得
    const { data: containers, loading, error, execute } = useGriddb<Containers>(
        () => getContainer(client),
        { names: [], total: 0, offset: 0, limit: 0 },
        true
    );

    // 詳細情報を保存する状態
    const [containerDetails, setContainerDetails] = useState<Record<string, Container>>({});
    const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

    // 一覧取得後に詳細情報をまとめて取得
    useEffect(() => {
        if (containers?.names?.length > 0) {
            Promise.all(
                containers.names.map(async (name) => {
                    const res = await getContainerInfo(client, name);
                    return { name, data: res.data as Container };
                })
            ).then((results) => {
                const detailsMap: Record<string, Container> = {};
                results.forEach(({ name, data }) => {
                    detailsMap[name] = data;
                });
                setContainerDetails(detailsMap);
                console.log("詳細情報取得完了:", detailsMap);
            });
        }
    }, [containers.names, client]);

    const handleReload = async () => {
        const response = await execute(() => getContainer(client));
        if (response && response.status === 200) {
            console.log("取得成功:", response.data);
        } else {
            console.error("取得失敗:", response?.status);
        }
    };

    const handleAddContainer = (name: string) => {
        setSelectedContainer(name);
        const container = containerDetails[name]; // ← Container型であることを確認
        if (container) {
            rightPaneRef.current?.addContainerTab(container);
        } else {
            console.error("Container not found:", name);
        }
    };

    const handleDelete = async () => {
        if (selectedContainer === null) return;
        const data = [selectedContainer];
        const response = await execute(() => deleteContainer(client, data));
        if (response && response.status === 204) {
            console.log("削除成功:", response.data);
            rightPaneRef.current?.closeContainerTab(selectedContainer);
            await handleReload();
        } else {
            console.error("削除失敗:", response?.status);
        }
    };

    // 以下はコンテナ追加用
    const [isOpen, setIsOpen] = useState(false);
    const [containerName, setContainerName] = useState("");
    const [containerType, setContainerType] = useState<"COLLECTION" | "TIME_SERIES">("COLLECTION");
    const [rowKey, setRowKey] = useState(false);
    const [columns, setColumns] = useState<Column[]>([{ name: "", type: "STRING", index: [] }]);

    const [loadingAdd, setLoadingAdd] = useState(false);
    const [errorAdd, setErrorAdd] = useState<string | null>(null);

    const addColumn = () => {
        setColumns([...columns, { name: "", type: "STRING", index: [] }]);
    };

    const updateColumn = (index: number, field: keyof Column, value: string) => {
        const newColumns = [...columns];
        if (field === "index") {
            newColumns[index][field] = []; // indexはstring[]型
        } else {
            newColumns[index][field] = value as string; // nameやtypeはstring型
        }
        setColumns(newColumns);
    };

    const handleCreate = async () => {
        // バリデーション
        if (!containerName.trim()) {
            setErrorAdd("コンテナ名を入力してください。");
            return;
        }
        if (columns.length === 0) {
            setErrorAdd("カラムを1件以上追加してください。");
            return;
        }
        const emptyCol = columns.findIndex(col => !col.name.trim());
        if (emptyCol !== -1) {
            setErrorAdd(`カラム ${emptyCol + 1} の名前を入力してください。`);
            return;
        }
        const names = columns.map(col => col.name.trim());
        const duplicated = names.find((n, i) => names.indexOf(n) !== i);
        if (duplicated) {
            setErrorAdd(`カラム名「${duplicated}」が重複しています。`);
            return;
        }

        setLoadingAdd(true);
        setErrorAdd(null);

        const newContainer: Container = {
            container_name: containerName,
            container_type: containerType,
            rowkey: rowKey,
            columns: columns
        };

        try {
            const response = await postContainer(client, newContainer);

            if (response.status === 200 || response.status === 201) {
                console.log("コンテナ作成成功:", response.data);
                setIsOpen(false);
                await handleReload();
            } else {
                setErrorAdd(`作成失敗: ${response.status}`);
            }
        } catch (err) {
            setErrorAdd(err instanceof Error ? err.message : "API Error");
        } finally {
            setLoadingAdd(false);
        }
    };
    return (
        <>
            <Divider />
            <div className="flex flex-col gap-2 sm:flex-row w-full">
                {/* 左ペイン */}
                <div className="flex flex-col gap-1 w-[220px] shrink-0 border-r pr-2">
                    <div className="flex gap-1">
                        <Button onPress={handleReload} color="default"><IconRefresh
                            size={18}
                            color="black"
                            stroke={2}
                            strokeLinejoin="miter"
                        /></Button>
                        <Button onPress={() => {
                            setContainerName("");
                            setContainerType("COLLECTION");
                            setRowKey(false);
                            setColumns([{ name: "", type: "STRING", index: [] }]);
                            setErrorAdd(null);
                            setIsOpen(true);
                        }} color="default"><IconTablePlus
                            size={18}
                            color="black"
                            stroke={2}
                            strokeLinejoin="miter"
                        /></Button>
                        <Button onPress={handleDelete} color="default" isDisabled={!selectedContainer}><IconTrash
                            size={18}
                            color="black"
                            stroke={2}
                            strokeLinejoin="miter"
                        /></Button>
                    </div>

                    {loading && <p className="text-sm text-gray-500">Loading...</p>}
                    {error && <p className="text-sm text-red-500">Error: {error}</p>}

                    <Listbox
                        aria-label="Containers"
                        selectionMode="single"
                        selectedKeys={selectedContainer !== null && containers?.names ? new Set([String(containers.names.indexOf(selectedContainer))]) : new Set()}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            if (selectedKey) {
                                handleAddContainer(containers.names[Number(selectedKey)]);
                            }
                        }}
                    >
                {containers?.names?.length > 0 ? (
                    containers.names.map((name, index) => (
                        <ListboxItem
                            key={index}
                            textValue={name}
                            classNames={{
                                base: "data-[selected=true]:bg-primary-50 data-[selected=true]:border-l-4 data-[selected=true]:border-primary data-[selected=true]:font-semibold rounded-none",
                            }}
                        >
                            {name}
                            <Chip size="sm">{containerDetails[name] ? containerDetails[name].container_type.substring(0, 3) : "?"}</Chip>
                        </ListboxItem>
                    ))
                ) : (
                    <ListboxItem>No containers found</ListboxItem>
                )}
            </Listbox>
                </div>{/* 左ペイン end */}

                {/* 右ペイン */}
                <div className="flex-1 min-w-0">
                    <RightPane
                        client={client}
                        ref={rightPaneRef}
                        onActiveContainerChange={(name) => setSelectedContainer(name)}
                    />
                </div>
            </div>{/* flex row end */}

            <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
                <ModalContent>
                    <ModalHeader>コンテナを追加</ModalHeader>
                    <ModalBody>
                        {errorAdd && <p className="text-red-500">{errorAdd}</p>}
                        <Input
                            label="コンテナ名"
                            value={containerName}
                            onChange={(e) => setContainerName(e.target.value)}
                        />
                        <Select
                            label="コンテナタイプ"
                            selectedKeys={[containerType]}
                            onSelectionChange={(keys) => {
                                const selected = keys.currentKey as "COLLECTION" | "TIME_SERIES";
                                setContainerType(selected);
                                if (selected === "TIME_SERIES") {
                                    setColumns(prev => prev.map((col, i) =>
                                        i === 0 ? { ...col, type: "TIMESTAMP" } : col
                                    ));
                                }
                            }}
                        >
                            <SelectItem key="COLLECTION">COLLECTION</SelectItem>
                            <SelectItem key="TIME_SERIES">TIME_SERIES</SelectItem>
                        </Select>
                        <Checkbox isSelected={rowKey} onValueChange={setRowKey}>
                            RowKeyを使用
                        </Checkbox>

                        <h3 className="mt-4">カラム情報</h3>
                        {columns.map((col, idx) => (
                            <div key={idx} className="flex gap-2 mb-2 items-center">
                                {rowKey && idx === 0
                                    ? <span title="RowKey" className="text-lg shrink-0">🔑</span>
                                    : <span className="w-[22px] shrink-0" />
                                }
                                <Input
                                    label="カラム名"
                                    labelPlacement="inside"
                                    value={col.name}
                                    onChange={(e) => updateColumn(idx, "name", e.target.value)}
                                />
                                <Select
                                    label="Type"
                                    placeholder="Select type"
                                    selectedKeys={[col.type]}
                                    onSelectionChange={(keys) => updateColumn(idx, "type", keys.anchorKey ?? "")}
                                    isDisabled={containerType === "TIME_SERIES" && idx === 0}
                                >
                                    {typeName.map((typeName) => (
                                        <SelectItem key={typeName.key}>{typeName.label}</SelectItem>
                                    ))}
                                </Select>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    isDisabled={columns.length <= 1 || (rowKey && idx === 0)}
                                    onPress={() => setColumns(prev => prev.filter((_, i) => i !== idx))}
                                >✕</Button>
                            </div>
                        ))}
                        <Button size="sm" onPress={addColumn}>カラム追加</Button>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={() => setIsOpen(false)}>キャンセル</Button>
                        <Button color="primary" onPress={handleCreate} isLoading={loadingAdd}>
                            作成
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};