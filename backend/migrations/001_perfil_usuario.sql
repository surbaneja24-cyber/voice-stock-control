-- Fase 3: columnas nuevas para el perfil real de usuario.
-- Ejecutar manualmente en el SQL editor de Neon antes de desplegar
-- el backend que las usa. Todas nullable: no rompe usuarios existentes.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio VARCHAR(280);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
