import { TurnoAgenda } from "../../models/turno.model";

export const MOCK_TURNOS: TurnoAgenda[] = [
  {
    id: 1,
    hora: '08:00',
    estado: 'A',
    tratamiento: 'T_PDG45_90[BPA]',
    cliente: { id: 101, nombre: 'Martín', apellido: 'Alonso' },
    asistio: null
  },
  {
    id: 2,
    hora: '08:45',
    estado: 'AR',
    tratamiento: 'T_PDG60_120[BPA]',
    cliente: { id: 102, nombre: 'Sofía', apellido: 'Benítez' },
    asistio: true
  },
  {
    id: 3,
    hora: '09:30',
    estado: 'A',
    tratamiento: 'PT_PDG45_90[BPA]',
    cliente: { id: 103, nombre: 'Valeria', apellido: 'Ramírez' },
    asistio: false
  },
  {
    id: 4,
    hora: '10:15',
    estado: 'AR',
    tratamiento: 'T_PDG60_60[BPA]',
    cliente: { id: 104, nombre: 'Ismael', apellido: 'Echeverría' },
    asistio: null
  },
  {
    id: 5,
    hora: '11:00',
    estado: 'A',
    tratamiento: 'T_PDG45_90[BPA]',
    cliente: { id: 105, nombre: 'Julia', apellido: 'Hernández' },
    asistio: true
  },
  {
    id: 6,
    hora: '11:45',
    estado: 'AR',
    tratamiento: 'PT_PDG60_120[BPA]',
    cliente: { id: 106, nombre: 'Hugo', apellido: 'Molina' },
    asistio: null
  },
//   {
//     id: 7,
//     hora: '13:00',
//     estado: 'A',
//     tratamiento: 'T_PDG45_90[BPA]',
//     cliente: { id: 107, nombre: 'Leandro', apellido: 'Díaz' },
//     asistio: false
//   },
//   {
//     id: 8,
//     hora: '13:45',
//     estado: 'AR',
//     tratamiento: 'T_PDG60_60[BPA]',
//     cliente: { id: 108, nombre: 'Carla', apellido: 'Giménez' },
//     asistio: true
//   },
//   {
//     id: 9,
//     hora: '15:00',
//     estado: 'A',
//     tratamiento: 'PT_PDG45_90[BPA]',
//     cliente: { id: 109, nombre: 'Lucía', apellido: 'Paredes' },
//     asistio: null
//   },
//   {
//     id: 10,
//     hora: '15:45',
//     estado: 'AR',
//     tratamiento: 'T_PDG60_120[BPA]',
//     cliente: { id: 110, nombre: 'Tomás', apellido: 'Suárez' },
//     asistio: true
//   },
//   {
//     id: 11,
//     hora: '16:30',
//     estado: 'A',
//     tratamiento: 'T_PDG45_90[BPA]',
//     cliente: { id: 111, nombre: 'Andrea', apellido: 'Flores' },
//     asistio: false
//   },
//   {
//     id: 12,
//     hora: '17:30',
//     estado: 'AR',
//     tratamiento: 'PT_PDG60_60[BPA]',
//     cliente: { id: 112, nombre: 'Diego', apellido: 'Quiroga' },
//     asistio: null
//   }
];