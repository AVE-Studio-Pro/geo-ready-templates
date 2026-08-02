#!/usr/bin/env node
// Dependency-free sanity check for an llms.txt file.
//
// Usage:
//   node scripts/validate-llms-txt.mjs path/to/llms.txt
//   node scripts/validate-llms-txt.mjs https://example.com/llms.txt
//
// Exit code 0 = no errors, 1 = errors found, 2 = bad invocation.

import { readFile } from 'node:fs/promises';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/validate-llms-txt.mjs <path-or-url>');
  process.exit(2);
}

const source = target.startsWith('http')
  ? await fetch(target).then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + target);
      return res.text();
    })
  : await readFile(target, 'utf8');

const lines = source.split('\n');
const errors = [];
const warnings = [];

const titles = lines.filter((line) => /^#\s+\S/.test(line));
if (titles.length === 0) {
  errors.push('Missing H1 title ("# Brand Name") — this is the only required element.');
}
if (titles.length > 1) {
  errors.push('Found ' + titles.length + ' H1 headings; the format allows exactly one.');
}

const firstBody = lines.findIndex((line) => line.trim() !== '' && !/^#\s/.test(line));
if (firstBody === -1 || !lines[firstBody].trim().startsWith('>')) {
  warnings.push('No blockquote summary ("> ...") after the title. Assistants often quote that sentence verbatim.');
}

const sections = lines.filter((line) => /^##\s+\S/.test(line));
if (sections.length === 0) {
  warnings.push('No H2 sections. Group the links under headings such as Docs, Product, Company.');
}

const linkPattern = /^-\s*\[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?$/;
let links = 0;

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('- [')) return;
  const match = trimmed.match(linkPattern);
  if (!match) {
    errors.push('Line ' + (index + 1) + ': not a valid "- [name](url): description" entry.');
    return;
  }
  links += 1;
  const [, , url, description] = match;
  if (!url.startsWith('http')) {
    warnings.push('Line ' + (index + 1) + ': use an absolute URL instead of "' + url + '".');
  }
  if (!description || description.trim().length < 10) {
    warnings.push('Line ' + (index + 1) + ': add a short description after the link.');
  }
});

if (links === 0) {
  errors.push('No links found. An llms.txt without links gives an assistant nowhere to go.');
}
if (source.length > 50000) {
  warnings.push('Larger than 50 KB. Keep it to the essentials and move the rest behind links.');
}

for (const warning of warnings) console.log('warn   ' + warning);
for (const error of errors) console.log('error  ' + error);
console.log('');
console.log(links + ' links, ' + sections.length + ' sections, ' + errors.length + ' errors, ' + warnings.length + ' warnings.');

process.exit(errors.length > 0 ? 1 : 0);
