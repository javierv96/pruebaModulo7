const express = require('express');
const app = express();

const querys = require('./querys/query.js');
const errors = require('./errors/handleErrors.js');
const pool = require('./config/configDB');

app.use(express.json());

const PORT = process.env.SV_PORT || 3000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
});

let status = "";
let message = "";
const numeros = /^[0-9]+$/;

app.post('/usuario', async (req, res) => {
    const { nombre, balance } = req.body;

    try {

        if (nombre || balance) {

            if (!numeros.test(balance)) {
                return res.status(400).json({ error: 'Por favor, proporcione un monto numerico valido.' })
            }

            const query = await querys.nuevoUsuario(nombre, balance);

            res.status(201).json({
                message: 'Usuario agregado correctamente',
                usuario: query.rows
            })

        } else {
            console.log("Por favor, proporciona nombre y balance para agregar el usuario.");
            return res.status(400).json({ error: 'Por favor, proporciona nombre y balance para agregar el usuario.' });
        }

    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
        res.status(final.status).json(final.message);
    }
});

app.get('/usuarios', async (req, res) => {
    try {

        const query = await querys.usuarios()

        res.json(query);

    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
        res.status(final.status).json(final.message);
    }
});

app.put('/usuario', async (req, res) => {
    const { id } = req.query;
    const { name, balance } = req.body;

    try {

        if (!numeros.test(balance)) {
            return res.status(400).json({ error: 'Por favor, proporcione un monto numerico valido.' })
        }

        if(balance < 0) {
            console.log("El valor ingresado no puede ser menor a cero.");
            return res.status(400).json({ error: 'El valor ingresado no puede ser menor a cero.' });
        }

        await querys.editarUsuario(id, name, balance);

        const usuarioActualizado = await querys.consultarUsuario(id);

        if (usuarioActualizado.length > 0) {
            res.json({
                message: 'Usuario actualizado correctamente',
                usuario: usuarioActualizado[0]
            });
        } else {
            res.status(400).json({
                message: "El registro con id: " + id + "no existe."
            });
        }
    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
        res.status(final.status).json(final.message);
    }
});

app.delete('/usuario', async (req, res) => {
    const { id } = req.query;
    try {

        const query = await querys.eliminarUsuario(id);

        res.json({
            message: `Usuario eliminado correctamente`
        });

    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
        res.status(final.status).json(final.message);
    }
});

app.post('/transferencia', async (req, res) => {
    const { emisor, receptor, monto } = req.body;
    
    try {

        if (emisor || receptor || monto) {

            if(!numeros.test(monto)) {
                console.log("Por favor, proporcione un monto numerico valido para realizar la transferencia.");
                return res.status(400).json({ error: 'Por favor, proporcione un monto numerico valido para realizar la transferencia.' });
            }

            if(monto > await querys.getSaldoEmisor(emisor)) {
                console.log("El valor ingresado supera los fondos del emisor.");
                return res.status(400).json({ error: 'El valor ingresado supera los fondos del emisor.' });
            }

            if(monto < 0) {
                console.log("El valor ingresado no puede ser menor a cero.");
                return res.status(400).json({ error: 'El valor ingresado no puede ser menor a cero.' });
            }

            if(emisor == receptor) {
                console.log("No puede realizar transferencia al mismo usuario.");
                return res.status(400).json({ error: 'No puede realizar transferencia al mismo usuario.' });
            }

            await querys.nuevaTransferencia(emisor, receptor, monto);

            res.status(201).json({
                message: 'Transferencia realizada con exito.'
            });

        } else {
            console.log("Por favor, proporcione emisor, receptor y monto para realizar la transferencia.");
            return res.status(400).json({ error: 'Por favor, proporcione emisor, receptor y monto para realizar la transferencia.' });
        }

    } catch (err) {
        await pool.query("ROLLBACK");

        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
        res.status(final.status).json(final.message);
    }
});

app.get('/transferencias', async (req, res) => {
    try {

        const transferencias = await querys.historialTransferencias();

        res.json(transferencias);

    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
        res.status(final.status).json(final.message);
    }
});

app.use((req, res) => {
    res.send('Esta página no existe...');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
