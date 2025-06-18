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
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (22, 'Producto 22', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (23, 'Producto 23', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (24, 'Producto 24', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (25, 'Producto 25', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (30, 'Producto 30', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (31, 'Producto 31', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (32, 'Producto 32', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (33, 'Producto 33', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (34, 'Producto 34', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (35, 'Producto 35', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (40, 'Producto 40', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (41, 'Producto 41', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (42, 'Producto 42', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (43, 'Producto 43', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (44, 'Producto 44', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (45, 'Producto 45', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (50, 'Producto 50', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (51, 'Producto 51', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (52, 'Producto 52', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (53, 'Producto 53', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (54, 'Producto 54', 40, 'imagenes/sinproducto.png')");
      db.run("INSERT INTO productos (id, nombre, precio, imagen) VALUES (55, 'Producto 55', 40, 'imagenes/sinproducto.png')");
    }
  });
});

export default db;