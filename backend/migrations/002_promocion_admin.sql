-- Panel de administración (leads del piloto): no hay auto-promoción a admin
-- por diseño, así que el primer admin se da de alta a mano en la base de
-- datos. No cambia el esquema (la columna "rol" ya existe en "usuarios"),
-- es solo un cambio de datos puntual.
--
-- Requisito previo: la cuenta ya debe existir (regístrala primero desde
-- /register con este email y una contraseña propia; el registro no manda
-- ningún correo, así que un email ficticio como este funciona sin problema
-- solo para login).
--
-- Ejecutar manualmente en el SQL editor de Neon.

UPDATE usuarios SET rol = 'admin' WHERE email = 'stockadmin@mystock.com';
