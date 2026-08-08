-- Panel de administración: columna para medir actividad real de usuarios
-- (antes se aproximaba con movimientos de inventario, ahora es login real).
-- Ejecutar manualmente en el SQL editor de Neon antes de desplegar el
-- backend que la usa. Nullable: no rompe usuarios existentes, que quedan
-- sin valor hasta su próximo login.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
