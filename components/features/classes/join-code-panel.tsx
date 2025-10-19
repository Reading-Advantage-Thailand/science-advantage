"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface JoinCodePanelProps {
  className?: string;
  joinCode: string;
  classTitle: string;
}

export function JoinCodePanel({ className, joinCode, classTitle }: JoinCodePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy join code", error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Class Join Code</CardTitle>
        <CardDescription>
          Share this code with students so they can join {classTitle}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-dashed border-rose-200 bg-rose-50 px-4 py-3">
          <span className="font-mono text-xl font-semibold tracking-wide text-rose-700">{joinCode}</span>
          <Button variant="outline" size="icon" aria-label="Copy join code" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Students enter this code after signing in. The code is case sensitive and expires when you regenerate it.
        </p>
      </CardContent>
    </Card>
  );
}
