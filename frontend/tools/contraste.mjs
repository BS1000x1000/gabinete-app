#!/usr/bin/env node
/**
 * Verificador de contraste WCAG 2.1 de la paleta.
 *
 * Por que existe: la app pinta sobre papel calido (#f0ead8), no sobre blanco.
 * Un par de colores que cumple sobre blanco puede fallar sobre el papel, y al
 * reves. Cada vez que se toque `_variables.scss` o se anada una pastilla nueva,
 * este script dice si sigue siendo legible — sin abrir el navegador.
 *
 *   node tools/contraste.mjs          lista todo
 *   node tools/contraste.mjs --fallos solo lo que no cumple (salida != 0)
 *
 * Umbrales (WCAG 2.1 AA):
 *   texto normal  4.5:1   ·   texto grande (>=18.66px o >=14px bold)  3:1
 *   limite de un componente con significado (1.4.11)                  3:1
 *   relleno de pastilla contra su superficie: 1.5:1 es el minimo para
 *   percibirla; por debajo la pastilla "desaparece" aunque el texto se lea.
 */

const T = {
  papel: '#f0ead8', card: '#ffffff', tinta: '#1f2a24',
  primary: '#2d4a3e', primaryDark: '#1f2a24', primaryLight: '#d9e8da',
  secondary: '#3a5c74', secondaryDark: '#2b4557', secondaryLight: '#dde6ec',
  accent: '#8a6018', accentDark: '#6b4a12', accentLight: '#f5ecd8',
  success: '#2f6b43', successDark: '#245536', successLight: '#e4eee2',
  danger: '#96382e', dangerDark: '#7a2c24', dangerLight: '#f4e3dc',
  info: '#345c6b', infoDark: '#274854', infoLight: '#e2ecef',
  malva: '#6b5a8a', malvaDark: '#443859', malvaLight: '#e8e3ef',
  gray100: '#e5eadf', gray200: '#c2cdc3', gray400: '#798d82',
  gray500: '#556d62', gray600: '#2d4a3e', gray900: '#1f2a24',
  verdeRealce: '#7fb08a',
};

const canal = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
/** Composita un color con alfa sobre un fondo (asi mide de verdad una opacity). */
const sobre = (fg, alpha, bg) => {
  const p = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
  const [f, b] = [p(fg), p(bg)];
  return '#' + f.map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha))
    .toString(16).padStart(2, '0')).join('');
};

// [descripcion, primerPlano, fondo, umbral]
const PRUEBAS = [
  // — Texto de la app sobre el papel —
  ['texto principal sobre papel', T.gray900, T.papel, 4.5],
  ['texto normal sobre papel', T.gray600, T.papel, 4.5],
  ['texto secundario sobre papel', T.gray500, T.papel, 4.5],
  ['etiqueta de filtro sobre papel', T.gray500, T.papel, 4.5],

  // — Tinta de cada pastilla sobre su relleno —
  ['badge exito', T.successDark, T.successLight, 4.5],
  ['badge aviso', T.accentDark, T.accentLight, 4.5],
  ['badge peligro', T.dangerDark, T.dangerLight, 4.5],
  ['badge info', T.infoDark, T.infoLight, 4.5],
  ['badge acento', T.primaryDark, T.primaryLight, 4.5],
  ['badge malva', T.malvaDark, T.malvaLight, 4.5],
  ['badge neutro', T.gray500, T.gray100, 4.5],

  // — El borde debe hacer VISIBLE la pastilla sobre el papel (1.4.11) —
  ['borde badge exito vs papel', sobre(T.success, 0.35, T.papel), T.papel, 1.5],
  ['borde badge aviso vs papel', sobre(T.accent, 0.35, T.papel), T.papel, 1.5],
  ['borde badge peligro vs papel', sobre(T.danger, 0.35, T.papel), T.papel, 1.5],
  ['borde badge info vs papel', sobre(T.secondary, 0.35, T.papel), T.papel, 1.5],
  ['borde badge malva vs papel', sobre(T.malva, 0.35, T.papel), T.papel, 1.5],

  // — Login: papel/blanco sobre la tinta de marca —
  ['card sobre fondo de login', T.card, T.primary, 3],
  ['footer del login', sobre(T.papel, 0.72, T.gray900), T.gray900, 4.5],

  // — Colores categoricos como texto sobre papel —
  ['categoria informe medico', T.danger, T.papel, 4.5],
  ['categoria informe escolar', T.secondary, T.papel, 4.5],
  ['malva sobre papel', T.malva, T.papel, 4.5],

  // — Realce del item activo sobre el cromo oscuro (NO sobre papel) —
  ['realce activo sobre sidebar', T.verdeRealce, T.gray900, 3],
];

// $gray-400 es el gris de DESHABILITADO: no debe usarse como texto. Se deja
// aqui documentado para que quede claro por que no aparece arriba.
const PROHIBIDOS = [['gray-400 como texto sobre papel', T.gray400, T.papel, 4.5]];

const soloFallos = process.argv.includes('--fallos');
let fallos = 0;

console.log('\nContraste WCAG 2.1 AA — fondo de referencia: papel #f0ead8\n');
for (const [desc, fg, bg, min] of PRUEBAS) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fallos++;
  if (!ok || !soloFallos) {
    console.log(`  ${ok ? 'ok  ' : 'FALLA'} ${r.toFixed(2).padStart(6)} (min ${min})  ${desc}`);
  }
}

if (!soloFallos) {
  console.log('\nNo usar (documentado a proposito):');
  for (const [desc, fg, bg, min] of PROHIBIDOS) {
    console.log(`  ${ratio(fg, bg).toFixed(2).padStart(6)} < ${min}  ${desc}`);
  }
}

console.log(`\n${fallos === 0 ? 'Sin fallos.' : `${fallos} par(es) por debajo del umbral.`}\n`);
process.exit(fallos === 0 ? 0 : 1);
