'use client';

import { useEffect, useRef } from 'react';

export default function LegacyPage({ html, scripts = [] }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    for (const scriptSource of scripts) {
      const clone = document.createElement('script');
      for (const [name, value] of Object.entries(scriptSource.attrs || {})) {
        clone.setAttribute(name, value);
      }
      clone.text = scriptSource.code || '';
      root.appendChild(clone);
    }
  }, [html]);

  return <div ref={rootRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
