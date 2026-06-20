import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoSesion } from '@prisma/client';
import { ClientesService } from './clientes.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mkC = (o={}) => ({id:"c1",nombre:"Ana",apellidos:"Garcia",dni:"12A",activo:true,colegioId:null,deletedAt:null,...o});
const mkT = (o={}) => ({id:"t1",nombre:"Luis",apellidos:"Perez",...o});
const mkP = () => ({
  cliente:{findUnique:jest.fn(),findMany:jest.fn(),findFirst:jest.fn(),findUniqueOrThrow:jest.fn(),create:jest.fn(),update:jest.fn(),delete:jest.fn(),count:jest.fn()},
  colegio:{findUnique:jest.fn(),create:jest.fn(),update:jest.fn()},
  trabajador:{findUnique:jest.fn()},
  clienteTrabajador:{findFirst:jest.fn(),create:jest.fn(),delete:jest.fn()},
  clienteObjetivo:{findFirst:jest.fn(),findMany:jest.fn(),create:jest.fn(),update:jest.fn(),count:jest.fn()},
  objetivoGeneral:{findMany:jest.fn(),findUnique:jest.fn()},
  familiar:{findFirst:jest.fn(),create:jest.fn(),update:jest.fn(),delete:jest.fn()},
  sanitario:{findUnique:jest.fn(),create:jest.fn(),update:jest.fn()},
  sesion:{findMany:jest.fn()},registroDiario:{count:jest.fn()},
  registroDiarioObjetivo:{groupBy:jest.fn(),count:jest.fn(),findFirst:jest.fn()},
  disponibilidadClienteTrabajador:{deleteMany:jest.fn(),createMany:jest.fn()},
  $transaction:jest.fn(),
});

