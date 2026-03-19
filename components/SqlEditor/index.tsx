"use client";

import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "next-themes";
import { useState } from "react";

type SqlEditorProps = {
    containerNames?: string[];
};

export const SqlEditor = ({ containerNames = [] }: SqlEditorProps) => {
    const { theme } = useTheme();
    const [query, setQuery] = useState("");

    return (
        <div className="flex flex-col gap-2 h-full">
            <CodeMirror
                value={query}
                onChange={setQuery}
                extensions={[
                    sql({
                        upperCaseKeywords: true,
                        schema: Object.fromEntries(containerNames.map(name => [name, []]))
                    }),
                ]}
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
        </div>
    );
};
