-- Solucion de eliminado por Cascada
-- La solucion planteada realiza una eliminacion en cascada del usuario, en caso de tener transferencias asociadas,
-- utilizando el siguiente script de base de datos.

CREATE DATABASE bancosolar;

drop table usuarios;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50),
    balance FLOAT CHECK (balance >= 0)
);

drop table transferencias;

CREATE TABLE transferencias (
    id SERIAL PRIMARY KEY, 
    emisor INT, 
    receptor INT, 
    monto FLOAT, 
    fecha TIMESTAMP, 
    FOREIGN KEY (emisor) REFERENCES usuarios(id) ON DELETE CASCADE, 
    FOREIGN KEY (receptor) REFERENCES usuarios(id) ON DELETE CASCADE
);

select * from usuarios;
select * from transferencias;


-- # Solucion de campo activo para cuenta (dejo esta solucion disponible para fines propios)
-- Al implementar esta solucion, se agrega un nuevo campo al usuario con el nombre activo, el cual en la creacion del usuario por defecto estara como TRUE
-- al momento de eliminar el usuario, si este cuenta con registros en la tabla transferencias, el usuario sera desactivado y no se mostrara mas en pantalla.
-- en cambio si el usuario no cuenta con registros en la tabla transferencias, este si sera eliminado de la tabla usuarios.

-- CREATE TABLE usuarios (
--     id SERIAL PRIMARY KEY,
--     nombre VARCHAR(50),
--     balance FLOAT CHECK (balance >= 0),
--     activa BOOLEAN DEFAULT TRUE
-- );

-- CREATE TABLE transferencias (
--     id SERIAL PRIMARY KEY, 
--     emisor INT, 
--     receptor INT, 
--     monto FLOAT, 
--     fecha TIMESTAMP, 
--     FOREIGN KEY (emisor) REFERENCES usuarios(id), 
--     FOREIGN KEY (receptor) REFERENCES usuarios(id)
-- );

-- *Para utilizar esta solucion solo debera cambiar la estructura de la tabla como se muestra arriba y utilizar el archivo server2.js*