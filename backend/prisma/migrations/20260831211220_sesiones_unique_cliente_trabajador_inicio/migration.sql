-- Impide que un cliente tenga dos sesiones con el mismo terapeuta a la misma hora.
--
-- Hasta ahora `sesiones` no tenia NINGUNA constraint unica (solo la PK y cuatro
-- indices no unicos). Eso hacia que el `skipDuplicates: true` del generador de
-- contratos fuese un no-op: daba sensacion de idempotencia sin proteger nada.
-- Con dos generadores escribiendo en la tabla, era cuestion de tiempo.
--
-- No se incluye el contrato en la clave a proposito: asi una sesion suelta
-- (evaluacion, extra que se cobra aparte) puede crearse a cualquier otra hora, o
-- a la misma con otro terapeuta -caso real: reunion de colegio con dos hermanos-.
--
-- Efecto a tener presente: si una sesion se cancelo, el generador NO la volvera a
-- crear en ese mismo instante. Es el comportamiento que se busca: regenerar
-- encima de una cancelacion era justamente uno de los fallos que se corrigen.
CREATE UNIQUE INDEX "sesiones_id_cliente_id_trabajador_fecha_hora_inicio_key"
  ON "sesiones"("id_cliente", "id_trabajador", "fecha_hora_inicio");
