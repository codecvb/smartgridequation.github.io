'use strict';

const { execFileSync } = require('child_process');

function cleanValue(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text || /^(untitled|无标题|unknown)$/i.test(text)) return '';
  return text;
}

function getPdfMetadata(filePath) {
  try {
    const output = execFileSync('pdfinfo', [filePath], {
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer: 1024 * 1024
    });
    const fields = {};
    for (const line of output.split(/\r?\n/)) {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (!match) continue;
      fields[match[1].trim().toLowerCase()] = match[2].trim();
    }
    return {
      title: cleanValue(fields.title),
      subject: cleanValue(fields.subject)
    };
  } catch (error) {
    return { title: '', subject: '' };
  }
}

module.exports = { getPdfMetadata };
