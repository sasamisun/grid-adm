"use client";

import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { keymap, EditorView } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { useTheme } from "next-themes";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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

type SingleResult = SelectResult | NonSelectResult;

type SummaryItem = {
    stmt: string;
    success: boolean;
    detail: string;
};

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

const stripComments = (sql: string): string =>
    sql
        .replace(/--[^\n]*/g, "")          // -- 行コメント（行末まで）
        .replace(/\{[^}]*\}/g, "")         // { } ブロックコメント
        .replace(/\/\*[\s\S]*?\*\//g, ""); // /* */ ブロックコメント

const normalizeStatement = (stmt: string): string =>
    stripComments(stmt).replace(/\s+/g, " ").trim();

const detectSqlType = (stmt: string): "select" | "update" | "ddl" | "dcl" => {
    const first = stmt.trim().split(/\s+/)[0].toUpperCase();
    if (first === "SELECT") return "select";
    if (["UPDATE", "INSERT", "DELETE", "REPLACE"].includes(first)) return "update";
    if (["CREATE", "DROP", "ALTER"].includes(first)) return "ddl";
    return "dcl";
};

const parseStatements = (text: string): string[] =>
    text.split(";").map(s => s.trim()).filter(s => s.length > 0);

const getStatementAtCursor = (text: string, cursorPos: number): string => {
    let start = 0;
    for (let i = 0; i <= text.length; i++) {
        if (i === text.length || text[i] === ";") {
            if (cursorPos >= start && cursorPos <= i) {
                return text.slice(start, i).trim();
            }
            start = i + 1;
        }
    }
    return text.trim();
};

export const SqlEditor = ({ client, containerNames = [], onTitleChange }: SqlEditorProps) => {
    const { theme } = useTheme();
    const [query, setQuery] = useState("");
    const editorRef = useRef<EditorView | null>(null);

    // 結果表示用
    const [result, setResult] = useState<SingleResult | null>(null);
    const [multiSummary, setMultiSummary] = useState<SummaryItem[] | null>(null);
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

    // localStorage からのロード（マウント時のみ）
    useEffect(() => {
        try {
            const raw = localStorage.getItem("sql-editor-history");
            if (raw) setHistory(JSON.parse(raw).map((e: any) => ({ ...e, executedAt: new Date(e.executedAt) })));
        } catch {}
    }, []);
    useEffect(() => {
        try {
            const raw = localStorage.getItem("sql-editor-saved");
            if (raw) setSaved(JSON.parse(raw).map((e: any) => ({ ...e, savedAt: new Date(e.savedAt) })));
        } catch {}
    }, []);

    // localStorage への書き込みヘルパー（updater 内で同期保存）
    const updateHistory = (updater: (prev: HistoryEntry[]) => HistoryEntry[]) => {
        setHistory(prev => {
            const next = updater(prev);
            localStorage.setItem("sql-editor-history", JSON.stringify(next));
            return next;
        });
    };
    const updateSaved = (updater: (prev: SavedEntry[]) => SavedEntry[]) => {
        setSaved(prev => {
            const next = updater(prev);
            localStorage.setItem("sql-editor-saved", JSON.stringify(next));
            return next;
        });
    };

    const pagedRows = useMemo(() => {
        if (!result || result.kind !== "select") return [];
        const start = (page - 1) * PAGE_SIZE;
        return result.rows.slice(start, start + PAGE_SIZE);
    }, [result, page]);

    const totalPages = (result?.kind === "select")
        ? Math.max(1, Math.ceil(result.rows.length / PAGE_SIZE))
        : 1;

    // 単一ステートメントを実行して結果を返す（共通処理）
    const executeStatement = useCallback(async (stmt: string): Promise<SingleResult> => {
        const normalized = normalizeStatement(stmt);
        const sqlType = detectSqlType(normalized);
        if (sqlType === "select") {
            const res = await executeSqlSelect(client, normalized);
            const data = res.data[0];
            return { kind: "select", columns: data.columns.map((c: any) => c.name), rows: data.results };
        } else if (sqlType === "update") {
            const res = await executeSqlUpdate(client, normalized);
            const data = res.data[0];
            return { kind: "update", status: data.status, updatedRows: data.updatedRows, message: data.message };
        } else if (sqlType === "ddl") {
            const res = await executeSqlDdl(client, normalized);
            const data = res.data[0];
            return { kind: "ddl", status: data.status, message: data.message };
        } else {
            const res = await executeSqlDcl(client, normalized);
            const data = res.data[0];
            return { kind: "dcl", status: data.status, message: data.message };
        }
    }, [client]);

    // 優先順位: 選択範囲 > カーソル位置のステートメント
    const getQueryToExecute = (): string => {
        if (editorRef.current) {
            const { state } = editorRef.current;
            const sel = state.selection.main;
            if (!sel.empty) {
                const selected = state.sliceDoc(sel.from, sel.to).trim();
                if (selected) return selected;
            }
            return getStatementAtCursor(state.doc.toString(), sel.from);
        }
        return query.trim();
    };

    // カーソル位置（または選択範囲）のステートメントを実行
    const handleExecute = useCallback(async () => {
        const queryToRun = normalizeStatement(getQueryToExecute());
        if (!queryToRun) return;
        setExecuting(true);
        setResultError(null);
        setResult(null);
        setMultiSummary(null);
        setPage(1);
        const start = Date.now();
        try {
            const newResult = await executeStatement(queryToRun);
            const elapsed = Date.now() - start;
            setResult(newResult);
            setExecTime(elapsed);
            updateHistory(prev => [{
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
            updateHistory(prev => [{
                id: crypto.randomUUID(),
                query: queryToRun,
                executedAt: new Date(),
                execTime: elapsed,
                error: msg,
            }, ...prev]);
        } finally {
            setExecuting(false);
        }
    }, [query, client, executeStatement]);

    // すべてのステートメントを順番に実行
    const handleExecuteAll = useCallback(async () => {
        const stmts = parseStatements(query).filter(s => normalizeStatement(s).length > 0);
        if (stmts.length === 0) return;
        setExecuting(true);
        setResultError(null);
        setResult(null);
        setMultiSummary(null);
        setPage(1);
        const start = Date.now();
        const summary: SummaryItem[] = [];
        let lastSelectResult: SelectResult | null = null;
        let hasError = false;
        for (const stmt of stmts) {
            try {
                const r = await executeStatement(stmt);
                if (r.kind === "select") {
                    lastSelectResult = r;
                    summary.push({ stmt, success: true, detail: `${r.rows.length} 件` });
                } else if (r.kind === "update") {
                    const success = r.status !== 0;
                    summary.push({
                        stmt,
                        success,
                        detail: success
                            ? (r.updatedRows !== undefined ? `${r.updatedRows} 件更新` : "完了")
                            : (r.message ?? "失敗"),
                    });
                    if (!success) hasError = true;
                } else {
                    const success = r.status !== 0;
                    summary.push({ stmt, success, detail: success ? "完了" : (r.message ?? "失敗") });
                    if (!success) hasError = true;
                }
            } catch (err: any) {
                const msg = err.response?.data?.errorMessage || err.message || "Error";
                summary.push({ stmt, success: false, detail: msg });
                hasError = true;
            }
        }
        const elapsed = Date.now() - start;
        setMultiSummary(summary);
        if (lastSelectResult) setResult(lastSelectResult);
        setExecTime(elapsed);
        updateHistory(prev => [{
            id: crypto.randomUUID(),
            query: query.trim(),
            executedAt: new Date(),
            execTime: elapsed,
            error: hasError ? "一部のSQL実行に失敗しました" : undefined,
        }, ...prev]);
        setExecuting(false);
    }, [query, client, executeStatement]);

    const handleClear = () => {
        setQuery("");
        setResult(null);
        setMultiSummary(null);
        setResultError(null);
        setExecTime(null);
    };

    const handleSave = () => {
        if (!saveName.trim() || !query.trim()) return;
        const name = saveName.trim();
        updateSaved(prev => [{
            id: crypto.randomUUID(),
            name,
            query: query.trim(),
            savedAt: new Date(),
        }, ...prev]);
        setSaveName("");
        onTitleChange?.(name);
    };

    const handleDeleteSaved = (id: string) => {
        updateSaved(prev => prev.filter(e => e.id !== id));
    };

    const executeKeymap = useMemo(() => Prec.highest(keymap.of([
        {
            key: "Ctrl-Enter",
            mac: "Cmd-Enter",
            run: () => { handleExecute(); return true; },
        },
        {
            key: "Ctrl-Shift-Enter",
            mac: "Cmd-Shift-Enter",
            run: () => { handleExecuteAll(); return true; },
        },
    ])), [handleExecute, handleExecuteAll]);

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
                    <Button size="sm" color="secondary" variant="flat" onPress={handleExecuteAll} isLoading={executing} isDisabled={!query.trim()}>
                        すべて実行
                    </Button>
                    <Button size="sm" variant="flat" onPress={handleClear} isDisabled={!query.trim() && !result && !multiSummary}>
                        クリア
                    </Button>
                    <div className="flex items-center gap-1 ml-auto">
                        <Chip size="sm" variant="flat" className="text-xs text-gray-400">
                            Ctrl+Enter / Ctrl+Shift+Enter
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
                    {/* ステータスバー */}
                    {(result || multiSummary || resultError || execTime !== null) && (
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                            {result?.kind === "select" && !multiSummary && <span>{result.rows.length} 件</span>}
                            {execTime !== null && <span>{(execTime / 1000).toFixed(2)} 秒</span>}
                            {resultError && <span className="text-red-500">{resultError}</span>}
                        </div>
                    )}

                    {/* すべて実行サマリー */}
                    {multiSummary && (
                        <div className="border rounded p-2 flex flex-col gap-0.5">
                            {multiSummary.map((item, i) => (
                                <div key={i} className="flex gap-2 text-xs items-baseline">
                                    <span className={`shrink-0 ${item.success ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                                        {item.success ? "✓" : "✗"}
                                    </span>
                                    <span className="truncate text-gray-600 dark:text-zinc-400 flex-1">{normalizeStatement(item.stmt)}</span>
                                    <span className={`shrink-0 ${item.success ? "text-gray-500" : "text-red-500"}`}>{item.detail}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SELECT 結果テーブル */}
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
                    {result?.kind === "update" && !multiSummary && (
                        result.status === 0
                            ? <p className="text-sm text-red-500 mt-1">{result.message ?? "実行に失敗しました。"}</p>
                            : <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                {result.updatedRows !== undefined ? `${result.updatedRows} 件更新しました。` : "完了しました。"}
                              </p>
                    )}
                    {(result?.kind === "ddl" || result?.kind === "dcl") && !multiSummary && (
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
                            <Button size="sm" variant="light" className="text-xs h-5 min-w-0 px-1" onPress={() => updateHistory(() => [])}>
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
                                title={normalizeStatement(entry.query)}
                            >
                                <p className="text-xs text-gray-700 dark:text-zinc-300 truncate">{normalizeStatement(entry.query)}</p>
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
                                <p className="text-xs text-gray-400 truncate">{normalizeStatement(entry.query)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
