"use client";

import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { keymap, EditorView } from "@codemirror/view";
import { useTheme } from "next-themes";
import { useState, useCallback, useMemo, useRef } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Input } from "@heroui/input";
import { IconHistory, IconBookmark, IconDeviceFloppy, IconTrash, IconPlayerPlay } from "@tabler/icons-react";
import { createHttpClient, executeSqlSelect, executeSqlUpdate, executeSqlDdl, executeSqlDcl } from "@/hooks/useGriddbAccess";

const PAGE_SIZE = 50;

type SelectResult = {
    kind: "select";
    columns: string[];
    rows: any[][];
};

type NonSelectResult = {
    kind: "update" | "ddl" | "dcl";
    status: number;
    updatedRows?: number;
    message?: string | null;
};

type QueryResult = SelectResult | NonSelectResult;

type HistoryEntry = {
    id: string;
    query: string;
    executedAt: Date;
    execTime?: number;
    error?: string;
};

type SavedEntry = {
    id: string;
    name: string;
    query: string;
    savedAt: Date;
};

type SqlEditorProps = {
    client: ReturnType<typeof createHttpClient>;
    containerNames?: string[];
    onTitleChange?: (title: string) => void;
};

const detectSqlType = (stmt: string): "select" | "update" | "ddl" | "dcl" => {
    const first = stmt.trim().split(/\s+/)[0].toUpperCase();
    if (first === "SELECT") return "select";
    if (["UPDATE", "INSERT", "DELETE", "REPLACE"].includes(first)) return "update";
    if (["CREATE", "DROP", "ALTER"].includes(first)) return "ddl";
    return "dcl";
};

