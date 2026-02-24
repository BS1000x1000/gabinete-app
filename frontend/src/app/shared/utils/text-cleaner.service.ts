import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextCleanerService {
  /**
   * Limpia el HTML no deseado y normaliza entidades como &nbsp;
   * @param html El string con HTML (ej: <p>Hola&nbsp;Mundo</p>)
   * @returns El texto plano limpio (ej: Hola Mundo)
   */
  sanitizeInput(html: string): string {
    if (!html) return '';

    // 1. Usamos DOMParser para analizar el HTML de forma segura
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 2. Función interna para navegar por todos los nodos sin destruir etiquetas
    const procesarNodos = (nodo: Node) => {
      // Si el nodo es de tipo TEXTO, limpiamos los espacios invisibles
      if (nodo.nodeType === Node.TEXT_NODE) {
        // \u00A0 es el carácter unicode para &nbsp;
        nodo.textContent = nodo.textContent?.replace(/\u00A0/g, ' ') || '';
      }

      // Recorremos los hijos para limpiar dentro de <strong>, <li>, etc.
      nodo.childNodes.forEach((hijo) => procesarNodos(hijo));
    };

    // 3. Ejecutamos la limpieza sobre el cuerpo del documento parseado
    procesarNodos(doc.body);

    // 4. Retornamos el HTML interno resultante con trim para limpiar bordes
    return doc.body.innerHTML.trim();
  }
}
