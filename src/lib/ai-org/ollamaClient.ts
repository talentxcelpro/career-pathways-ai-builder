// src/lib/ai-org/ollamaClient.ts
// Local Ollama LLM Client Service for TalentXcel AI Growth Organization
// Provides zero-token-cost local AI inference with automatic health checks,
// model switching (talentxcel-ceo, llama3.2:3b, phi3:latest, etc.), and structured JSON generation.

export interface OllamaModelInfo {
  name: string;
  size: number;
  family?: string;
  parameterSize?: string;
}

export interface OllamaHealthStatus {
  isOnline: boolean;
  endpoint: string;
  activeModel: string;
  availableModels: string[];
  latencyMs?: number;
  lastCheckedAt?: string;
  error?: string;
}

export interface OllamaGenerationResult {
  text: string;
  model: string;
  durationMs: number;
}

export interface OllamaJsonResult<T> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: string;
  modelUsed: string;
  durationMs: number;
}

// Local Storage Keys
const OLLAMA_ENDPOINT_KEY = 'talentxcel_ollama_endpoint';
const OLLAMA_ACTIVE_MODEL_KEY = 'talentxcel_ollama_active_model';

const DEFAULT_ENDPOINT = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'talentxcel-ceo';
const FALLBACK_MODEL = 'llama3.2:3b';

/**
 * Gets the configured Ollama base endpoint
 */
export function getOllamaEndpoint(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(OLLAMA_ENDPOINT_KEY) || DEFAULT_ENDPOINT;
  }
  return DEFAULT_ENDPOINT;
}

/**
 * Updates the configured Ollama endpoint
 */
export function setOllamaEndpoint(endpoint: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(OLLAMA_ENDPOINT_KEY, endpoint.trim().replace(/\/+$/, ''));
  }
}

/**
 * Gets the selected model name
 */
export function getActiveOllamaModel(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(OLLAMA_ACTIVE_MODEL_KEY) || DEFAULT_MODEL;
  }
  return DEFAULT_MODEL;
}

/**
 * Updates the selected model name
 */
export function setActiveOllamaModel(modelName: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(OLLAMA_ACTIVE_MODEL_KEY, modelName.trim());
  }
}

/**
 * Checks connection health to local Ollama server and lists available models
 */
export async function checkOllamaStatus(): Promise<OllamaHealthStatus> {
  const endpoint = getOllamaEndpoint();
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        isOnline: false,
        endpoint,
        activeModel: getActiveOllamaModel(),
        availableModels: [],
        latencyMs,
        lastCheckedAt: new Date().toISOString(),
        error: `Ollama HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const models: string[] = Array.isArray(data.models) 
      ? data.models.map((m: any) => m.name || m.model).filter(Boolean)
      : [];

    let currentModel = getActiveOllamaModel();
    const matchesModel = (name: string, target: string) => name === target || name.startsWith(`${target}:`);

    if (models.length > 0 && !models.some(m => matchesModel(m, currentModel))) {
      const foundDefault = models.find(m => matchesModel(m, DEFAULT_MODEL));
      const foundFallback = models.find(m => matchesModel(m, FALLBACK_MODEL));

      if (foundDefault) {
        currentModel = foundDefault;
      } else if (foundFallback) {
        currentModel = foundFallback;
      } else {
        currentModel = models[0];
      }
      setActiveOllamaModel(currentModel);
    }

    return {
      isOnline: true,
      endpoint,
      activeModel: currentModel,
      availableModels: models,
      latencyMs,
      lastCheckedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      isOnline: false,
      endpoint,
      activeModel: getActiveOllamaModel(),
      availableModels: [],
      latencyMs: Date.now() - startTime,
      lastCheckedAt: new Date().toISOString(),
      error: err.name === 'AbortError' 
        ? 'Connection timed out (Ollama not responding on 11434)' 
        : (err.message || 'Cannot reach Ollama at 127.0.0.1:11434'),
    };
  }
}

/**
 * Executes text completion against the active Ollama model
 */
export async function generateOllamaCompletion(
  prompt: string,
  systemPrompt?: string,
  options: { model?: string; temperature?: number; format?: string } = {}
): Promise<OllamaGenerationResult> {
  const endpoint = getOllamaEndpoint();
  const model = options.model || getActiveOllamaModel();
  const temperature = options.temperature ?? 0.3;
  const startTime = Date.now();

  const controller = new AbortController();
  // 60-second timeout for local CPU inference
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const payload: Record<string, any> = {
      model,
      prompt,
      stream: false,
      options: {
        temperature,
        top_p: 0.9,
      },
    };

    if (options.format) {
      payload.format = options.format;
    }

    if (systemPrompt) {
      payload.system = systemPrompt;
    }

    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama error HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      text: data.response || '',
      model,
      durationMs: Date.now() - startTime,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Generates and parses strongly-typed JSON from Ollama with robust markdown extraction
 */
export async function generateOllamaJson<T = any>(
  prompt: string,
  systemPrompt?: string,
  options: { model?: string; temperature?: number } = {}
): Promise<OllamaJsonResult<T>> {
  const model = options.model || getActiveOllamaModel();
  const fullSystemPrompt = `${systemPrompt || ''}\n\nIMPORTANT: Output valid, parseable JSON ONLY. Do not include introductory text, conversational remarks, or markdown text outside the JSON object.`;

  try {
    const res = await generateOllamaCompletion(prompt, fullSystemPrompt, {
      model,
      temperature: options.temperature ?? 0.2, // lower temperature for JSON
      format: 'json',
    });

    const raw = res.text.trim();
    const cleanJson = extractJsonFromResponse(raw);

    if (!cleanJson) {
      return {
        success: false,
        rawText: raw,
        error: 'Model output did not contain parseable JSON brackets.',
        modelUsed: model,
        durationMs: res.durationMs,
      };
    }

    const parsed: T = JSON.parse(cleanJson);
    return {
      success: true,
      data: parsed,
      rawText: raw,
      modelUsed: model,
      durationMs: res.durationMs,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error communicating with Ollama',
      modelUsed: model,
      durationMs: 0,
    };
  }
}

/**
 * Extracts and sanitizes JSON string from LLM output
 */
function extractJsonFromResponse(text: string): string | null {
  // 1. Try markdown fenced block ```json ... ```
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = text.match(jsonBlockRegex);
  let candidate = match ? match[1].trim() : text.trim();

  // 2. Find outermost { ... } or [ ... ]
  const firstBrace = candidate.indexOf('{');
  const firstBracket = candidate.indexOf('[');
  
  if (firstBrace === -1 && firstBracket === -1) {
    return null;
  }

  let startIndex = -1;
  let endIndex = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    endIndex = candidate.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    endIndex = candidate.lastIndexOf(']');
  }

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  candidate = candidate.slice(startIndex, endIndex + 1);

  // 3. Clean up trailing commas before closing braces/brackets
  candidate = candidate
    .replace(/,\s*([}\]])/g, '$1');

  return candidate;
}
