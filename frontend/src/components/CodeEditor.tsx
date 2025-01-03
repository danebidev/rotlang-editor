import React, { useState } from "react";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';

const CodeEditor = () => {
    const default_code = "deadass int frfr main() be like {\n    yeet 0;\n}"

    const [code, setCode] = useState(default_code);
    const [programOut, setProgramOut] = useState("");
    const [programErr, setProgramErr] = useState("");
    const [compOut, setCompOut] = useState("");
    const [compError, setCompError] = useState("");
    const [exitCode, setExitCode] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const [view, setView] = useState(false)

    const handleSubmit = async() => {
        setIsLoading(true);
        setProgramOut("");
        setProgramErr("");
        setCompOut("");
        setCompError("");
        setView(true);

        try {
            const response = await fetch("http://localhost:4000/api/compile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({code})
            });

            const data = await response.json();

            setCompOut(data.comp_output);

            if(!response.ok) {
                throw new Error(data.error || "Compilation failed");
            }

            setProgramOut(data.proc_output);
            setExitCode(data.proc_code);

            if(data.proc_error) {
                setProgramErr(data.proc_error);
            }

        } catch(err) {
            setCompError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onChange = React.useCallback((value) => {
        setCode(value);
    }, []);

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <div className="flex-1 p-4 border-r border-gray-700">
                <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-hidden rounded-md">
                        {/* TODO: Actually make an extension for my language */}
                        {/* If i can't i'll just get one that seems to be as close as possibe */}
                        <CodeMirror
                            value={code}
                            height="100%"
                            theme={oneDark}
                            extensions={[cpp()]}
                            onChange={onChange}
                            className="h-full"
                            basicSetup={{
                                lineNumbers: true,
                                highlightActiveLineGutter: true,
                                highlighSpecialChars: true,
                                history: true,
                                foldGutter: true,
                                drawSelection: true,
                                dropCursor: true,
                                allowMultipleSelections: true,
                                indentOnInput: true,
                                syntaxHighlighting: true,
                                brackedMatching: true,
                                closeBrackets: true,
                                rectangularSelection: true,
                                crosshairCursor: true,
                                highlightActiveLine: true,
                                highlightSelectionMatches: true,
                                tabSize: 4
                            }}
                        />
                    </div>
                    <div className="mt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? "Running..." : "Compile and run"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-1/2 p-4 bg-gray-900 overflow-y-auto">
                <div className="space-y-4">
                    {view && compError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                <pre className="whitespace-pre-wrap font-mono text-sm">
                                    {compError}
                                </pre>
                            </AlertDescription>
                        </Alert>
                    )}

                    {view && !compError && (
                        <Card className="bg-gray-800 border-gray-700">
                            <div className="p-4">
                                <h3 className="font-semibold mb-2 text-white">Program stdout (exit code {exitCode})</h3>
                                <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm text-white">
                                    {programOut || "No output"}
                                </pre>
                            </div>
                        </Card>
                    )}

                    {view && programErr && !compError && (
                        <Card className="bg-gray-800 border-gray-700">
                            <div className="p-4">
                                <h3 className="font-semibold mb-2 text-white">Program stderr</h3>
                                <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm text-white">
                                    {programErr}
                                </pre>
                            </div>
                        </Card>
                    )}

                    {view && (
                        <Card className="bg-gray-800 border-gray-700">
                            <div className="p-4">
                                <h3 className="font-semibold mb-2 text-white">Compiler output</h3>
                                <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm text-white">
                                    {compOut || "No compiler output"}
                                </pre>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
