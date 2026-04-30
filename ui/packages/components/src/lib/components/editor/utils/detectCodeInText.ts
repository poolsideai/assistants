interface Result {
  isCode: boolean;
  codeRatio: number;
}

interface Feature {
  regex: RegExp;
  description: string;
  maxSize?: number;
}

interface Options {
  /**
   * Minimum percentage of code features required to classify as code
   * @default 6
   */
  threshold?: number;
  sampleLimit?: number;
  normalize?: boolean;
}

// checks if the text starts with a markdown code fence, single or double tick
export function hasFencePrefix(text: string) {
  return /^[\n\s]*`/.test(text);
}

function normalizeInput(input: string) {
  return input.replace(/(https?:\/\/|www\.)\S+/gi, " URL ");
}

/**
 * a naive classifier that will find the density of code-like features
 * in user-input prompt text, and use it to decide on whether it is code
 * given our UX (e.g. tries to avoid reclassifying markdown where user has fenced)
 **/
export function detectCodeInText(input: string, opts?: Options): Result {
  const { threshold = 6, sampleLimit = 16000, normalize = true } = opts || {};

  if (normalize) {
    input = normalizeInput(input);
  }

  input = input.slice(0, sampleLimit);

  // handle manually fenced markdown
  if (hasFencePrefix(input)) {
    return {
      isCode: false,
      codeRatio: 0,
    };
  }

  const CODE_FEATURES: Feature[] = [
    { regex: /["']\w+["']\s*:/, description: "JSON-like key-value pair", maxSize: 100 },
    { regex: /[\w.]+\([^)]*\)/, description: "Calls", maxSize: 64 },
    { regex: /\w+\.\w+[[(]/, description: "indexing members", maxSize: 64 },
    { regex: /<\w+( \w+\=("|'))*>|<\/\w+>/, description: "Tags", maxSize: 120 },
    { regex: /(^|\n)\s*(var|let|const)\s+\w+\s+:?\=/, description: "Assignment", maxSize: 120 },
    { regex: /(^|\n)(func(tion)|def) \w+\(/, description: "Function definition", maxSize: 32 },
    { regex: /(^|\n)import ("|'|\()/, description: "Import", maxSize: 20 },
    { regex: /\[\]\w+/, description: "array types", maxSize: 32 },
    { regex: /\b(SELECT|FROM|WHERE|DELETE|UPDATE|INSERT)\b/, description: "SQL", maxSize: 8 },
    { regex: /[*&]\w+/, description: "pointer", maxSize: 32 },
    { regex: /\+\s*['"]|\+ ?['"]/, description: "concat", maxSize: 8 },
    { regex: /\s*\/\/|\/\*+|\*\//, description: "Comment indicators", maxSize: 3 },
    {
      regex: /\b([!=]={,2}|[+\-*/%&|^:]=|\+\+|--|<<|>>|&&|\|\|)\b/,
      description: "Operators",
      maxSize: 4,
    },
    { regex: /\(\)/, description: "Empty call", maxSize: 2 },
  ];

  let currentIndex = 0;

  const processFeatures = (): undefined | [boolean, number] => {
    for (const feature of CODE_FEATURES) {
      // most code features are small
      const sample = input.slice(currentIndex, currentIndex + (feature.maxSize ?? 16));
      const match = feature.regex.exec(sample);
      if (match && match.index === 0) {
        return [true, match[0].length];
      }
    }
  };

  let codeMatchLength = 0;

  while (currentIndex < input.length) {
    const match = processFeatures();
    if (!match) {
      currentIndex++;
      continue;
    }
    const [isCode, matchedLength] = match;
    if (isCode) {
      codeMatchLength += matchedLength;
    }
    currentIndex += matchedLength;
  }

  const codeRatio = codeMatchLength / input.length;
  return {
    isCode: codeRatio > threshold / 100,
    codeRatio,
  };
}
