declare module "tokenshrink" {
  interface CompressResult {
    compressed: string;
    rosetta: string;
    compressedBody: string;
    original: string;
    stats: Record<string, unknown>;
  }

  interface CompressOptions {
    domain?: string;
    strategy?: string;
  }

  export function compress(text: string, options?: CompressOptions): CompressResult;
  export function detectStrategy(text: string): {
    strategy: string;
    domain: string;
    confidence: number;
  };
  export function findRepeatedPhrases(
    text: string,
    minLength?: number,
    minOccurrences?: number
  ): Array<{ phrase: string; count: number }>;
  export function getDictionary(domain: string): Record<string, string>;
  export function countWords(text: string): number;
  export function countTokens(text: string, tokenizer?: unknown): number;
  export function replacementTokenSavings(
    original: string,
    replacement: string,
    tokenizer?: unknown
  ): number;

  export const COMMON: Record<string, string>;
  export const PHRASES: Record<string, string>;
  export const UNIVERSAL_ABBREVIATIONS: Set<string>;
  export const TOKEN_COSTS: Record<string, number>;
  export const ZERO_SAVINGS: Set<string>;
  export const NEGATIVE_SAVINGS: Set<string>;
}

declare module "api-guardrails" {
  interface Provider {
    name: string;
    slug: string;
    description: string;
    tosUrl: string;
    usagePolicyUrl: string;
    lastUpdated: string;
    color: string;
    allowed: string[];
    prohibited: string[];
    keyTosPoints: Array<{ section: string; summary: string; link: string }>;
  }

  interface Finding {
    ruleId: string;
    provider: string;
    verdict: string;
    reason: string;
    tosSection: string;
  }

  export const providers: Record<string, Provider>;
  export function getProvider(slug: string): Provider | null;
  export function getAllProviderSlugs(): string[];
  export function getAllProviders(): Provider[];
  export function analyzeCompliance(description: string): Finding[];
  export function groupByProvider(
    findings: Finding[]
  ): Record<string, Finding[]>;
  export function worstVerdict(providerFindings: Finding[]): string;
  export function overallSummary(
    findings: Finding[]
  ): { verdict: string; message: string };
}
