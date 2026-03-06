import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoSesion } from '@prisma/client';
import { TrabajadorService } from './trabajador.service';
import { PrismaService } from '../prisma/prisma.service';

const mkW = (o={}) => ({id:"w1",username:"u1",passwordHash:"hash",nombre:"Luis",apellidos:"Perez",email:"l@g.es",activo:true,rolId:"r1",...o});
const mkPrisma = () => ({
  trabajador:{findUnique:jest.fn(),findMany:jest.fn(),findFirst:jest.fn(),create:jest.fn(),update:jest.fn(),delete:jest.fn()},
  rol:{findUnique:jest.fn()},
  cliente:{findUnique:jest.fn()},
  clienteTrabajador:{findFirst:jest.fn(),create:jest.fn(),delete:jest.fn()},
  $transaction:jest.fn(),
});

describe('TrabajadorService', () => {
  let svc, prisma;
  beforeEach(async () => {
    prisma = mkPrisma();
    const m = await Test.createTestingModule({providers:[TrabajadorService,{provide:PrismaService,useValue:prisma}]}).compile();
    svc = m.get(TrabajadorService);
  });

  describe('create()', () => {
    const dto={username:'u1',password:'pass',nombre:'Luis',apellidos:'Perez',email:'l@g.es',rolId:'r1'};
    it('NotFound si rol no existe', async()=>{ prisma.rol.findUnique.mockResolvedValue(null); await expect(svc.create(dto)).rejects.toThrow(NotFoundException); });
    it('Conflict si username duplicado', async()=>{ prisma.rol.findUnique.mockResolvedValue({id:'r1'}); prisma.trabajador.findFirst.mockResolvedValue(mkW()); await expect(svc.create(dto)).rejects.toThrow(ConflictException); });
    it('crea sin passwordHash en respuesta', async()=>{
      prisma.rol.findUnique.mockResolvedValue({id:'r1'});
      prisma.trabajador.findFirst.mockResolvedValue(null);
      prisma.trabajador.create.mockResolvedValue({...mkW(),rol:{id:'r1',nombreRol:'Admin',codigo:'ADMIN'}});
      const r = await svc.create(dto);
      expect(r).not.toHaveProperty("passwordHash");
      expect(r.username).toBe("u1");
    });
  });

  describe('findOne()', () => {
    it('NotFound si no existe', async()=>{ prisma.trabajador.findUnique.mockResolvedValue(null); await expect(svc.findOne('wx')).rejects.toThrow(NotFoundException); });
    it('devuelve trabajador sin passwordHash', async()=>{
      prisma.trabajador.findUnique.mockResolvedValue({...mkW(),rol:{id:'r1',nombreRol:'Admin',codigo:'ADMIN'}});
      const r = await svc.findOne('w1');
      expect(r).not.toHaveProperty("passwordHash");
      expect(r.id).toBe("w1");
    });
  });

  describe('remove()', () => {
    it('NotFound si no existe', async()=>{ prisma.trabajador.findUnique.mockResolvedValue(null); await expect(svc.remove('wx')).rejects.toThrow(NotFoundException); });
    it('soft delete activo=false', async()=>{
      prisma.trabajador.findUnique.mockResolvedValue(mkW());
      prisma.trabajador.update.mockResolvedValue({...mkW(),activo:false});
      const r = await svc.remove('w1');
      expect(prisma.trabajador.update).toHaveBeenCalledWith(expect.objectContaining({data:{activo:false}}));
      expect(r.message).toContain("desactivado");
    });
  });

  describe('cambiarPassword()', () => {
    it('NotFound si no existe', async()=>{ prisma.trabajador.findUnique.mockResolvedValue(null); await expect(svc.cambiarPassword('wx','old','new')).rejects.toThrow(NotFoundException); });
    it('BadRequest si password incorrecta', async()=>{
      prisma.trabajador.findUnique.mockResolvedValue(mkW({passwordHash:"hash"}));
      await expect(svc.cambiarPassword('w1','incorrecta','nueva')).rejects.toThrow(BadRequestException);
    });
    it('actualiza hash si password correcta', async()=>{
      const bcrypt = require("bcrypt");
      const hash = await bcrypt.hash("correcta", 10);
      prisma.trabajador.findUnique.mockResolvedValue(mkW({passwordHash:hash}));
      prisma.trabajador.update.mockResolvedValue(mkW());
      const r = await svc.cambiarPassword('w1','correcta','nueva');
      expect(prisma.trabajador.update).toHaveBeenCalledTimes(1);
      expect(r.message).toContain("actualizada");
    });
  });

  describe('asignarCliente()', () => {
    it('BadRequest sin tipoTerapia', async()=>{ await expect(svc.asignarCliente('w1','c1',undefined)).rejects.toThrow(BadRequestException); });
    it('NotFound si trabajador no existe', async()=>{ prisma.trabajador.findUnique.mockResolvedValue(null); prisma.cliente.findUnique.mockResolvedValue({id:'c1'}); await expect(svc.asignarCliente('wx','c1',TipoSesion.PEDAGOGIA)).rejects.toThrow(NotFoundException); });
    it('NotFound si cliente no existe', async()=>{ prisma.trabajador.findUnique.mockResolvedValue(mkW()); prisma.cliente.findUnique.mockResolvedValue(null); await expect(svc.asignarCliente('w1','cx',TipoSesion.PEDAGOGIA)).rejects.toThrow(NotFoundException); });
    it('Conflict si ya asignado', async()=>{
      prisma.trabajador.findUnique.mockResolvedValue(mkW()); prisma.cliente.findUnique.mockResolvedValue({id:"c1"});
      prisma.clienteTrabajador.findFirst.mockResolvedValue({id:'a1'});
      await expect(svc.asignarCliente('w1','c1',TipoSesion.PEDAGOGIA)).rejects.toThrow(ConflictException);
    });
    it('crea asignacion', async()=>{
      prisma.trabajador.findUnique.mockResolvedValue(mkW()); prisma.cliente.findUnique.mockResolvedValue({id:"c1"});
      prisma.clienteTrabajador.findFirst.mockResolvedValue(null);
      const a={id:"a1",cliente:{id:"c1",nombre:"Ana",apellidos:"G"},trabajador:{id:"w1",nombre:"Luis",apellidos:"P"}};
      prisma.clienteTrabajador.create.mockResolvedValue(a);
      const r = await svc.asignarCliente('w1','c1',TipoSesion.PEDAGOGIA);
      expect(prisma.clienteTrabajador.create).toHaveBeenCalledTimes(1);
      expect(r.id).toBe("a1");
    });
  });

  describe('findAll()', () => {
    it('filtra inactivos por defecto', async()=>{
      prisma.trabajador.findMany.mockResolvedValue([{...mkW(),rol:{id:'r1',nombreRol:'A',codigo:'ADMIN'}}]);
      await svc.findAll();
      expect(prisma.trabajador.findMany).toHaveBeenCalledWith(expect.objectContaining({where:{activo:true}}));
    });
    it('incluye inactivos con flag=true', async()=>{
      prisma.trabajador.findMany.mockResolvedValue([{...mkW(),rol:{id:'r1',nombreRol:'A',codigo:'ADMIN'}}]);
      await svc.findAll(true);
      expect(prisma.trabajador.findMany).toHaveBeenCalledWith(expect.objectContaining({where:{}}));
    });
  });
});
