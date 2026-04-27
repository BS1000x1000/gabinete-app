"""
Generador de Informe Inicial/Seguimiento en PDF.
Uso: python3 generar_informe.py datos.json salida.pdf
"""
import sys
import json
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    KeepTogether, HRFlowable
)

# ─────────────────────────────────────────────────────────────────────────────
# PALETA DE LA APLICACIÓN
# ─────────────────────────────────────────────────────────────────────────────
LILA          = colors.HexColor('#7c6fd6')   # $primary
LILA_DARK     = colors.HexColor('#5a4fa8')   # $primary-dark
LILA_LIGHT    = colors.HexColor('#e8e4f8')   # $primary-light

AZUL_DARK     = colors.HexColor('#3d7bc4')   # $secondary-dark
AZUL_BEBE     = colors.HexColor('#adc9f6')   # $azul-bebe (pastel)
AZUL_LIGHT    = colors.HexColor('#d9ebfc')   # $secondary-light

GRIS_200      = colors.HexColor('#e5e7eb')
GRIS_500      = colors.HexColor('#6b7280')
GRIS_700      = colors.HexColor('#374151')
GRIS_900      = colors.HexColor('#111827')
BLANCO        = colors.white

# GAS: todos azul bebé, activo más oscuro
# Todos los niveles: azul bebé | activo: azul más oscuro
_AZUL_NORMAL = colors.HexColor('#d9ebfc')   # azul light uniforme
_AZUL_ACTIVO = colors.HexColor('#5a9de8')   # $secondary (más oscuro)

GAS_BG = {n: _AZUL_NORMAL for n in [-2, -1, 0, 1, 2]}
GAS_BG_ACTIVE = {n: _AZUL_ACTIVO for n in [-2, -1, 0, 1, 2]}
GAS_TEXT = {n: AZUL_DARK for n in [-2, -1, 0, 1, 2]}
GAS_LABEL_TEXT = {
    -2: 'Desde donde\npartimos',
    -1: 'Parcialmente\nalcanzado',
     0: 'Conseguido\n(lo esperado)',
     1: 'Un poco más\nde lo esperado',
     2: 'Mucho más\nde lo esperado',
}

W = A4[0] - 3*cm


def estilos():
    return {
        'titulo_doc': ParagraphStyle(
            'titulo_doc', fontName='Helvetica-Bold', fontSize=16,
            leading=20, textColor=LILA, alignment=TA_CENTER),
        'subtitulo': ParagraphStyle(
            'subtitulo', fontName='Helvetica', fontSize=10,
            leading=14, textColor=LILA_DARK, alignment=TA_CENTER),
        'seccion': ParagraphStyle(
            'seccion', fontName='Helvetica-Bold', fontSize=10,
            leading=13, textColor=BLANCO),
        'cuerpo': ParagraphStyle(
            'cuerpo', fontName='Helvetica', fontSize=9,
            leading=14, textColor=GRIS_700,
            alignment=TA_JUSTIFY, spaceAfter=4),
        'pie': ParagraphStyle(
            'pie', fontName='Helvetica', fontSize=7.5,
            leading=10, textColor=GRIS_500, alignment=TA_CENTER),
        'celda_label': ParagraphStyle(
            'celda_label', fontName='Helvetica-Bold', fontSize=8.5,
            leading=12, textColor=LILA_DARK),
        'celda_valor': ParagraphStyle(
            'celda_valor', fontName='Helvetica', fontSize=9,
            leading=12, textColor=GRIS_900),
        'obj_label': ParagraphStyle(
            'obj_label', fontName='Helvetica-Bold', fontSize=8,
            leading=11, textColor=AZUL_DARK),
        'obj_valor': ParagraphStyle(
            'obj_valor', fontName='Helvetica', fontSize=9,
            leading=13, textColor=GRIS_900),
    }


def seccion_header(numero, titulo, st):
    t = Table([[Paragraph(f'{numero}.  {titulo}', st['seccion'])]], colWidths=[W])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, -1), LILA),
        ('TOPPADDING',    (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING',   (0, 0), (-1, -1), 10),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 10),
    ]))
    return t


