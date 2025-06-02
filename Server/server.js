import express from "express";
import cors from "cors";
import path from "path";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import mqtt from "mqtt";
import fetch from "node-fetch";
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const processedPayments = new Set();

app.post("/update-payment", async (req, res) => {
  console.log("🔔 Webhook recibido:", req.body);

  // ✅ IGNORAR temas que no sean 'payment'
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
    const newPaymentId = paymentData.id;

    // Evita procesar el mismo pago más de una vez
    if (!externalRef || processedPayments.has(newPaymentId)) {
      console.warn("🔁 Webhook duplicado o sin external_reference");
      return res.status(400).json({ message: "ID inválido o repetido" });
    }

    processedPayments.add(newPaymentId);

    const [orderId, precioStr] = externalRef.split("|");
    const precio = parseInt(precioStr) || 0;
    const cantidad = paymentData.transaction_details?.total_paid_amount ? 1 : "¿?";
    const producto = Number(orderId);

    const payload = {
      producto
      //precio,
      //cantidad
    };

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
// Obtener todos los productos
app.get("/api/productos", (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Actualizar precio de un producto
app.post("/api/productos/:id/precio", (req, res) => {
  const { precio } = req.body;
  db.run("UPDATE productos SET precio = ? WHERE id = ?", [precio, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});
//-----------------------------------------------------------------
app.listen(8080, "0.0.0.0", () => {
  console.log("Servidor corriendo en http://0.0.0.0:8080");
});
