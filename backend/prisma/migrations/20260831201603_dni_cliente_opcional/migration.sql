-- El DNI del cliente pasa a ser opcional.
--
-- Motivo: muchos menores no tienen DNI en el momento del alta. El campo era NOT NULL
-- con indice unico, y el alta enviaba cadena vacia cuando se dejaba en blanco. En
-- Postgres '' SI colisiona en un indice unico (mientras que NULL no lo hace, porque
-- NULL nunca es igual a NULL), asi que el segundo cliente sin DNI chocaba con el
-- primero y la app respondia "Ya existe un cliente registrado con el DNI".
--
-- ORDEN IMPORTANTE: soltar el NOT NULL antes del backfill, o el UPDATE fallaria.

-- 1. El DNI deja de ser obligatorio ------------------------------------------
ALTER TABLE "clientes" ALTER COLUMN "dni" DROP NOT NULL;

-- 2. Backfill: las cadenas vacias existentes pasan a NULL ---------------------
-- Imprescindible: sin esto, la fila que hoy guarda '' seguiria ocupando el unico
-- hueco disponible para ese valor y el bug persistiria para el proximo cliente
-- sin DNI. Se normalizan tambien los DNI que solo contengan espacios.
UPDATE "clientes" SET "dni" = NULL WHERE btrim("dni") = '';

-- El indice unico "clientes_dni_key" se mantiene tal cual: sobre una columna
-- nullable permite multiples NULL y sigue impidiendo DNI duplicados reales.
