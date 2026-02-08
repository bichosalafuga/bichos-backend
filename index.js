const express = require("express");
const cors = require("cors");

// --- DATOS FICTICIOS EN MEMORIA ---

let usuarios = [
  { id: 1, nombre: "Toreto", babosas: 1000, lechuguines: 0 },
  { id: 2, nombre: "Sinhuellas", babosas: 1000, lechuguines: 0 }
  { id: 3, nombre: "Gari", babosas: 1000, lechuguines: 0 }
];

let carreras = [
  {
    id: 1,
    nombre: "Gran Premio del Charco",
    estado: "abierta", // abierta | cerrada | finalizada
    participantes: ["Rápido Slim", "Lento pero Seguro", "Turbo Baba"]
  }
];

let apuestas = [];

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🐌 Backend Bichos a la fuga funcionando");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor en puerto", PORT);
});
let usuarios = [
  { id: 1, nombre: "Toreto", lechuguines: 12 },
  { id: 2, nombre: "Sinhuellas", lechuguines: 7 },
  { id: 3, nombre: "Gari", lechuguines: 3 }
];

app.get("/ranking", (req, res) => {
  app.post("/apostar", (req, res) => {
  const { usuarioId, carreraId, opcion, cantidad } = req.body;

  // Validaciones básicas
  const usuario = usuarios.find(u => u.id === usuarioId);
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  const carrera = carreras.find(c => c.id === carreraId);
  if (!carrera || carrera.estado !== "abierta") {
    return res.status(400).json({ error: "Carrera no disponible para apuestas" });
  }

  if (cantidad <= 0 || usuario.babosas < cantidad) {
    return res.status(400).json({ error: "Saldo ficticio insuficiente" });
  }

  // Registrar apuesta
  usuario.babosas -= cantidad;

  apuestas.push({
    usuarioId,
    carreraId,
    opcion,
    cantidad,
    fecha: new Date()
  });

  res.json({
    mensaje: "Apuesta ficticia registrada 🐌",
    aviso: "Sin valor económico",
    babosasRestantes: usuario.babosas
  });
});

  res.json(usuarios.sort((a, b) => b.lechuguines - a.lechuguines));
});

