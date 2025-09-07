import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { CopyIcon } from './icons/CopyIcon';

interface DebugTerminalProps {
    logs: object[];
}

const LogEntry: React.FC<{ log: object }> = ({ log }) => {
    const [copied, setCopied] = useState(false);
    const textToCopy = JSON.stringify(log, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative mb-2 pb-2 border-b border-gray-700 last:border-b-0 last:mb-0">
             <button
                onClick={handleCopy}
                className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 text-xs font-semibold bg-secondary text-secondary-foreground rounded-md hover:bg-secondary-foreground/10"
            >
                <CopyIcon className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="whitespace-pre-wrap break-all">
                {textToCopy}
            </pre>
        </div>
    );
};


export const DebugTerminal: React.FC<DebugTerminalProps> = ({ logs }) => {
    const logsEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [logs]);

    if (logs.length === 0) {
        return null;
    }

    return (
        <section>
             <h2 className="text-3xl font-bold text-primary mb-4 text-center">API Request Debugger</h2>
            <Card>
                <div className="bg-black/80 text-white font-mono text-xs rounded-lg p-4 max-h-96 overflow-y-auto">
                    {logs.map((log, index) => (
                        <LogEntry key={index} log={log} />
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </Card>
        </section>
    );
};