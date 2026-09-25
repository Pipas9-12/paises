const express = require('express');
const mysql = require('mysql2');
const app = express();

// Permitir que la aplicación lea JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'usuario_paises',
    password: '123456',
    database: 'Paises_7A'
});

// Conectar a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado exitosamente a la base de datos MySQL (Paises_7A)');
});

// --- INTERFAZ WEB PRINCIPAL (HTML) ---
app.get('/', (req, res) => {
    db.query('SELECT * FROM paises', (err, results) => {
        if (err) return res.status(500).send('Error al cargar países');

        // Generar la tabla HTML dinámicamente con los países de MySQL
        let filasTabla = results.map(p => `
            <tr>
                <td>${p.pais_id}</td>
                <td>${p.pais_descripcion}</td>
                <td>
                    <button onclick="eliminarPais(${p.pais_id})" style="background-color: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Borrar</button>
                </td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>CRUD de Países</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 30px; }
                    table { border-collapse: collapse; width: 50%; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    form { margin-bottom: 20px; }
                    input[type="text"] { padding: 6px; width: 250px; }
                    button[type="submit"] { padding: 6px 12px; background-color: green; color: white; border: none; cursor: pointer; }
                </style>
            </head>
            <body>
                <h1>Gestión de Países (Paises_7A)</h1>
                
                <h3>Agregar Nuevo País</h3>
                <form id="formAgregar">
                    <input type="text" id="nombrePais" placeholder="Nombre del país" required>
                    <button type="submit">Agregar País</button>
                </form>

                <h3>Lista de Países</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>País</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasTabla}
                    </tbody>
                </table>

                <script>
                    // Función para AGREGAR un país
                    document.getElementById('formAgregar').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const pais_descripcion = document.getElementById('nombrePais').value;
                        
                        const respuesta = await fetch('/paises', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pais_descripcion })
                        });

                        if (respuesta.ok) {
                            location.reload(); // Recargar la página para ver el cambio
                        } else {
                            alert('Error al agregar el país');
                        }
                    });

                    // Función para BORRAR un país
                    async function eliminarPais(id) {
                        if (confirm('¿Seguro que querés borrar este país?')) {
                            const respuesta = await fetch('/paises/' + id, {
                                method: 'DELETE'
                            });

                            if (respuesta.ok) {
                                location.reload(); // Recargar la página para ver el cambio
                            } else {
                                alert('Error al borrar el país');
                            }
                        }
                    }
                </script>
            </body>
            </html>
        `;
        res.send(html);
    });
});

// --- RUTAS DE LA API (CRUD) ---

// READ: Obtener todos los países en formato JSON
app.get('/paises', (req, res) => {
    db.query('SELECT * FROM paises', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// CREATE: Agregar un nuevo país
app.post('/paises', (req, res) => {
    const { pais_descripcion } = req.body;
    if (!pais_descripcion) {
        return res.status(400).json({ error: 'El nombre del país es obligatorio' });
    }
    db.query('INSERT INTO paises (pais_descripcion) VALUES (?)', [pais_descripcion], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'País creado correctamente', id: result.insertId });
    });
});

// UPDATE: Actualizar un país por ID
app.put('/paises/:id', (req, res) => {
    const { id } = req.params;
    const { pais_descripcion } = req.body;
    db.query('UPDATE paises SET pais_descripcion = ? WHERE pais_id = ?', [pais_descripcion, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'País actualizado correctamente' });
    });
});

// DELETE: Eliminar un país por ID
app.delete('/paises/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM paises WHERE pais_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'País eliminado correctamente' });
    });
});

// Iniciar el servidor
const PUERTO = 3000;
app.listen(PUERTO, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PUERTO}`);
});