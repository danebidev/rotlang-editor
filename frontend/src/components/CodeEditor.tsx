import React, { useState } from "react";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const CodeEditor = () => {
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async() => {
        setIsLoading(true);
        setOutput("");

        const response = await fetch("/api/compile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({code})
        });

        const data = await response.json();

        setOutput(data.output)
        setIsLoading(false);
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

            {output && (
                <Card classname="p-4">
                    <h3 className="font-semibold mb-2">Output:</h3>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                        {output}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default CodeEditor;