export const SqlEditor = ({ client, containerNames = [], onTitleChange }: SqlEditorProps) => {
    const { theme } = useTheme();
    const [query, setQuery] = useState("");
    const editorRef = useRef<EditorView | null>(null);

    // 結果表示用
    const [result, setResult] = useState<QueryResult | null>(null);
    const [resultError, setResultError] = useState<string | null>(null);
    const [execTime, setExecTime] = useState<number | null>(null);
    const [executing, setExecuting] = useState(false);
    const [page, setPage] = useState(1);

    // サイドパネル
    const [sidePanel, setSidePanel] = useState<"history" | "saved" | null>(null);

    // 履歴
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    // 保存済みクエリ
    const [saved, setSaved] = useState<SavedEntry[]>([]);
    const [saveName, setSaveName] = useState("");

    const pagedRows = useMemo(() => {
        if (!result || result.kind !== "select") return [];
        const start = (page - 1) * PAGE_SIZE;
        return result.rows.slice(start, start + PAGE_SIZE);
    }, [result, page]);

    const totalPages = (result?.kind === "select")
        ? Math.max(1, Math.ceil(result.rows.length / PAGE_SIZE))
        : 1;

    const getQueryToExecute = (): string => {
        if (editorRef.current) {
            const { state } = editorRef.current;
            const sel = state.selection.main;
            if (!sel.empty) {
                const selected = state.sliceDoc(sel.from, sel.to).trim();
                if (selected) return selected;
            }
        }
        return query.trim();
    };

    const handleExecute = useCallback(async () => {
        const queryToRun = getQueryToExecute();
        if (!queryToRun) return;
        setExecuting(true);
        setResultError(null);
        setResult(null);
        setPage(1);
        const start = Date.now();
        try {
            const sqlType = detectSqlType(queryToRun);
            let newResult: QueryResult;

            if (sqlType === "select") {
                const res = await executeSqlSelect(client, queryToRun);
                const data = res.data[0];
                newResult = {
                    kind: "select",
                    columns: data.columns.map((c: any) => c.name),
                    rows: data.results,
                };
            } else if (sqlType === "update") {
                const res = await executeSqlUpdate(client, queryToRun);
                const data = res.data[0];
                newResult = {
                    kind: "update",
                    status: data.status,
                    updatedRows: data.updatedRows,
                    message: data.message,
                };
            } else if (sqlType === "ddl") {
                const res = await executeSqlDdl(client, queryToRun);
                const data = res.data[0];
                newResult = {
                    kind: "ddl",
                    status: data.status,
                    message: data.message,
                };
            } else {
                const res = await executeSqlDcl(client, queryToRun);
                const data = res.data[0];
                newResult = {
                    kind: "dcl",
                    status: data.status,
                    message: data.message,
                };
            }

            const elapsed = Date.now() - start;
            setResult(newResult);
            setExecTime(elapsed);
            setHistory(prev => [{
                id: crypto.randomUUID(),
                query: queryToRun,
                executedAt: new Date(),
                execTime: elapsed,
            }, ...prev]);
        } catch (err: any) {
            const elapsed = Date.now() - start;
            const msg = err.response?.data?.errorMessage || err.message || "Error";
            setResultError(msg);
            setExecTime(elapsed);
            setHistory(prev => [{
                id: crypto.randomUUID(),
                query: queryToRun,
                executedAt: new Date(),
                execTime: elapsed,
                error: msg,
            }, ...prev]);
        } finally {
            setExecuting(false);
        }
    }, [query, client]);

    const handleClear = () => {
        setQuery("");
        setResult(null);
        setResultError(null);
        setExecTime(null);
    };

    const handleSave = () => {
        if (!saveName.trim() || !query.trim()) return;
        const name = saveName.trim();
        setSaved(prev => [{
            id: crypto.randomUUID(),
            name,
            query: query.trim(),
            savedAt: new Date(),
        }, ...prev]);
        setSaveName("");
        onTitleChange?.(name);
    };

    const handleDeleteSaved = (id: string) => {
        setSaved(prev => prev.filter(e => e.id !== id));
    };

    const executeKeymap = useMemo(() => keymap.of([
        {
            key: "Ctrl-Enter",
            mac: "Cmd-Enter",
            run: () => { handleExecute(); return true; },
        },
    ]), [handleExecute]);

    const extensions = useMemo(() => [
        sql({
            upperCaseKeywords: true,
            schema: Object.fromEntries(containerNames.map(name => [name, []]))
        }),
        executeKeymap,
    ], [containerNames, executeKeymap]);

    const togglePanel = (panel: "history" | "saved") => {
        setSidePanel(prev => prev === panel ? null : panel);
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    return (
        <div className="flex gap-2 h-full">
            {/* メインエリア */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                {/* ツールバー */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" color="primary" onPress={handleExecute} isLoading={executing} isDisabled={!query.trim()}>
                        実行
                    </Button>
                    <Button size="sm" variant="flat" onPress={handleClear} isDisabled={!query.trim() && !result}>
                        クリア
                    </Button>
                    <div className="flex items-center gap-1 ml-auto">
                        <Chip size="sm" variant="flat" className="text-xs text-gray-400">
                            Ctrl + Enter で実行
                        </Chip>
                        <Button
                            isIconOnly size="sm" variant={sidePanel === "history" ? "flat" : "light"}
                            color={sidePanel === "history" ? "primary" : "default"}
                            onPress={() => togglePanel("history")}
                            title="履歴"
                        >
                            <IconHistory size={15} />
                        </Button>
                        <Button
                            isIconOnly size="sm" variant={sidePanel === "saved" ? "flat" : "light"}
                            color={sidePanel === "saved" ? "primary" : "default"}
                            onPress={() => togglePanel("saved")}
                            title="保存済みクエリ"
                        >
                            <IconBookmark size={15} />
                        </Button>
                    </div>
                </div>

                {/* エディタ */}
                <CodeMirror
                    value={query}
                    onChange={setQuery}
                    onCreateEditor={(view) => { editorRef.current = view; }}
                    extensions={extensions}
                    theme={theme === "dark" ? vscodeDark : "light"}
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        foldGutter: false,
                        dropCursor: false,
                        allowMultipleSelections: false,
                        indentOnInput: true,
                        syntaxHighlighting: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: false,
                        crosshairCursor: false,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        searchKeymap: false,
                    }}
                    className="border rounded text-sm"
                    height="240px"
                />

                {/* 結果エリア */}
                <div className="flex flex-col gap-1 mt-1">
                    {(result || resultError || execTime !== null) && (
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                            {result?.kind === "select" && <span>{result.rows.length} 件</span>}
                            {execTime !== null && <span>{(execTime / 1000).toFixed(2)} 秒</span>}
                            {resultError && <span className="text-red-500">{resultError}</span>}
                        </div>
                    )}
                    {result?.kind === "select" && result.rows.length > 0 && (
                        <>
                            <div className="overflow-x-auto border rounded">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-zinc-800">
                                            {result.columns.map((col, i) => (
                                                <th key={i} className="border border-gray-300 dark:border-zinc-600 px-2 py-1 text-left font-medium whitespace-nowrap">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedRows.map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                                                {row.map((cell, colIdx) => (
                                                    <td key={colIdx} className="border border-gray-200 dark:border-zinc-700 px-2 py-1 whitespace-nowrap">
                                                        {cell === null || cell === undefined
                                                            ? <span className="text-gray-400 italic text-xs">null</span>
                                                            : String(cell)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-1">
                                    <Pagination total={totalPages} page={page} onChange={setPage} size="sm" showControls />
                                </div>
                            )}
                        </>
                    )}
                    {result?.kind === "select" && result.rows.length === 0 && (
                        <p className="text-sm text-gray-400 mt-1">結果が0件でした。</p>
                    )}
                    {result?.kind === "update" && (
                        result.status === 0
                            ? <p className="text-sm text-red-500 mt-1">{result.message ?? "実行に失敗しました。"}</p>
                            : <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                {result.updatedRows !== undefined ? `${result.updatedRows} 件更新しました。` : "完了しました。"}
                              </p>
                    )}
                    {(result?.kind === "ddl" || result?.kind === "dcl") && (
                        result.status === 0
                            ? <p className="text-sm text-red-500 mt-1">{result.message ?? "実行に失敗しました。"}</p>
                            : <p className="text-sm text-green-600 dark:text-green-400 mt-1">完了しました。</p>
                    )}
                </div>
            </div>

            {/* サイドパネル：履歴 */}
            {sidePanel === "history" && (
                <div className="w-64 shrink-0 border-l pl-2 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">実行履歴</span>
                        {history.length > 0 && (
                            <Button size="sm" variant="light" className="text-xs h-5 min-w-0 px-1" onPress={() => setHistory([])}>
                                クリア
                            </Button>
                        )}
                    </div>
                    {history.length === 0 && (
                        <p className="text-xs text-gray-400 mt-2">履歴はありません。</p>
                    )}
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[480px]">
                        {history.map(entry => (
                            <div
                                key={entry.id}
                                className="border rounded p-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700"
                                onClick={() => setQuery(entry.query)}
                                title={entry.query}
                            >
                                <p className="text-xs text-gray-700 dark:text-zinc-300 truncate">{entry.query}</p>
                                <div className="flex gap-2 mt-0.5 text-xs text-gray-400">
                                    <span>{formatTime(entry.executedAt)}</span>
                                    {entry.execTime !== undefined && <span>{(entry.execTime / 1000).toFixed(2)}s</span>}
                                    {entry.error && <span className="text-red-400">✕</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* サイドパネル：保存済みクエリ */}
            {sidePanel === "saved" && (
                <div className="w-64 shrink-0 border-l pl-2 flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">保存済みクエリ</span>

                    {/* 現在のクエリを保存 */}
                    <div className="flex gap-1 items-center">
                        <Input
                            size="sm"
                            label="クエリ名"
                            labelPlacement="inside"
                            value={saveName}
                            onChange={e => setSaveName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                        />
                        <Button
                            isIconOnly size="sm" color="primary" variant="flat"
                            isDisabled={!saveName.trim() || !query.trim()}
                            onPress={handleSave}
                            title="保存"
                        >
                            <IconDeviceFloppy size={15} />
                        </Button>
                    </div>

                    {/* 保存済み一覧 */}
                    {saved.length === 0 && (
                        <p className="text-xs text-gray-400">保存済みクエリはありません。</p>
                    )}
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[440px]">
                        {saved.map(entry => (
                            <div key={entry.id} className="border rounded p-1.5 flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-medium truncate text-gray-700 dark:text-zinc-200">
                                        {entry.name}
                                    </span>
                                    <div className="flex shrink-0">
                                        <Button
                                            isIconOnly size="sm" variant="light"
                                            onPress={() => { setQuery(entry.query); onTitleChange?.(entry.name); }}
                                            title="エディタに読み込む"
                                        >
                                            <IconPlayerPlay size={13} />
                                        </Button>
                                        <Button
                                            isIconOnly size="sm" variant="light" color="danger"
                                            onPress={() => handleDeleteSaved(entry.id)}
                                            title="削除"
                                        >
                                            <IconTrash size={13} />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 truncate">{entry.query}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
