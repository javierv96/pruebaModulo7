--Solucion planteada por DesafioLatam--

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
    FOREIGN KEY (emisor) REFERENCES usuarios(id), 
    FOREIGN KEY (receptor) REFERENCES usuarios(id)
);

--------------------------------------------------------------

-- Solucion de eliminado por Cascada
-- La idea de esta solucion planteada es realizar un delete en cascada cuando se elimina un usuario que cuenta con registros en 
-- la tabla transferencias.
-- Al ser eliminado de esta forma, tambien se eliminarian los registros asociados al usuario en la tabla transferencias, por lo que
-- se plantea la solucion de mas abajo.

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50),
    balance FLOAT CHECK (balance >= 0)
);

CREATE TABLE transferencias (
    id SERIAL PRIMARY KEY, 
    emisor INT, 
    receptor INT, 
    monto FLOAT, 
    fecha TIMESTAMP, 
    FOREIGN KEY (emisor) REFERENCES usuarios(id) ON DELETE CASCADE, 
    FOREIGN KEY (receptor) REFERENCES usuarios(id) ON DELETE CASCADE
);

--Solucion de campo activo para cuenta
--Al implementar esta solucion, se agrega un nuevo campo al usuario con el nombre activo, el cual en la creacion del usuario por defecto estara como TRUE
--al momento de eliminar el usuario, si este cuenta con registros en la tabla transferencias, el usuario sera desactivado y no se mostrara mas en pantalla.
--en cambio si el usuario no cuenta con registros en la tabla transferencias, este si sera eliminado de la tabla usuarios.
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50),
    balance FLOAT CHECK (balance >= 0),
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE transferencias (
    id SERIAL PRIMARY KEY, 
    emisor INT, 
    receptor INT, 
    monto FLOAT, 
    fecha TIMESTAMP, 
    FOREIGN KEY (emisor) REFERENCES usuarios(id), 
    FOREIGN KEY (receptor) REFERENCES usuarios(id)
);