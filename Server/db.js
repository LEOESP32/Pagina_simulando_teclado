const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./productos.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY,
    nombre TEXT,
    precio INTEGER,
    imagen TEXT
  )`);
  // Insertar productos iniciales si la tabla está vacía
  db.all("SELECT COUNT(*) as count FROM productos", (err, rows) => {
    if (rows[0].count === 0) {
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (11, 'Producto A', 20, 'imagenes/producto-A.jpg')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (13, 'Producto B', 35, 'imagenes/producto-B.jpg')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (15, 'Producto C', 50, 'imagenes/producto-C.jpg')");
    }
  });
});

module.exports = db;