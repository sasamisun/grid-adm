"use client";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState, useRef } from "react";
import { createHttpClient, useGriddb, getContainer, getContainerInfo, postContainer, deleteContainer } from "@/hooks/useGriddbAccess";
import { AuthInfo, Containers, Container, Column, typeName } from "../types";
import { IconRefresh, IconTablePlus, IconTrash } from '@tabler/icons-react';
import RightPane, { RightPaneHandle } from '@/components/RightPane';
import { Chip } from "@heroui/react";

type PanelProps = {
    auth: AuthInfo;
};

type Props = {
    auth: AuthInfo;
    onCreated: () => void; // コンテナ作成後に一覧を再取得するため
};


export const Panel = ({ auth }: PanelProps) => {
    const rightPaneRef = useRef<RightPaneHandle>(null);
    const client = createHttpClient(auth);

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
    }, [containers.names]);

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
        } catch (err: any) {
            setErrorAdd(err.message || "API Error");
        } finally {
            setLoadingAdd(false);
        }
    };
    return (
        <>
            <Divider />
            <Button onPress={handleReload} color="default"><IconRefresh
                size={18} // set custom `width` and `height`
                color="black" // set `stroke` color
                stroke={2}  // set `stroke-width`
                strokeLinejoin="miter" // override other SVG props
            /></Button>
            <Button onPress={() => setIsOpen(true)} color="default"><IconTablePlus
                size={18} // set custom `width` and `height`
                color="black" // set `stroke` color
                stroke={2}  // set `stroke-width`
                strokeLinejoin="miter" // override other SVG props
            /></Button>
            <Button onPress={handleDelete} color="default"><IconTrash
                size={18} // set custom `width` and `height`
                color="black" // set `stroke` color
                stroke={2}  // set `stroke-width`
                strokeLinejoin="miter" // override other SVG props
            /></Button>

            {loading && <p>Loading containers...</p>}
            {error && <p>Error: {error}</p>}

            <Listbox aria-label="Containers" selectionMode="single"
                onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    if (selectedKey) {
                        handleAddContainer(containers.names[Number(selectedKey)]);
                    }
                }}>
                {containers?.names?.length > 0 ? (
                    containers.names.map((name, index) => (
                        <ListboxItem key={index} textValue={name}>
                            {name}
                            <Chip size="sm">{containerDetails[name] ? containerDetails[name].container_type.substring(0, 3) : "?"}</Chip>
                        </ListboxItem>
                    ))
                ) : (
                    <ListboxItem>No containers found</ListboxItem>
                )}
            </Listbox>

            {/* 選択されたコンテナの詳細を表示 
            {selectedContainer && containerDetails[selectedContainer] && (
                <div className="mt-6 border p-4 rounded">
                    <h2>{containerDetails[selectedContainer].container_name}</h2>
                    <p>Type: {containerDetails[selectedContainer].container_type}</p>
                    <p>RowKey: {containerDetails[selectedContainer].rowkey ? "Yes" : "No"}</p>
                    <h3>Columns:</h3>
                    <ul>
                        {containerDetails[selectedContainer].columns.map((col, idx) => (
                            <li key={idx}>
                                {col.name} ({col.type}) [Index: {col.index.join(", ")}]
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            */}

            <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
                <ModalContent>
                    <ModalHeader>コンテナを追加</ModalHeader>
                    <ModalBody>
                        {error && <p className="text-red-500">{error}</p>}
                        <Input
                            label="コンテナ名"
                            value={containerName}
                            onChange={(e) => setContainerName(e.target.value)}
                        />
                        <Select
                            label="コンテナタイプ"
                            selectedKeys={[containerType]}
                            onSelectionChange={(keys) => setContainerType(keys.currentKey as "COLLECTION" | "TIME_SERIES")}
                        >
                            <SelectItem key="COLLECTION">COLLECTION</SelectItem>
                            <SelectItem key="TIME_SERIES">TIME_SERIES</SelectItem>
                        </Select>
                        <Checkbox isSelected={rowKey} onValueChange={setRowKey}>
                            RowKeyを使用
                        </Checkbox>

                        <h3 className="mt-4">カラム情報</h3>
                        {columns.map((col, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <Input
                                    placeholder="カラム名"
                                    value={col.name}
                                    onChange={(e) => updateColumn(idx, "name", e.target.value)}
                                />

                                <Select
                                    label="Type"
                                    placeholder="Select type"
                                    selectedKeys={[col.type]}
                                    onSelectionChange={(keys) => updateColumn(idx, "type", keys.anchorKey ?? "")}
                                >
                                    {typeName.map((typeName) => (
                                        <SelectItem key={typeName.key}>{typeName.label}</SelectItem>
                                    ))}
                                </Select>
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
            <RightPane client={client} ref={rightPaneRef} />
        </>
    );
};