import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FichajeService } from './fichaje.service';
import { PrismaService } from '../prisma/prisma.service';

const mkPrisma = () => ({
  cliente:{findUnique:jest.fn()},
  objetivoGeneral:{findMany:jest.fn()},
  sesion:{findUnique:jest.fn(),update:jest.fn()},
  registroDiario:{findUnique:jest.fn(),findMany:jest.fn(),create:jest.fn(),update:jest.fn(),delete:jest.fn()},
  registroDiarioObjetivo:{deleteMany:jest.fn()},
});

describe('FichajeService', () => {
  let svc, prisma;
  beforeEach(async () => {
    prisma = mkPrisma();
    const m = await Test.createTestingModule({providers:[FichajeService,{provide:PrismaService,useValue:prisma}]}).compile();
    svc = m.get(FichajeService);
  });

  describe('create()', () => {
    const dto = {clienteId:'c1',contenido:'Sesion bien'};
    it('NotFound si cliente no existe', async()=>{ prisma.cliente.findUnique.mockResolvedValue(null); await expect(svc.create(dto,'t1')).rejects.toThrow(NotFoundException); });
    it('BadRequest si objetivo no existe', async()=>{
      prisma.cliente.findUnique.mockResolvedValue({id:"c1"});
      prisma.objetivoGeneral.findMany.mockResolvedValue([]);
      const dtoConObj={...dto,objetivosGeneralesTrabajados:[{objetivoGeneralId:'obj-inexistente'}]};
      await expect(svc.create(dtoConObj,'t1')).rejects.toThrow(BadRequestException);
    });
    it('crea registro con objetivos y notas', async()=>{
      prisma.cliente.findUnique.mockResolvedValue({id:'c1'});
      prisma.objetivoGeneral.findMany.mockResolvedValue([{id:'obj1',titulo:'Atención'}]);
      const registro={id:'rd1',contenido:'Sesion bien',clienteId:'c1',trabajadorId:'t1'};
      prisma.registroDiario.create.mockResolvedValue(registro);
      const dtoConNotas={...dto,objetivosGeneralesTrabajados:[{objetivoGeneralId:'obj1',notasRegistro:'Hoja de distractores'}]};
      const r = await svc.create(dtoConNotas,'t1');
      expect(r.id).toBe('rd1');
      const createCall = prisma.registroDiario.create.mock.calls[0][0];
      expect(createCall.data.objetivosGeneralesTrabajados.create[0].notasRegistro).toBe('Hoja de distractores');
    });
    it('crea registro diario correctamente', async()=>{
      prisma.cliente.findUnique.mockResolvedValue({id:"c1"});
      const registro={id:'rd1',contenido:'Sesion bien',clienteId:'c1',trabajadorId:'t1'};
      prisma.registroDiario.create.mockResolvedValue(registro);
      const r = await svc.create(dto,'t1');
      expect(prisma.registroDiario.create).toHaveBeenCalledTimes(1);
      expect(r.id).toBe("rd1");
    });
  });

  describe('update()', () => {
    it('NotFound si registro no existe', async()=>{ prisma.registroDiario.findUnique.mockResolvedValue(null); await expect(svc.update('rx','contenido')).rejects.toThrow(NotFoundException); });
    it('BadRequest si objetivo no existe en update', async()=>{
      prisma.registroDiario.findUnique.mockResolvedValue({id:'rd1'});
      prisma.objetivoGeneral.findMany.mockResolvedValue([]);
      await expect(svc.update('rd1','contenido',[{objetivoGeneralId:'obj-x'}])).rejects.toThrow(BadRequestException);
    });
    it('actualiza contenido', async()=>{
      prisma.registroDiario.findUnique.mockResolvedValue({id:'rd1'});
      const actualizado={id:'rd1',contenido:'nuevo'};
      prisma.registroDiario.update.mockResolvedValue(actualizado);
      const r = await svc.update('rd1','nuevo');
      expect(r.id).toBe("rd1");
    });
  });

  describe('findByCliente()', () => {
    it('NotFound si cliente no existe', async()=>{ prisma.cliente.findUnique.mockResolvedValue(null); await expect(svc.findByCliente('cx')).rejects.toThrow(NotFoundException); });
    it('devuelve registros del cliente', async()=>{
      prisma.cliente.findUnique.mockResolvedValue({id:'c1'});
      const registros=[{id:'rd1'},{id:'rd2'}];
      prisma.registroDiario.findMany.mockResolvedValue(registros);
      const r = await svc.findByCliente('c1');
      expect(r).toHaveLength(2);
    });
  });

  describe('findOne()', () => {
    it('NotFound si registro no existe', async()=>{ prisma.registroDiario.findUnique.mockResolvedValue(null); await expect(svc.findOne('rx')).rejects.toThrow(NotFoundException); });
    it('devuelve registro por ID', async()=>{
      const rd={id:'rd1',contenido:'Test'};
      prisma.registroDiario.findUnique.mockResolvedValue(rd);
      const r = await svc.findOne('rd1');
      expect(r.id).toBe("rd1");
    });
  });

  describe('remove()', () => {
    it('NotFound si registro no existe', async()=>{ prisma.registroDiario.findUnique.mockResolvedValue(null); await expect(svc.remove('rx')).rejects.toThrow(NotFoundException); });
    it('elimina el registro', async()=>{
      prisma.registroDiario.findUnique.mockResolvedValue({id:'rd1'});
      prisma.registroDiario.delete.mockResolvedValue({});
      await svc.remove('rd1');
      expect(prisma.registroDiario.delete).toHaveBeenCalledWith({where:{id:"rd1"}});
    });
  });
});