def tabla_gas(niveles_data, nivel_actual, st):
    niveles_map = {int(n['nivel']): n['descripcion'] for n in niveles_data}
    niveles = [-2, -1, 0, 1, 2]
    col_w = W / 5

    fila_etiq, fila_sub, fila_desc = [], [], []

    for n in niveles:
        es_activo = n == nivel_actual
        indicador = ' ▲' if es_activo else ''
        color_txt = BLANCO if es_activo else GAS_TEXT[n]

        fila_etiq.append(Paragraph(
            f'<b>Nivel {n:+d}{indicador}</b>',
            ParagraphStyle('ge', fontName='Helvetica-Bold', fontSize=8,
                           leading=10, alignment=TA_CENTER, textColor=color_txt)
        ))
        fila_sub.append(Paragraph(
            GAS_LABEL_TEXT[n],
            ParagraphStyle('gs', fontName='Helvetica', fontSize=7.5,
                           leading=10, alignment=TA_CENTER, textColor=color_txt)
        ))
        fila_desc.append(Paragraph(
            niveles_map.get(n, '—'),
            ParagraphStyle('gd', fontName='Helvetica', fontSize=8,
                           leading=11, alignment=TA_CENTER,
                           textColor=BLANCO if es_activo else GRIS_700)
        ))

    t = Table([fila_etiq, fila_sub, fila_desc], colWidths=[col_w] * 5)

    style_cmds = [
        ('GRID',          (0, 0), (-1, -1), 0.5, GRIS_200),
        ('TOPPADDING',    (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING',   (0, 0), (-1, -1), 4),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 4),
        ('VALIGN',        (0, 0), (-1, -1), 'TOP'),
    ]
    for i, n in enumerate(niveles):
        bg = GAS_BG_ACTIVE[n] if n == nivel_actual else GAS_BG[n]
        style_cmds.append(('BACKGROUND', (i, 0), (i, 2), bg))

    t.setStyle(TableStyle(style_cmds))
    return t


def ficha_objetivo(num, area, subarea, necesidad, objetivo_texto, st):
    lbl_w = 3.8 * cm
    val_w = W - lbl_w

    def fila(label, valor):
        return [Paragraph(label, st['obj_label']),
                Paragraph(valor or '—', st['obj_valor'])]

    data = [
        [Paragraph('Objetivo número', st['obj_label']),
         Paragraph(str(num), ParagraphStyle('on', fontName='Helvetica-Bold',
                                             fontSize=10, textColor=LILA))],
        fila('Área de desarrollo', area),
        fila('Subárea',            subarea or ''),
        fila('Necesidad',          necesidad or ''),
        fila('Objetivo',           objetivo_texto or ''),
    ]

    t = Table(data, colWidths=[lbl_w, val_w])
    t.setStyle(TableStyle([
        ('GRID',          (0, 0), (-1, -1), 0.5, GRIS_200),
        # Fila cabecera: lila light
        ('BACKGROUND',    (0, 0), (-1,  0), LILA_LIGHT),
        # Col labels (filas 1+): azul bebé
        ('BACKGROUND',    (0, 1), (0,  -1), AZUL_BEBE),
        # Col valores (filas 1+): blanco
        ('BACKGROUND',    (1, 1), (1,  -1), BLANCO),
        ('TOPPADDING',    (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING',   (0, 0), (-1, -1), 7),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 7),
        ('VALIGN',        (0, 0), (-1, -1), 'TOP'),
    ]))
    return t


def generar_pdf(datos: dict, ruta_salida: str):
    st = estilos()
    doc = SimpleDocTemplate(
        ruta_salida, pagesize=A4,
        leftMargin=1.5*cm, rightMargin=1.5*cm,
        topMargin=2*cm,    bottomMargin=2*cm,
        title=datos.get('titulo', 'Informe'),
        author=datos.get('elaborado_por', ''),
    )

    story = []
    add = story.append

    # Cabecera
    add(Paragraph('GABINETE PEDAGÓGICO', st['titulo_doc']))
    add(Spacer(1, 0.2*cm))
    tipo_texto = ('INFORME PEDAGÓGICO INICIAL'
                  if datos.get('tipo') == 'INICIAL'
                  else 'INFORME DE SEGUIMIENTO')
    add(Paragraph(tipo_texto, st['subtitulo']))
    add(HRFlowable(width=W, thickness=2, color=LILA, spaceAfter=10))

    # Tabla datos alumno (labels lila light | valores blanco)
    alumno = datos.get('alumno', {})

    def p_lbl(txt): return Paragraph(f'<b>{txt}</b>', st['celda_label'])
    def p_val(txt): return Paragraph(txt or '', st['celda_valor'])

    filas_alumno = [
        [p_lbl('Nombre:'),              p_val(alumno.get('nombre', '')),
         p_lbl(''),                     p_val('')],
        [p_lbl('Fecha de nacimiento:'), p_val(alumno.get('fecha_nacimiento', '')),
         p_lbl('Edad:'),                p_val(alumno.get('edad', ''))],
        [p_lbl('Etapa educativa:'),     p_val(alumno.get('curso', '')),
         p_lbl(''),                     p_val('')],
        [p_lbl('Fecha elaboración:'),   p_val(datos.get('fecha_elaboracion', '')),
         p_lbl(''),                     p_val('')],
        [p_lbl('Elaborado por:'),       p_val(datos.get('elaborado_por', '')),
         p_lbl('N.º colegiada:'),       p_val(datos.get('num_colegiada', ''))],
    ]

    t_alumno = Table(filas_alumno, colWidths=[3.8*cm, 5.2*cm, 3.2*cm, 5.0*cm])
    t_alumno.setStyle(TableStyle([
        ('GRID',          (0, 0), (-1, -1), 0.5, GRIS_200),
        # Columnas label (0 y 2): lila light
        ('BACKGROUND',    (0, 0), (0, -1), LILA_LIGHT),
        ('BACKGROUND',    (2, 0), (2, -1), LILA_LIGHT),
        # Columnas valor (1 y 3): blanco
        ('BACKGROUND',    (1, 0), (1, -1), BLANCO),
        ('BACKGROUND',    (3, 0), (3, -1), BLANCO),
        ('TOPPADDING',    (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING',   (0, 0), (-1, -1), 8),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 8),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    add(t_alumno)
    add(Spacer(1, 0.5*cm))

    nombre_pila = alumno.get('nombre_pila', 'el alumno/a')

    # Secciones 1–4
    secciones_texto = [
        (1, 'MOTIVO DE CONSULTA', None, datos.get('motivoConsulta', '')),
        (2, 'ANÁLISIS DE INFORMACIÓN APORTADA',
         f'En este apartado se recoge la información relevante aportada por la familia, '
         f'junto con los datos procedentes del ámbito escolar y médico y, en su caso, '
         f'los resultados de las evaluaciones realizadas, con el objetivo de obtener una '
         f'visión global de la situación de <b>{nombre_pila}</b>.',
         datos.get('analisisInformacion', '')),
        (3, 'EVALUACIÓN INICIAL',
         f'En este apartado se recogen los datos obtenidos a través de la observación '
         f'directa, la aplicación de pruebas específicas y actividades evaluativas, con el '
         f'objetivo de identificar las capacidades, dificultades y necesidades de '
         f'<b>{nombre_pila}</b>.',
         datos.get('evaluacionInicial', '')),
        (4, 'OBJETIVOS GENERALES',
         f'Tras analizar toda la información, se consideran los siguientes objetivos '
         f'generales para trabajar con <b>{nombre_pila}</b>, orientados a mejorar sus '
         f'habilidades y apoyar sus áreas de dificultad:',
         datos.get('objetivosGeneralesTexto', '')),
    ]

    for num, titulo, intro, contenido in secciones_texto:
        add(seccion_header(num, titulo, st))
        add(Spacer(1, 0.25*cm))
        if intro:
            add(Paragraph(intro, st['cuerpo']))
            add(Spacer(1, 0.15*cm))
        add(Paragraph(contenido or '<i>Sin contenido.</i>', st['cuerpo']))
        add(Spacer(1, 0.45*cm))

    # Sección 5: GAS
    add(seccion_header(5, 'OBJETIVOS ESPECÍFICOS', st))
    add(Spacer(1, 0.25*cm))
    add(Paragraph(
        f'En este apartado se describe el enfoque utilizado para definir y organizar los '
        f'objetivos de intervención, basado en la metodología <b>Goal Attainment Scaling (GAS)</b> '
        f'y en el trabajo coordinado con la familia. Este procedimiento permite establecer '
        f'objetivos ajustados a las características y necesidades de <b>{nombre_pila}</b>, '
        f'con carácter funcional, que orientan la intervención pedagógica.',
        st['cuerpo']
    ))
    add(Spacer(1, 0.15*cm))
    add(Paragraph(
        'Además, facilita evaluar el progreso de forma sistemática mediante cinco niveles '
        'de desempeño que combinan criterios cualitativos y cuantitativos, donde el nivel -2 '
        'corresponde a la situación inicial y el nivel 0 al logro esperado durante el curso.',
        st['cuerpo']
    ))
    add(Spacer(1, 0.3*cm))

    niveles_resumen = [{'nivel': n, 'descripcion': GAS_LABEL_TEXT[n].replace('\n', ' ')}
                       for n in [-2, -1, 0, 1, 2]]
    add(tabla_gas(niveles_resumen, None, st))
    add(Spacer(1, 0.3*cm))
    add(Paragraph(
        f'A continuación se detallan los objetivos planteados para acompañar el proceso '
        f'de intervención de <b>{nombre_pila}</b>.',
        st['cuerpo']
    ))
    add(Spacer(1, 0.3*cm))

    for i, obj in enumerate(datos.get('snapshot', []), 1):
        niveles = obj.get('niveles', [])
        bloque = [
            ficha_objetivo(i, obj.get('area', ''), obj.get('subarea', ''),
                           obj.get('necesidad', ''), obj.get('objetivo', ''), st),
            Spacer(1, 0.2*cm),
        ]
        if len(niveles) == 5:
            bloque.append(tabla_gas(niveles, obj.get('nivelActual'), st))
        else:
            bloque.append(Paragraph(
                '<i>Tabla GAS no definida para este objetivo.</i>',
                ParagraphStyle('it', fontName='Helvetica-Oblique', fontSize=8,
                               textColor=GRIS_500)
            ))
        bloque.append(Spacer(1, 0.5*cm))
        add(KeepTogether(bloque))

    # Pie
    add(HRFlowable(width=W, thickness=1, color=AZUL_BEBE, spaceBefore=10))
    add(Spacer(1, 0.2*cm))
    add(Paragraph(
        f'Informe elaborado por {datos.get("elaborado_por", "")} · '
        f'N.º colegiada: {datos.get("num_colegiada", "")} · '
        f'Documento confidencial',
        st['pie']
    ))

    doc.build(story)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Uso: python3 generar_informe.py datos.json salida.pdf')
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        datos = json.load(f)
    generar_pdf(datos, sys.argv[2])