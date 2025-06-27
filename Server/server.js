import express from "express";
import cors from "cors";
import path from "path";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import mqtt from "mqtt";
import fetch from "node-fetch";
import { createClient } from '@supabase/supabase-js';
// import pool from './db.js';
import session from "express-session";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const supabase = createClient(
  'https://exmmmwtjdelhhgoxkcyr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bW1td3RqZGVsaGhnb3hrY3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc3Mjg1NiwiZXhwIjoyMDY2MzQ4ODU2fQ.HfWYBy_kKGu6I09bUejIpPl3vTok9sOgerKEDRG3ImY'
);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("Access Token cargado desde .env:", process.env.ACCESS_TOKEN);

const app = express();

// MQTT Configuración
const mqttClient = mqtt.connect("mqtts://736ca49d528b4c41bfd924bc491b6878.s1.eu.hivemq.cloud:8883", {
  username: "snacko",
  password: "Qwertyuiop1",
});
mqttClient.on("connect", () => console.log("✅ Conectado al broker MQTT"));
mqttClient.on("error", err => console.error("❌ Error MQTT:", err));

// Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN,
  options: { timeout: 5000 },
});
const preference = new Preference(client);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "Client")));

// Configura sesiones
app.use(session({
  secret: "snacko_super_secreto", // Cambia esto por una clave segura
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true solo si usas HTTPS
}));

// Usuario y contraseña (puedes cambiar estos valores)
const ADMIN_USER = "admin";
const ADMIN_PASS_HASH = await bcrypt.hash("snacko123", 10); // Ejecuta esto una vez y pega el hash aquí

// Endpoint de login
app.post("/api/login", express.json(), async (req, res) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && await bcrypt.compare(pass, ADMIN_PASS_HASH)) {
    req.session.isAdmin = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: "Credenciales incorrectas" });
  }
});

// Endpoint de logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Middleware para proteger rutas
function requireAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  res.status(401).send("No autorizado");
}

// Sirve admin.html solo si está logueado
app.get("/admin.html", requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/admin.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Client", "index.html"));
});

