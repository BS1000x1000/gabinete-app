import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { FichajeService } from './fichaje.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccesoClienteService } from '../common/acceso/acceso-cliente.service';
import { diaDesdeIso } from '../common/fecha/dia.utils';
import { QueryRegistrosClienteDto } from './dto/query-registros.dto';

const mkPrisma = () => ({
  cliente:{findUnique:jest.fn()},
  objetivoGeneral:{findMany:jest.fn()},
  sesion:{findUnique:jest.fn(),update:jest.fn()},
  registroDiario:{findUnique:jest.fn(),findMany:jest.fn(),count:jest.fn(),create:jest.fn(),update:jest.fn(),delete:jest.fn()},
  registroDiarioObjetivo:{deleteMany:jest.fn()},
  $transaction: jest.fn(),
});

describe('FichajeService', () => {
  // Tipados a proposito: sin tipo son `any`, y sobre `any` ninguna asercion
  // comprueba nada — ni el compilador avisa si cambia una firma del servicio.
  let svc: FichajeService;
  let prisma: ReturnType<typeof mkPrisma>;
  let acceso: { assertAcceso: jest.Mock };
  beforeEach(async () => {
    prisma = mkPrisma();
    acceso = { assertAcceso: jest.fn().mockResolvedValue(undefined) };
    const m = await Test.createTestingModule({providers:[FichajeService,{provide:PrismaService,useValue:prisma},{provide:AccesoClienteService,useValue:acceso}]}).compile();
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

    // `fechaRegistro` es el DIA de la sesion, no el instante en que se teclea.
    // Guardarlo como `new Date("2026-09-02")` daba la medianoche UTC, que en
    // Madrid se pinta como las 02:00: de ahi salia el "registro hecho a las
    // 02:00 am" que se veia en todas las tarjetas.
    it('guarda la fecha del registro como dia, al mediodia UTC', async()=>{
      prisma.cliente.findUnique.mockResolvedValue({id:'c1'});
      prisma.registroDiario.create.mockResolvedValue({id:'rd1'});
      await svc.create({...dto, fechaRegistro:'2026-09-02'}, 't1');
      const data = prisma.registroDiario.create.mock.calls[0][0].data;
      expect(data.fechaRegistro.toISOString()).toBe('2026-09-02T12:00:00.000Z');
    });

    it('sin fecha explicita no toca el campo: manda el `now()` del modelo', async()=>{
      prisma.cliente.findUnique.mockResolvedValue({id:'c1'});
      prisma.registroDiario.create.mockResolvedValue({id:'rd1'});
      await svc.create(dto, 't1');
      const data = prisma.registroDiario.create.mock.calls[0][0].data;
      expect(data.fechaRegistro).toBeUndefined();
    });
  });

  describe('update()', () => {
    // El DTO va como objeto, no como string suelto: al tipar `svc` el compilador
    // destapo que este test pasaba un `string` donde va un UpdateRegistroDiarioDto.
    // Pasaba igual porque el 404 salta antes de mirar el cuerpo.
    it('NotFound si registro no existe', async()=>{ prisma.registroDiario.findUnique.mockResolvedValue(null); await expect(svc.update('rx',{contenido:'contenido'})).rejects.toThrow(NotFoundException); });
    it('BadRequest si objetivo no existe en update', async()=>{
      prisma.registroDiario.findUnique.mockResolvedValue({id:'rd1'});
      prisma.objetivoGeneral.findMany.mockResolvedValue([]);
      await expect(svc.update('rd1',{contenido:'contenido',objetivosGeneralesTrabajados:[{objetivoGeneralId:'obj-x'}]})).rejects.toThrow(BadRequestException);
    });
    it('actualiza contenido', async()=>{
      prisma.registroDiario.findUnique.mockResolvedValue({id:'rd1'});
      const actualizado={id:'rd1',contenido:'nuevo'};
      prisma.registroDiario.update.mockResolvedValue(actualizado);
      prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
      const r = await svc.update('rd1',{contenido:'nuevo'});
      expect(r.id).toBe("rd1");
    });
  });

  describe('findByCliente()', () => {
    it('NotFound si cliente no existe', async()=>{
      // La existencia (y el soft-delete) los comprueba ya AccesoClienteService.
      acceso.assertAcceso.mockRejectedValueOnce(new NotFoundException());
      await expect(svc.findByCliente('cx')).rejects.toThrow(NotFoundException);
    });
    it('no devuelve registros de un cliente que no se tiene asignado', async()=>{
      acceso.assertAcceso.mockRejectedValueOnce(new ForbiddenException());
      await expect(
        svc.findByCliente('c-ajeno', {}, {userId:'t9',rol:'PEDAGOGO'}),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.registroDiario.findMany).not.toHaveBeenCalled();
    });
    it('los registros de otro profesional solo los ve un ADMIN', async()=>{
      prisma.registroDiario.findMany.mockResolvedValue([]);
      await expect(
        svc.findByTrabajador('otro-t', {userId:'t9',rol:'PEDAGOGO'}),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        svc.findByTrabajador('otro-t', {userId:'a1',rol:'ADMIN'}),
      ).resolves.toBeDefined();
    });
    it('devuelve registros del cliente paginados', async()=>{
      prisma.cliente.findUnique.mockResolvedValue({id:'c1'});
      const registros=[{id:'rd1'},{id:'rd2'}];
      prisma.registroDiario.findMany.mockResolvedValue(registros);
      prisma.registroDiario.count.mockResolvedValue(2);
      const r = await svc.findByCliente('c1');
      expect(r.data).toHaveLength(2);
      expect(r.total).toBe(2);
    });

    it('aplica skip y take a partir de page y limit', async()=>{
      prisma.cliente.findUnique.mockResolvedValue({id:'c1'});
      prisma.registroDiario.findMany.mockResolvedValue([]);
      prisma.registroDiario.count.mockResolvedValue(120);
      const r = await svc.findByCliente('c1', { page: 3, limit: 20 });
      expect(prisma.registroDiario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 40, take: 20 }),
      );
      expect(r.total).toBe(120);
    });

    // ── Filtro por periodo ────────────────────────────────────────────────
    //
    // Aqui es donde se cuela el desfase de un dia: `fechaRegistro` guarda el DIA
    // a las 12:00 UTC, asi que el rango tiene que construirse con esos mismos
    // mediodias. Parsear con `new Date("2026-10-01")` da la medianoche UTC y
    // dejaria el primer dia del rango fuera.
    describe('filtro por periodo (desde / hasta)', () => {
      type WhereRegistros = {
        clienteId: string;
        fechaRegistro?: { gte?: Date; lte?: Date };
      };

      const conRango = async (
        filtros: QueryRegistrosClienteDto,
      ): Promise<WhereRegistros> => {
        prisma.registroDiario.findMany.mockResolvedValue([]);
        prisma.registroDiario.count.mockResolvedValue(0);
        await svc.findByCliente('c1', filtros);
        const [args] = prisma.registroDiario.findMany.mock.calls[0] as [
          { where: WhereRegistros },
        ];
        return args.where;
      };

      /** El rango del where, exigiendo que exista. */
      const rangoDe = (where: WhereRegistros) => {
        if (!where.fechaRegistro) {
          throw new Error('Se esperaba filtro de fecha');
        }
        return where.fechaRegistro;
      };

      it('sin desde ni hasta no filtra por fecha', async () => {
        const where = await conRango({});
        expect(where).toEqual({ clienteId: 'c1' });
      });

      it('traduce el rango a los mediodias UTC de los dos dias', async () => {
        const rango = rangoDe(
          await conRango({ desde: '2026-10-01', hasta: '2026-10-31' }),
        );
        expect(rango.gte).toEqual(new Date(Date.UTC(2026, 9, 1, 12, 0, 0, 0)));
        expect(rango.lte).toEqual(new Date(Date.UTC(2026, 9, 31, 12, 0, 0, 0)));
      });

      it('los dos dias frontera caen DENTRO del rango, y sus vecinos fuera', async () => {
        const { gte, lte } = rangoDe(
          await conRango({ desde: '2026-10-01', hasta: '2026-10-31' }),
        ) as { gte: Date; lte: Date };

        // Un registro guardado tal y como lo escribe `create()`.
        const guardado = (dia: string) => diaDesdeIso(dia);

        expect(guardado('2026-10-01') >= gte).toBe(true); // primer dia: dentro
        expect(guardado('2026-10-31') <= lte).toBe(true); // ultimo dia: dentro
        expect(guardado('2026-09-30') >= gte).toBe(false); // vispera: fuera
        expect(guardado('2026-11-01') <= lte).toBe(false); // siguiente: fuera
      });

      it('admite solo desde, o solo hasta', async () => {
        const soloDesde = await conRango({ desde: '2026-10-01' });
        expect(rangoDe(soloDesde)).toEqual({
          gte: new Date(Date.UTC(2026, 9, 1, 12, 0, 0, 0)),
        });

        prisma.registroDiario.findMany.mockClear();
        const soloHasta = await conRango({ hasta: '2026-10-31' });
        expect(rangoDe(soloHasta)).toEqual({
          lte: new Date(Date.UTC(2026, 9, 31, 12, 0, 0, 0)),
        });
      });

      it('el count usa el mismo where que la consulta', async () => {
        const where = await conRango({
          desde: '2026-10-01',
          hasta: '2026-10-31',
        });
        expect(prisma.registroDiario.count).toHaveBeenCalledWith({ where });
      });

      it('el rango convive con la paginacion', async () => {
        prisma.registroDiario.findMany.mockResolvedValue([]);
        prisma.registroDiario.count.mockResolvedValue(0);
        await svc.findByCliente('c1', {
          page: 2,
          limit: 10,
          desde: '2026-10-01',
          hasta: '2026-10-31',
        });
        expect(prisma.registroDiario.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ skip: 10, take: 10 }),
        );
      });

      it('BadRequest si desde es posterior a hasta', async () => {
        await expect(
          svc.findByCliente('c1', { desde: '2026-10-31', hasta: '2026-10-01' }),
        ).rejects.toThrow(BadRequestException);
        expect(prisma.registroDiario.findMany).not.toHaveBeenCalled();
      });

      it('el 403 y el 400 no se disfrazan de 500', async () => {
        // Los catch de este servicio convierten en 500 todo lo que no sea
        // NotFound, asi que el acceso y la validacion del rango van fuera.
        acceso.assertAcceso.mockRejectedValueOnce(new ForbiddenException());
        await expect(
          svc.findByCliente(
            'c-ajeno',
            { desde: '2026-10-01' },
            { userId: 't9', rol: 'PEDAGOGO' },
          ),
        ).rejects.toThrow(ForbiddenException);
      });
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
