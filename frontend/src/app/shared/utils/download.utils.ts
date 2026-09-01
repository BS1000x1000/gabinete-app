/**
 * Lanza la descarga de un blob en el navegador.
 *
 * El ancla se adjunta al documento y la URL de objeto se revoca en la siguiente
 * vuelta del bucle de eventos: antes se revocaba en la misma línea que el
 * `click()`, y con un blob grande —un zip de facturas de un trimestre— algunos
 * navegadores llegaban a cancelar la descarga a medias.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
