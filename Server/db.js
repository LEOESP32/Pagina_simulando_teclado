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
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (11, 'Producto 11', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (13, 'Producto 13', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (15, 'Producto 15', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (20, 'Producto 20', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (21, 'Producto 21', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (22, 'Producto 22', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (23, 'Producto 23', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (24, 'Producto 24', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (25, 'Producto 25', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (30, 'Producto 30', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (31, 'Producto 31', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (32, 'Producto 32', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (33, 'Producto 33', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (34, 'Producto 34', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (35, 'Producto 35', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (40, 'Producto 40', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (41, 'Producto 41', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (42, 'Producto 42', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (43, 'Producto 43', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (44, 'Producto 44', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (45, 'Producto 45', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (50, 'Producto 50', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (51, 'Producto 51', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (52, 'Producto 52', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (53, 'Producto 53', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (54, 'Producto 54', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (55, 'Producto 55', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (60, 'Producto 60', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (61, 'Producto 61', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (62, 'Producto 62', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (63, 'Producto 63', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (64, 'Producto 64', 1, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (65, 'Producto 65', 1, 'imagenes/sinproducto.png')");
    }
  });
});

export default db;