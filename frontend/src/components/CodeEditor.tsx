import React, { useState } from "react";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const CodeEditor = () => {
    const default_code = "deadass int frfr main() be like {\n   yeet 0;\n}"

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
        setView(true)

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

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
            <Card className="p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h64 p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your code here."
                />
                <div className="mt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full"
                    >
                        {isLoading ? "Running..." : "Compile and run"}
                    </Button>
                </div>
            </Card>

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
                <Card className="p-4">
                    <h3 className="font-semibold mb-2">Program stdout (exit code {exitCode}):</h3>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                        {programOut}
                    </pre>
                </Card>
            )}

            {view && programErr && !compError && (
                <Card className="p-4">
                    <h3 className="font-semibold mb-2">Program stderr:</h3>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                        {programErr}
                    </pre>
                </Card>
            )}

            {view && (
                <Card className="p-4">
                    <h3 className="font-semibold mb-2">Compilator output:</h3>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                        {compOut}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default CodeEditor;
