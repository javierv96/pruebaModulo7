const pool = require ('../config/configDB');

async function usuarios() {
    const queryJson = {
        text: 'SELECT * FROM usuarios'
    };

    const { rows } = await pool.query(queryJson);

    return rows;
}

async function nuevoUsuario(nombre, balance) {
    const queryJson = {
        text: `INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *`,
        values: [nombre, balance]
    }

    const results = await pool.query(queryJson);

    return results;
}

async function consultarUsuario(id) {
    const queryJson = {
        text: 'SELECT * FROM usuarios WHERE id = $1',
        values: [id]
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

async function editarUsuario(id, nombre, balance) {
    const queryJson = {
        text: `UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *`,
        values: [nombre, balance, id]
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

async function eliminarUsuario(id) {
    const queryJson = {
        text: `DELETE FROM usuarios WHERE id = $1 RETURNING *`,
        values: [id]
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

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

async function historialTransferencias() {
    const queryJson = {
        text: 'SELECT t.fecha, u_emisor.nombre AS emisor, u_receptor.nombre AS receptor, t.monto FROM transferencias t INNER JOIN usuarios u_emisor ON t.emisor = u_emisor.id JOIN usuarios u_receptor ON t.receptor = u_receptor.id',
        rowMode: "array"
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

async function getSaldoEmisor(id){
    const queryJson = {
        text: 'SELECT balance from usuarios WHERE id = $1',
        values: [id]
    }

    const resultado = await pool.query(queryJson);
    
    return resultado.rows[0].balance;
}

module.exports = {
    usuarios,
    nuevoUsuario,
    editarUsuario,
    consultarUsuario,
    eliminarUsuario,
    nuevaTransferencia,
    historialTransferencias,
    getSaldoEmisor
}