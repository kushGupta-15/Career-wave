"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, Lightbulb, Loader2 } from "lucide-react";
import { analyzeJobMatch } from "@/app/action";
import { toast } from "sonner";

interface AiJobMatcherProps {
  jobId: string;
  isLoggedIn: boolean;
}

interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  recommendations: string[];
}

export function AiJobMatcher({ jobId, isLoggedIn }: AiJobMatcherProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to run AI ATS analysis on your profile.");
      return;
    }

    try {
      setLoading(true);
      const res = await analyzeJobMatch(jobId);
      setResult(res);
      toast.success("AI ATS match analysis completed!");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to analyze match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Sparkles className="size-4 text-primary animate-pulse" />
            AI Resume & ATS Match Score
          </CardTitle>
          {result && (
            <Badge
              variant="secondary"
              className={
                result.matchScore >= 80
                  ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 font-bold"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-bold"
              }
            >
              {result.matchScore}% Match
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {!result ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Powered by Google Gemini 3.8 Flash. Compares this position&apos;s
              requirements against your profile and gives tailored application tips.
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              size="sm"
              className="w-full gap-2 text-xs font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Analyzing Alignment...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Check AI Match Score
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5 text-xs animate-in fade-in duration-300">
            {/* Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Alignment</span>
                <span className="font-bold text-foreground">{result.matchScore}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700 rounded-full"
                  style={{ width: `${result.matchScore}%` }}
                />
              </div>
            </div>

            {/* Summary */}
            <p className="text-muted-foreground leading-relaxed italic bg-muted/40 p-2.5 rounded-lg border">
              &quot;{result.summary}&quot;
            </p>

            {/* Key Strengths */}
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
                Key Strengths for this Role:
              </span>
              <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Lightbulb className="size-3.5 text-amber-500" />
                Keywords to Highlight:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {result.recommendations.map((r, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] py-0 px-2 font-normal">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              variant="ghost"
              size="sm"
              disabled={loading}
              className="w-full text-xs h-7 text-muted-foreground hover:text-foreground mt-2"
            >
              Re-analyze
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
