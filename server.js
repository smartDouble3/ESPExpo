require("dotenv").config();


const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");

const app = express();

// ✅ ต้องประกาศก่อน connect
const MQTT_URL  = process.env.MQTT_URL;
const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASS = process.env.MQTT_PASS;

// ✅ เช็คกันพลาด
console.log("MQTT_URL:", MQTT_URL ? "OK" : "MISSING");
console.log("MQTT_USER:", MQTT_USER ? "OK" : "MISSING");
console.log("MQTT_PASS:", MQTT_PASS ? "OK" : "MISSING");

const mqttClient = mqtt.connect(MQTT_URL, {
  username: MQTT_USER,
  password: MQTT_PASS,
  reconnectPeriod: 1000,
});

mqttClient.on("connect", () => console.log("✅ MQTT connected"));
mqttClient.on("error", (e) => console.log("❌ MQTT error:", e.message));

app.use(cors({ origin: "*" }));
app.use(express.json());

// log ทุก request
app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});
app.post("/api/eq", (req, res) => {
  const payload = req.body;

  const topic =
    payload?.type === "eq_power"
      ? "eq/power"
      : `eq/band/${payload?.band ?? "unknown"}`;

  mqttClient.publish(topic, JSON.stringify(payload), { qos: 0, retain: false });

  console.log("PUB:", topic, payload);

  res.json({ ok: true });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("listening", PORT));