describe('ClientesService', () => {
  let svc, prisma;
  beforeEach(async () => {
    prisma = mkP();
    const m = await Test.createTestingModule({providers:[ClientesService,{provide:PrismaService,useValue:prisma}]}).compile();
    svc = m.get(ClientesService);
  });

  describe('create()', () => {
    const dto={nombre:'Ana',apellidos:'Garcia',dni:'12A',fechaNacimiento:'2015-01-01',fechaInicio:'2026-01-01'};
    it('DNI duplicado lanza ConflictException', async () => {
      prisma.cliente.findUnique.mockResolvedValue(mkC());
      await expect(svc.create(dto)).rejects.toThrow(ConflictException);
    });
    it('crea cliente si DNI libre', async () => {
      prisma.cliente.findUnique.mockResolvedValueOnce(null);
      prisma.cliente.create.mockResolvedValue(mkC());
      prisma.cliente.findUniqueOrThrow.mockResolvedValue(mkC());
      prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
      const r = await svc.create(dto);
      expect(prisma.cliente.create).toHaveBeenCalledTimes(1);
      expect(r).toMatchObject({id:'c1'});
    });
  });

  describe('existeDni()', () => {
    it('false si no existe', async()=>{ prisma.cliente.findUnique.mockResolvedValue(null); expect(await svc.existeDni('X')).toBe(false); });
    it('true si existe', async()=>{ prisma.cliente.findUnique.mockResolvedValue({id:'c1',deletedAt:null}); expect(await svc.existeDni('12A')).toBe(true); });
  });

  describe('asignarTrabajador()', () => {
    const h=[{diaSemana:1,horaInicio:'09:00',horaFin:'10:00'}];
    it('BadRequest sin tipoTerapia', async()=>{ await expect(svc.asignarTrabajador('c1','t1',undefined,h)).rejects.toThrow(BadRequestException); });
    it('NotFound cliente inexistente', async()=>{ prisma.cliente.findUnique.mockResolvedValue(null); await expect(svc.asignarTrabajador('cx','t1',TipoSesion.PEDAGOGIA,h)).rejects.toThrow(NotFoundException); });
    it('NotFound trabajador inexistente', async()=>{ prisma.cliente.findUnique.mockResolvedValue(mkC()); prisma.trabajador.findUnique.mockResolvedValue(null); await expect(svc.asignarTrabajador('c1','tx',TipoSesion.PEDAGOGIA,h)).rejects.toThrow(NotFoundException); });
    it('Conflict asignacion duplicada', async()=>{ prisma.cliente.findUnique.mockResolvedValue(mkC()); prisma.trabajador.findUnique.mockResolvedValue(mkT()); prisma.clienteTrabajador.findFirst.mockResolvedValue({id:'a1'}); await expect(svc.asignarTrabajador('c1','t1',TipoSesion.PEDAGOGIA,h)).rejects.toThrow(ConflictException); });
    it('crea asignacion valida', async()=>{
      prisma.cliente.findUnique.mockResolvedValue(mkC()); prisma.trabajador.findUnique.mockResolvedValue(mkT());
      prisma.clienteTrabajador.findFirst.mockResolvedValue(null);
      prisma.clienteTrabajador.create.mockResolvedValue({id:'a1',trabajador:mkT(),horarios:h});
      const r=await svc.asignarTrabajador('c1','t1',TipoSesion.PEDAGOGIA,h);
      expect(prisma.clienteTrabajador.create).toHaveBeenCalledTimes(1);
      expect(r.message).toContain('correctamente');
    });
  });

  describe('desasignarTrabajador()', () => {
    it('NotFound si no existe', async()=>{ prisma.clienteTrabajador.findFirst.mockResolvedValue(null); await expect(svc.desasignarTrabajador('c1','ax')).rejects.toThrow(NotFoundException); });
    it('elimina asignacion', async()=>{ prisma.clienteTrabajador.findFirst.mockResolvedValue({id:'a1',trabajador:{nombre:'L',apellidos:'P'}}); prisma.clienteTrabajador.delete.mockResolvedValue({}); const r=await svc.desasignarTrabajador('c1','a1'); expect(prisma.clienteTrabajador.delete).toHaveBeenCalledWith({where:{id:'a1'}}); expect(r.message).toContain('eliminada'); });
  });

  describe('asignarObjetivosGenerales()', () => {
    it('NotFound cliente', async()=>{ prisma.cliente.findUnique.mockResolvedValue(null); await expect(svc.asignarObjetivosGenerales('cx',['o1'])).rejects.toThrow(NotFoundException); });
    it('NotFound objetivo', async()=>{ prisma.cliente.findUnique.mockResolvedValue(mkC()); prisma.objetivoGeneral.findMany.mockResolvedValue([]); await expect(svc.asignarObjetivosGenerales('c1',['ox'])).rejects.toThrow(NotFoundException); });
    it('crea y reactiva en tx', async()=>{
      prisma.cliente.findUnique.mockResolvedValue(mkC());
      prisma.objetivoGeneral.findMany.mockResolvedValue([{id:'o1'},{id:'o2'}]);
      prisma.clienteObjetivo.findMany.mockResolvedValue([{id:'co1',objetivoGeneralId:'o1',activo:false}]);
      prisma.$transaction.mockImplementation(async(cb)=>{
        const tx={clienteObjetivo:{update:jest.fn().mockResolvedValue({}),create:jest.fn().mockResolvedValue({})}};
        return cb(tx);
      });
      const r=await svc.asignarObjetivosGenerales('c1',['o1','o2']);
      expect(r.reactivados).toBe(1); expect(r.nuevosAsignados).toBe(1); expect(r.total).toBe(2);
    });
  });

  describe('desasignarObjetivoGeneral()', () => {
    it('NotFound si no existe', async()=>{ prisma.clienteObjetivo.findFirst.mockResolvedValue(null); await expect(svc.desasignarObjetivoGeneral('c1','ox')).rejects.toThrow(NotFoundException); });
    it('soft delete activo=false', async()=>{ prisma.clienteObjetivo.findFirst.mockResolvedValue({id:'co1',activo:true}); prisma.clienteObjetivo.update.mockResolvedValue({}); const r=await svc.desasignarObjetivoGeneral('c1','o1'); expect(prisma.clienteObjetivo.update).toHaveBeenCalledWith(expect.objectContaining({where:{id:'co1'},data:{activo:false}})); expect(r.message).toContain('desasignado'); });
  });

  describe('crearFamiliar()', () => {
    it('NotFound cliente', async()=>{ prisma.cliente.findUnique.mockResolvedValue(null); await expect(svc.crearFamiliar('cx',{nombre:'M',parentesco:'m',telefono:'6'})).rejects.toThrow(NotFoundException); });
    it('crea familiar', async()=>{ prisma.cliente.findUnique.mockResolvedValue(mkC()); const f={id:'f1',nombre:'Madre'}; prisma.familiar.create.mockResolvedValue(f); expect(await svc.crearFamiliar('c1',{nombre:'M',apellidos:'G',parentesco:'m',telefono:'6'})).toEqual(f); });
  });

  describe('eliminarFamiliar()', () => {
    it('NotFound si no existe', async()=>{ prisma.familiar.findFirst.mockResolvedValue(null); await expect(svc.eliminarFamiliar('c1','fx')).rejects.toThrow(NotFoundException); });
    it('elimina familiar', async()=>{ prisma.familiar.findFirst.mockResolvedValue({id:'f1'}); prisma.familiar.delete.mockResolvedValue({}); const r=await svc.eliminarFamiliar('c1','f1'); expect(prisma.familiar.delete).toHaveBeenCalledWith({where:{id:'f1'}}); expect(r.message).toContain('eliminado'); });
  });

  describe('findAll()', () => {
    it('pagina resultados y devuelve total', async()=>{ prisma.cliente.findMany.mockResolvedValue([mkC(),mkC({id:'c2'})]); prisma.cliente.count.mockResolvedValue(25); const r=await svc.findAll(undefined,{page:2,limit:10}); expect(r.total).toBe(25); expect(r.page).toBe(2); expect(r.data).toHaveLength(2); });
  });
});
