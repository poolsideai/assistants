import { execFileSync } from "child_process";

/**
 * User-facing changelog generator for the tag-driven release flow.
 *
 * The core (`parseGitLog` / `filterUserFacing` / `groupCommits` /
 * `renderChangelogFile`) is pure so it is unit-testable without touching git.
 * `collectCommits` is the only function that shells out.
 *
 * The default markdown is written for end users and is shared by the GitHub
 * release notes, the CrabNebula release notes, and the stamped product
 * `CHANGELOG.md`: no commit hashes, authors, repository links, or
 * ticket/pull-request references (the repository and tracker are private, so
 * `(#123)` and `PE-1234` mean nothing externally), a noise filter for commits
 * that only touch docs or lockfiles, and Improvements/Fixes grouping. The
 * Slack variant stays internal-facing with authors and pull-request links.
 * Paths are scoped to an app's owning dirs (from `projects.yml`) so
 * shared-package changes appear in every app that bundles them, while another
 * app's commits are excluded.
 */

/** How many commit bullets the Slack variant shows before collapsing to a link. */
export const SLACK_CHANGELOG_COMMIT_LIMIT = 5;

/** Conventional-commit types that never produce a user-facing entry. */
const EXCLUDED_TYPES = new Set(["chore", "ci", "docs", "test", "build", "refactor", "style"]);

/**
 * Files that alone never make a commit user-facing. Matched against the
 * commit's changed paths after pathspec filtering to the owning dirs, so a
 * README tweak inside an owned app directory is dropped while a commit that
 * also touches code is kept.
 */
const NOISE_FILE_RE = /(^|\/)(?:[^/]+\.md|pnpm-lock\.yaml|MODULE\.bazel\.lock)$/iu;

const NO_CHANGES_LINE = "_No user-facing changes in this release._";
const INITIAL_RELEASE_LINE = "_Initial release._";

export interface CommitEntry {
  sha: string;
  shortSha: string;
  authorName: string;
  /** The raw commit subject line. */
  subject: string;
  /** Conventional-commit type (lowercased), or null if the subject isn't conventional. */
  type: string | null;
  /** Conventional-commit scope, or null. */
  scope: string | null;
  /** True for `type!:` or a `BREAKING CHANGE` marker. */
  breaking: boolean;
  /**
   * Subject with the `type(scope):` prefix and any tracker references stripped
   * (falls back to `subject`). See stripReferences.
   */
  description: string;
  /** Changed paths within the owning dirs (already pathspec-filtered by git). */
  files: string[];
}

export interface ChangelogOptions {
  repository: string;
  headSha: string;
  /** Previous release tag the diff is taken against; null for the very first release. */
  prevTag: string | null;
}

export interface Changelog {
  /** User-facing markdown shared by GitHub, CrabNebula, and CHANGELOG.md stamping. */
  release: string;
  /** Truncated internal Slack variant (mrkdwn link syntax, authors, PR links). */
  slack: string;
}

/** One `## version` section of a stamped CHANGELOG.md, newest first. */
export interface ChangelogFileSection {
  version: string;
  /** True for the in-flight nightly section; stable history sections are false. */
  preview: boolean;
  /** ISO date (YYYY-MM-DD) of the release commit. */
  date: string;
  /** Pre-rendered user-facing body (see renderUserBody). */
  body: string;
}

const CONVENTIONAL_RE = /^(\w+)(?:\(([^)]+)\))?(!)?:\s+(.*)$/;

