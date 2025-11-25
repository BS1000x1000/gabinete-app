import { Lesson } from "../../models/lesson.model";
import { thisWeekDay } from "../../utils/date";


export const MOCK_LESSONS: Lesson[] = [
  /* LUNES (day = 0) */
  { id: '1', title: 'T_PDG45_90[BPA] – Martín Alonso',   start: thisWeekDay(0, 8,  0), end: thisWeekDay(0, 8, 45) },
  { id: '2', title: 'PT_PDG60_120[BPA] – Sofía Benítez', start: thisWeekDay(0, 9,  0), end: thisWeekDay(0, 10, 0) },
  { id: '3', title: 'T_PDG45_90[BPA] – Valeria Ramírez', start: thisWeekDay(0, 15, 0), end: thisWeekDay(0, 15, 45) },

  /* MARTES (day = 1) */
  { id: '4', title: 'T_PDG45_90[BPA] – Julia Hernández', start: thisWeekDay(1, 9, 30), end: thisWeekDay(1, 10, 15) },

  /* MIÉRCOLES (day = 2) */
  { id: '5', title: 'PT_PDG45_90[BPA] – Leandro Díaz', start: thisWeekDay(2, 13, 0), end: thisWeekDay(2, 13, 45) },

  /* JUEVES (day = 3) */
  { id: '6', title: 'T_PDG45_90[BPA] – Lucía Paredes', start: thisWeekDay(3, 8, 30), end: thisWeekDay(3, 9, 15) },

  /* VIERNES (day = 4) */
  { id: '7', title: 'PT_PDG60_60[BPA] – Diego Quiroga', start: thisWeekDay(4, 17, 0), end: thisWeekDay(4, 18, 0) },
];