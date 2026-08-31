-- Colores de las areas de desarrollo, a la paleta verde de marca.
--
-- Estos colores viven en BD (`areas_desarrollo.color`) y se pintan directamente
-- en pantalla, asi que cambiar solo el codigo no bastaba: las areas habrian
-- seguido saliendo con la paleta anterior. Habia ademas tres copias
-- desincronizadas (seed.ts, areas-desarrollo.service.ts y _variables.scss); las
-- tres quedan alineadas con esta.
--
-- Se actualizan por color de origen y no por nombre, para no depender de tildes
-- ni de como este escrito el nombre del area.
UPDATE "areas_desarrollo" SET "color" = '#3a5c74' WHERE upper("color") = '#6366F1';  -- Procesos Cognitivos
UPDATE "areas_desarrollo" SET "color" = '#96382e' WHERE upper("color") = '#EF4444';  -- Funciones Ejecutivas
UPDATE "areas_desarrollo" SET "color" = '#345c6b' WHERE upper("color") = '#3B82F6';  -- Lectura
UPDATE "areas_desarrollo" SET "color" = '#6b5a8a' WHERE upper("color") = '#8B5CF6';  -- Escritura
UPDATE "areas_desarrollo" SET "color" = '#8a4a63' WHERE upper("color") = '#EC4899';  -- Lenguaje
UPDATE "areas_desarrollo" SET "color" = '#8a6018' WHERE upper("color") = '#F59E0B';  -- Matematicas
UPDATE "areas_desarrollo" SET "color" = '#2f6b43' WHERE upper("color") = '#10B981';  -- Tecnicas de Estudio
UPDATE "areas_desarrollo" SET "color" = '#a5622a' WHERE upper("color") = '#F97316';  -- Emociones
