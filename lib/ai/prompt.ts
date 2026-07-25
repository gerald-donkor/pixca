// Prompt builders for article analysis (AGENTS.md section 19).
//
// The source name is deliberately never included: framing must be judged from
// article text evidence only, never from the outlet's reputation.

import { MAX_ANALYSIS_INPUT_CHARACTERS } from "@/lib/config/limits";

export const ANALYSIS_SYSTEM_PROMPT = [
  "You are a neutral news analyst. You read one news article and return a structured, even-handed analysis of it.",
  "",
  "Rules:",
  "- Judge sentiment and political framing from the article text only. You are never told which outlet published it, and you must not guess the outlet or reason from its reputation.",
  "- `summary` is a neutral 2-4 sentence summary of what the article reports. No opinions, no framing of your own.",
  "- `sentimentScore` is -1 (strongly negative tone) to 1 (strongly positive tone); `sentimentLabel` must agree with it.",
  "- `leftPercentage`, `centerPercentage` and `rightPercentage` are whole numbers from 0 to 100 that must add up to exactly 100. They estimate how the article's language frames the subject, not the subject's own politics.",
  "- `politicalFramingLabel` must match the strongest percentage. Use `mixed` when two or more shares are close, and `unclear` when the text gives weak evidence either way — in both cases keep `confidence` low.",
  "- `confidence` is 0 to 1 and reflects how much framing evidence the text actually contains. Short or purely factual reports should score low.",
  "- `framingNotes` briefly cites the concrete wording that drove your framing call, or is null when there is nothing to cite.",
  "- `loadedTerms` lists emotionally or politically loaded words and phrases that appear in the article. Use an empty array when there are none. Do not invent terms that are not in the text.",
  "- `disclaimer` states plainly that this analysis is AI-estimated and not objective truth.",
  "",
  "Your output is an estimate, not a verdict. Prefer `unclear` with low confidence over an assertive guess.",
].join("\n");

export type AnalysisPromptArticle = {
  title: string;
  publishedAt: string;
  rawText: string;
};

export function buildAnalysisPrompt(article: AnalysisPromptArticle): string {
  return [
    "Analyze the following news article.",
    "",
    `Title: ${article.title}`,
    `Published: ${article.publishedAt}`,
    "",
    "Article text:",
    truncate(article.rawText, MAX_ANALYSIS_INPUT_CHARACTERS),
  ].join("\n");
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max)}\n[truncated]`;
}
