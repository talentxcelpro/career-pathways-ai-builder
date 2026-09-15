import React, { useEffect } from 'react';
import { applyTalentXcelLanguage } from '@/utils/talentxcelBrandLanguage';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'NOSCRIPT']);

function shouldSkipNode(node: Node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  return Boolean(parent.closest('[data-brand-language="off"]'));
}

function rewriteTextNode(node: Node) {
  if (shouldSkipNode(node)) return;
  const current = node.nodeValue;
  if (!current) return;

  const next = applyTalentXcelLanguage(current);
  if (next !== current) {
    node.nodeValue = next;
  }
}

function rewriteElementAttributes(element: Element) {
  ['aria-label', 'title', 'placeholder', 'alt'].forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) return;

    const next = applyTalentXcelLanguage(value);
    if (next !== value) {
      element.setAttribute(attribute, next);
    }
  });
}

function rewriteTree(root: ParentNode) {
  if (root instanceof Element) {
    rewriteElementAttributes(root);
  }

  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = textWalker.nextNode();
  while (node) {
    rewriteTextNode(node);
    node = textWalker.nextNode();
  }

  if ('querySelectorAll' in root) {
    root.querySelectorAll('[aria-label], [title], [placeholder], img[alt]').forEach(rewriteElementAttributes);
  }
}

export function BrandLanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let frame = 0;

    const rewriteDocument = () => {
      frame = 0;
      if (document.body) rewriteTree(document.body);
      document.title = applyTalentXcelLanguage(document.title);
    };

    const scheduleRewrite = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(rewriteDocument);
    };

    scheduleRewrite();

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData') {
          rewriteTextNode(record.target);
          continue;
        }

        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            rewriteTextNode(node);
          } else if (node instanceof Element) {
            rewriteTree(node);
          }
        });
      }

      scheduleRewrite();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label', 'title', 'placeholder', 'alt'],
    });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <>{children}</>;
}