/** Squash-merge pull-request numbers, anywhere in the subject: `… (#568)`. */
const PULL_REQUEST_REF_RE = /\s*\(#\d+\)/gu;

/**
 * A tracker key: an uppercase team prefix and an issue number, `PE-2474`. The
 * lookahead spares standards tokens that share the shape — a subject may open
 * or close with `UTF-8` or `SHA-256`, and no team files issues under those.
 */
const TICKET_KEY = String.raw`(?!(?:UTF|SHA|AES|RSA|MD|CRC|ISO|RFC|IEEE)-)[A-Z][A-Z0-9]*-\d+`;

/** Leading keys: `PE-2463: …`, `[PE-2400] …`, `DOC-131 PE-2356 …`. */
const TICKET_PREFIX_RE = new RegExp(
  String.raw`^(?:(?:\[${TICKET_KEY}\]|${TICKET_KEY})\s*[:,-]?\s+)+`,
  "u",
);
/** A parenthesized aside holding nothing but keys: `… the app (PE-2474)`. */
const TICKET_ASIDE_RE = new RegExp(String.raw`\s*\(${TICKET_KEY}(?:\s*,\s*${TICKET_KEY})*\)`, "gu");
/** A trailing key: `Remove stale infra references PE-2255`. */
const TICKET_SUFFIX_RE = new RegExp(String.raw`\s+${TICKET_KEY}\s*$`, "u");

/**
 * Drop references that mean nothing to an end user: pull-request numbers and
 * Linear ticket keys. Both the repository and the tracker are private, so
 * `(#568)` and `PE-2474` are noise in user-facing copy (the Slack variant
 * keeps them — it reads `subject`, not `description`).
 *
 * Asides must fill their parentheses entirely, so prose like `(build/plan)` or
 * `(PE-2329 follow-up)` survives intact — leaving a stray key is better than
 * mangling a sentence. A stripped-to-empty subject keeps its original text
 * rather than rendering a bare bullet.
 */
function stripReferences(description: string): string {
  const stripped = description
    .replace(PULL_REQUEST_REF_RE, "")
    .replace(TICKET_PREFIX_RE, "")
    .replace(TICKET_ASIDE_RE, "")
    .replace(TICKET_SUFFIX_RE, "")
    .trim();
  return stripped || description;
}

function classify(
  subject: string,
): Pick<CommitEntry, "type" | "scope" | "breaking" | "description"> {
  const match = subject.match(CONVENTIONAL_RE);
  if (!match) {
    return {
      type: null,
      scope: null,
      breaking: /BREAKING[ -]CHANGE/.test(subject),
      description: stripReferences(subject),
    };
  }
  const [, type, scope, bang, description] = match;
  return {
    type: type.toLowerCase(),
    scope: scope ?? null,
    breaking: bang === "!" || /BREAKING[ -]CHANGE/.test(subject),
    description: stripReferences(description.trim() || subject),
  };
}

/**
 * Parse `git log` records produced with
 * `--pretty=format:%x1e%H%x1f%an%x1f%s --name-only` into structured commits.
 * Records are separated by \x1e; each record's first line is the header and
 * every following non-empty line is a changed path.
 */
export function parseGitLog(raw: string): CommitEntry[] {
  return raw
    .split("\x1e")
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [header = "", ...rest] = record.split(/\r?\n/u);
      const [sha = "", authorName, ...subjectParts] = header.split("\x1f");
      const subject = subjectParts.join("\x1f").trim() || sha.slice(0, 12);
      return {
        sha,
        shortSha: sha.slice(0, 12),
        authorName: authorName?.trim() || "Unknown author",
        subject,
        files: rest.map((line) => line.trim()).filter(Boolean),
        ...classify(subject),
      };
    });
}

/**
 * Drop commits that end users should never see: excluded conventional types
 * (chores, CI, docs, …) and commits whose owned-path changes are only
 * documentation or lockfiles.
 */
export function filterUserFacing(commits: CommitEntry[]): CommitEntry[] {
  return commits.filter((commit) => {
    if (commit.type && EXCLUDED_TYPES.has(commit.type)) return false;
    if (commit.files.length > 0 && commit.files.every((file) => NOISE_FILE_RE.test(file))) {
      return false;
    }
    return true;
  });
}

/**
 * Fixes vs Improvements. Conventional `fix:` is authoritative; otherwise the
 * subjects here are reliably verb-first, so a small verb list decides.
 */
const FIX_VERB_RE = /^(?:fix(?:es|ed)?|correct(?:s|ed)?|repair(?:s|ed)?|resolve(?:s|d)?)\b/iu;

function isFix(commit: CommitEntry): boolean {
  if (commit.type) return commit.type === "fix";
  return FIX_VERB_RE.test(commit.description);
}

function userBullet(commit: CommitEntry): string {
  const breaking = commit.breaking ? " **(breaking)**" : "";
  return `- ${commit.description}${breaking}`;
}

/**
 * Render the grouped user-facing body (`### Improvements` / `### Fixes`) for
 * one release range, without any version heading.
 */
export function renderUserBody(commits: CommitEntry[]): string {
  const userFacing = filterUserFacing(commits);
  if (userFacing.length === 0) {
    return NO_CHANGES_LINE;
  }
  const improvements = userFacing.filter((commit) => !isFix(commit));
  const fixes = userFacing.filter(isFix);
  const lines: string[] = [];
  if (improvements.length > 0) {
    lines.push("### Improvements", "", ...improvements.map(userBullet), "");
  }
  if (fixes.length > 0) {
    lines.push("### Fixes", "", ...fixes.map(userBullet), "");
  }
  return lines.join("\n").trim();
}

