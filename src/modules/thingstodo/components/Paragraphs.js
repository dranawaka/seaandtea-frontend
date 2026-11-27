import React from 'react';

export function Paragraphs({ text }) {
  const blocks = String(text || '').split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-4 text-base leading-relaxed text-gray-900">
      {blocks.map((block) => (
        <p key={block.slice(0, 48)}>{block}</p>
      ))}
    </div>
  );
}

export default Paragraphs;
