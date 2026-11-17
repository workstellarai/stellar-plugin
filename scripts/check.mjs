#!/usr/bin/env node
// Local pre-submission check. It is not Cursor's validator: run
// `node scripts/validate-template.mjs` from github.com/cursor/plugin-template as well.
// Checks: every JSON file parses, the manifest name is kebab-case, component paths are
// relative with no "..", the logo exists, every ${VAR} in mcp.json is declared, and every
// skill and rule has the frontmatter it needs.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (m) => errors.push(m);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === ".git" || e === "node_modules") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(root);
for (const f of files.filter((f) => f.endsWith(".json"))) {
  try { JSON.parse(readFileSync(f, "utf8")); } catch (e) { fail(`${f}: ${e.message}`); }
}

const manifest = JSON.parse(readFileSync(join(root, ".cursor-plugin/plugin.json"), "utf8"));
if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(manifest.name ?? "")) fail("plugin.json: name must be lowercase kebab-case");
for (const k of ["description", "version", "author", "license", "keywords"]) if (!manifest[k]) fail(`plugin.json: ${k} is missing`);
for (const k of ["logo", "mcpServers", "skills", "rules", "agents", "commands", "hooks"]) {
  const v = manifest[k];
  if (typeof v !== "string" || /^https?:\/\//.test(v)) continue;
  if (v.startsWith("/") || v.split("/").includes("..")) fail(`plugin.json: ${k} must be a relative path without ..`);
  else if (!existsSync(join(root, v))) fail(`plugin.json: ${k} points at ${v}, which does not exist`);
}

const mcpText = readFileSync(join(root, "mcp.json"), "utf8");
const declared = new Set(Object.keys(manifest.variables ?? {}));
for (const m of mcpText.matchAll(/\$\{([A-Za-z0-9_]+)\}/g)) if (!declared.has(m[1])) fail(`mcp.json: \${${m[1]}} is not declared under variables`);

function frontmatter(path) {
  const m = readFileSync(path, "utf8").match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  return Object.fromEntries(m[1].split("\n").filter((l) => l.includes(":")).map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]));
}
for (const f of files.filter((f) => f.endsWith("SKILL.md"))) {
  const fm = frontmatter(f);
  const dirName = f.split("/").at(-2);
  if (!fm?.name || !fm?.description) fail(`${f}: needs name and description frontmatter`);
  else if (fm.name !== dirName) fail(`${f}: name "${fm.name}" should match its folder "${dirName}"`);
}
for (const f of files.filter((f) => f.endsWith(".mdc"))) {
  const fm = frontmatter(f);
  if (!fm?.description || !("alwaysApply" in fm)) fail(`${f}: needs description and alwaysApply frontmatter`);
}

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`ok: ${files.length} files checked`);
