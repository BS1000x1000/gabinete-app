import { Injectable } from '@angular/core';
import DOMPurify, { type Config } from 'dompurify';

// Tags y atributos que genera StarterKit + Image de Tiptap — lista blanca fija
const TIPTAP_PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'img'],
  ALLOWED_ATTR: ['src', 'alt'],
};

@Injectable({
  providedIn: 'root',
})
export class TextCleanerService {
  sanitizeHtml(html: string): string {
    if (!html) return '';
    return DOMPurify.sanitize(html, TIPTAP_PURIFY_CONFIG) as string;
  }

  /**
   * Normaliza entidades HTML (&nbsp;, etc.) sin renderizar como HTML.
   * Usado para limpieza de inputs de formulario, no para [innerHTML].
   */
  sanitizeInput(html: string): string {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const procesarNodos = (nodo: Node) => {
      if (nodo.nodeType === Node.TEXT_NODE) {
        nodo.textContent = nodo.textContent?.replace(/\u00A0/g, ' ') || '';
      }
      nodo.childNodes.forEach((hijo) => procesarNodos(hijo));
    };
    procesarNodos(doc.body);
    return doc.body.innerHTML.trim();
  }
}
