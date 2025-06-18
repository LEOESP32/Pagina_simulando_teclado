import sqlite3 from 'sqlite3';
import path from 'path';

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
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (11, 'Producto 11', 20, 'imagenes/producto-A.jpg')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (13, 'Producto 13', 35, 'imagenes/producto-B.jpg')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (15, 'Producto 15', 50, 'imagenes/producto-C.jpg')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (20, 'Producto 20', 40, 'imagenes/producto-D.jfif')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (21, 'Producto 21', 40, 'imagenes/producto-D.jfif')");
    }
  });
});

export default db;