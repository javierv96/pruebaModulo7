const pool = require ('../config/configDB');

// Muestra todos los usuarios de la tabla
async function usuarios() {
    const queryJson = {
        text: 'SELECT * FROM usuarios'
    };

    const { rows } = await pool.query(queryJson);

    return rows;
}

// Muestra todos los usuarios con el campo activo en TRUE
async function usuariosActivos() {
    const queryJson = {
        text: 'SELECT * FROM usuarios WHERE activa = TRUE'
    };

    const { rows } = await pool.query(queryJson);

    return rows;
}

// Crea un nuevo registro de usuario con nombre y balance
async function nuevoUsuario(nombre, balance) {
    const queryJson = {
        text: `INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *`,
        values: [nombre, balance]
    }

    const results = await pool.query(queryJson);

    return results;
}

// Consulta todos los datos de un usuario
async function consultarUsuario(id) {
    const queryJson = {
        text: 'SELECT * FROM usuarios WHERE id = $1',
        values: [id]
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

// Editar campos nombre y balance de un usuario en la tabla
async function editarUsuario(id, nombre, balance) {
    const queryJson = {
        text: `UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *`,
        values: [nombre, balance, id]
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

// Elimina el usuario de la tabla
async function eliminarUsuario(id) {
    const queryJson = {
        text: `DELETE FROM usuarios WHERE id = $1 RETURNING *`,
        values: [id]
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

// Realiza una actualizacion en el campo activo de la tabla usuarios para desactivarlo (FALSE)
async function desactivarUsuario(id) {
    const queryJson = {
        text: `UPDATE usuarios SET activa = FALSE WHERE id = $1 RETURNING *`,
        values: [id]
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

// Realiza una nueva transferencia entre 2 usuarios, emisor y receptor
async function nuevaTransferencia(emisor, receptor, monto) {
    await pool.query("BEGIN");

    const resta = 'UPDATE usuarios SET balance = balance - $1 WHERE id = $2 RETURNING *';
    const res1 = await pool.query(resta, [monto, emisor]);

    const suma = 'UPDATE usuarios SET balance = balance + $1 WHERE id = $2 RETURNING *';
    const res2 = await pool.query(suma, [monto, receptor]);

    const transferencia = 'INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, NOW()) RETURNING *';
    const res3 = await pool.query(transferencia, [emisor, receptor, monto]);

    await pool.query("COMMIT");
}

// Muestra todas las transferencias realizadas
async function historialTransferencias() {
    const queryJson = {
        text: 'SELECT t.fecha, u_emisor.nombre AS emisor, u_receptor.nombre AS receptor, t.monto FROM transferencias t INNER JOIN usuarios u_emisor ON t.emisor = u_emisor.id JOIN usuarios u_receptor ON t.receptor = u_receptor.id',
        rowMode: "array"
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

// Consulta si usuario cuenta con saldo disponible
async function getSaldoEmisor(id){
    const queryJson = {
        text: 'SELECT balance from usuarios WHERE id = $1',
        values: [id]
    }

    const resultado = await pool.query(queryJson);
    
    return resultado.rows[0].balance;
}

// Consulta si usuario existe en la tabla transferencias
async function usuarioTransferencia(id){
    const queryJson = {
        text: 'SELECT * from transferencias WHERE emisor = $1 OR receptor = $1',
        values: [id]
    }

    const resultado = await pool.query(queryJson);
    
    return resultado;
}

module.exports = {
    usuarios,
    nuevoUsuario,
    editarUsuario,
    consultarUsuario,
    eliminarUsuario,
    nuevaTransferencia,
    historialTransferencias,
    getSaldoEmisor,
    desactivarUsuario,
    usuariosActivos,
    usuarioTransferencia
}