/**
 * Escape untrusted text for Slack mrkdwn. Only `&`, `<`, and `>` are special;
 * escaping them here lets the trusted `<url|label>` link syntax appended around
 * subjects pass through the notify action verbatim.
 */
function escapeSlackText(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function compareUrl(repository: string, prevTag: string, headSha: string): string {
  return `https://github.com/${repository}/compare/${prevTag}...${headSha}`;
}

function pullRequestDetails(
  repository: string,
  subject: string,
): { subject: string; link: string | null } {
  const match = subject.match(/\s+\(#(\d+)\)$/u);
  if (!match?.index) return { subject, link: null };
  const number = match[1];
  return {
    subject: subject.slice(0, match.index),
    link: `<https://github.com/${repository}/pull/${number}|#${number}>`,
  };
}

/** `desktop/v1.2.0` -> `1.2.0` for user-facing copy; unknown shapes pass through. */
function displayVersion(tag: string): string {
  const match = tag.match(/\/v((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/u);
  return match ? match[1] : tag;
}

/** Build the user-facing markdown + internal Slack changelog from parsed commits. */
export function groupCommits(commits: CommitEntry[], options: ChangelogOptions): Changelog {
  const { repository, prevTag, headSha } = options;

  if (!prevTag) {
    return {
      release: `${INITIAL_RELEASE_LINE}\n`,
      slack: "• Initial release",
    };
  }

  // --- User-facing markdown ---------------------------------------------------
  const release = [`## Changes since ${displayVersion(prevTag)}`, "", renderUserBody(commits)]
    .join("\n")
    .concat("\n");

  // --- Slack mrkdwn variant, internal: authors + PR links, flat + truncated ---
  const slackLines = commits.slice(-SLACK_CHANGELOG_COMMIT_LIMIT).map((commit) => {
    const pullRequest = pullRequestDetails(repository, commit.subject);
    const link = pullRequest.link ? ` (${pullRequest.link})` : "";
    return `• ${escapeSlackText(pullRequest.subject)}${link} — ${escapeSlackText(commit.authorName)}`;
  });
  const remaining = commits.length - slackLines.length;
  const prefix = remaining > 0 ? `…and ${remaining} more · ` : "";
  slackLines.push(`${prefix}<${compareUrl(repository, prevTag, headSha)}|Full diff>`);

  return { release, slack: slackLines.join("\n") };
}

/** Assemble a complete stamped CHANGELOG.md from per-release sections. */
export function renderChangelogFile(sections: ChangelogFileSection[]): string {
  const lines: string[] = ["# Changelog", ""];
  for (const section of sections) {
    const preview = section.preview ? " (Preview)" : "";
    lines.push(`## ${section.version}${preview} — ${section.date}`, "", section.body.trim(), "");
  }
  return lines.join("\n").trim() + "\n";
}

/**
 * Run `git log --first-parent <prevTag>..<headSha> -- <dirs>` with `--name-only`
 * and parse the result. When `prevTag` is null there is no meaningful range.
 */
export function collectCommits(params: {
  repoRoot: string;
  dirs: string[];
  prevTag: string | null;
  headSha: string;
}): CommitEntry[] {
  const { repoRoot, dirs, prevTag, headSha } = params;
  if (!prevTag) {
    return [];
  }
  const range = `${prevTag}..${headSha}`;
  const args = [
    "log",
    "--first-parent",
    "--reverse",
    "--max-count=200",
    "--pretty=format:%x1e%H%x1f%an%x1f%s",
    "--name-only",
    range,
  ];
  if (dirs.length > 0) {
    args.push("--", ...dirs);
  }
  const raw = execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  return parseGitLog(raw);
}

/** Convenience: collect + group in one call. */
export function generateChangelog(params: {
  repoRoot: string;
  dirs: string[];
  prevTag: string | null;
  headSha: string;
  repository: string;
}): Changelog {
  const commits = collectCommits(params);
  return groupCommits(commits, {
    repository: params.repository,
    prevTag: params.prevTag,
    headSha: params.headSha,
  });
}

/** Collect one release range and render just its user-facing body. */
export function collectUserBody(params: {
  repoRoot: string;
  dirs: string[];
  prevTag: string | null;
  headSha: string;
}): string {
  if (!params.prevTag) {
    return INITIAL_RELEASE_LINE;
  }
  return renderUserBody(collectCommits(params));
}