app.post("/create_preference", async (req, res) => {
  try {
    const { description, price, quantity, orderId } = req.body;

    if (!description || !price || !quantity || !orderId) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const external_reference = `${orderId}|${price}`;

    const preferenceData = {
      items: [
        {
          title: description,
          unit_price: Number(price),
          quantity: Number(quantity),
        },
      ],
      back_urls: {
        success: "https://electronica2-maquina-expendedora.onrender.com",
        failure: "https://electronica2-maquina-expendedora.onrender.com",
        pending: "https://electronica2-maquina-expendedora.onrender.com",
      },
      notification_url: "https://electronica2-maquina-expendedora.onrender.com/update-payment",
      auto_return: "approved",
      external_reference,
    };

    const response = await preference.create({ body: preferenceData });
    if (!response.id) {
      return res.status(500).json({ error: "La respuesta de MercadoPago no contiene un id válido" });
    }

    res.json({ id: response.id });
  } catch (error) {
    console.error("❌ Error en create_preference:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/feedback", (req, res) => {
  res.json({
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id,
  });
});

let lastPaymentId = "";

app.post("/update-payment", async (req, res) => {
  console.log("🔔 Webhook recibido:", req.body);

  if (req.body.topic && req.body.topic !== "payment") {
    console.log("ℹ️ Notificación ignorada (tipo no relevante):", req.body.topic);
    return res.status(200).json({ message: "Tipo de notificación no procesado" });
  }

  try {
    const paymentId = req.body?.data?.id || req.body?.resource;
    if (!paymentId) {
      console.warn("❌ No se recibió un ID de pago válido en el webhook.");
      return res.status(400).json({ message: "Webhook sin ID válido" });
    }

    // Verifica si el pago ya fue procesado
    const { data: pagos, error: pagosError } = await supabase
      .from('pagos_procesados')
      .select('payment_id')
      .eq('payment_id', paymentId)
      .maybeSingle();

    if (pagosError) {
      console.error("❌ Error al consultar pagos_procesados:", pagosError);
      return res.status(500).json({ error: "Error al consultar pagos_procesados" });
    }

    if (pagos) {
      console.warn("🔁 Pago ya procesado, ignorando:", paymentId);
      return res.status(200).json({ message: "Pago ya procesado" });
    }

    // Si NO está, guarda el pago como procesado en la base de datos
    const { error: insertError } = await supabase
      .from('pagos_procesados')
      .insert([{ payment_id: paymentId, fecha: new Date().toISOString() }]);
    if (insertError) {
      console.error("❌ Error al guardar pago procesado:", insertError);
      return res.status(500).json({ error: "Error al guardar pago procesado" });
    }

    // Ahora sí, consulta el pago y publica en MQTT
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("❌ Error al consultar el pago:", errorText);
      return res.status(500).json({ error: "No se pudo consultar el pago a MP" });
    }

    const paymentData = await mpResponse.json();

    const externalRef = paymentData.external_reference;
    const [orderId, precioStr] = externalRef ? externalRef.split("|") : [];
    const precio = parseInt(precioStr) || 0;
    const cantidad = paymentData.transaction_details?.total_paid_amount ? 1 : "¿?";
    const producto = Number(orderId);

    if (!orderId || isNaN(producto)) {
      console.warn("❌ external_reference inválido, no se publica en MQTT:", externalRef);
      return res.status(400).json({ error: "external_reference inválido" });
    }

    const payload = { producto };

    console.log(`🛒 Producto comprado: ${producto}`);
    console.log(`💵 Precio: $${precio}`);
    console.log(`📦 Cantidad: ${cantidad}`);
    console.log("📤 Publicando mensaje MQTT:", payload);

    mqttClient.publish("expendedora/snacko/venta", String(Number(orderId)), { qos: 1 }, err => {
      if (err) {
        console.error("❌ Error al publicar en MQTT:", err);
      } else {
        console.log("✅ Mensaje MQTT publicado:", payload);
      }
    });

    res.status(200).json({ message: "Webhook procesado correctamente" });
  } catch (error) {
    console.error("❌ Error en /update-payment:", error);
    res.status(500).json({ error: "Error procesando el webhook" });
  }
});

app.get("/payment-status", (req, res) => {
  res.json({
    id: lastPaymentId,
    paymentConfirmed: !!lastPaymentId,
  });
});

//-----------------------------------------------------------------
// Obtener todos los productos SQL

app.get('/api/productos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: 'Error al obtener productos', detalle: err.message });
  }
});

/*app.get("/api/productos", (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});*/

// Actualizar precio de un producto SQL

app.post("/api/productos/:id/precio", async (req, res) => {
  const { precio } = req.body;
  try {
    const { error } = await supabase
      .from('productos')
      .update({ precio })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar imagen de un producto
app.post("/api/productos/:id/imagen", requireAdmin, express.json(), async (req, res) => {
  const { imagen } = req.body;
  try {
    const { error } = await supabase
      .from('productos')
      .update({ imagen })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* app.post("/api/productos/:id/precio", (req, res) => {
  const { precio } = req.body;
  db.run("UPDATE productos SET precio = ? WHERE id = ?", [precio, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});
// Actualizar imagen de un producto
app.post("/api/productos/:id/imagen", requireAdmin, express.json(), (req, res) => {
  const { imagen } = req.body;
  db.run("UPDATE productos SET imagen = ? WHERE id = ?", [imagen, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
}); */

//-----------------------------------------------------------------
app.post('/api/mqtt/send', express.json(), (req, res) => {
  const { valor } = req.body;
  // Aquí debes usar tu lógica para publicar en MQTT
  mqttClient.publish("expendedora/snacko/venta", valor, err => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});
app.listen(8080, "0.0.0.0", () => {
  console.log("Servidor corriendo en http://0.0.0.0:8080");
});


