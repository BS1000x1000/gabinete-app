export function abrirEnlaceExterno(url: string | null | undefined, event: Event): void {
  event.stopPropagation();
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
