// backend.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// --- DATOS FICTICIOS EN MEMORIA ---
let usuarios = [
  { id: 1, nombre: "Toreto", babosas: 1000, lechuguines: 12 },
  { id: 2, nombre: "Sinhuellas", babosas: 1000, lechuguines: 7 },
  { id: 3, nombre: "Gari", babosas: 1000, lechuguines: 3 }
];

let carreras = [
  {
    id: 1,
    nombre: "Gran Premio del Charco",
    estado: "abierta", // abierta | cerrada | finalizada
    participantes: ["Rápido Slim", "Lento pero Seguro", "Turbo Baba"],
    ganador: null
  }
];

let apuestas = [];

// --- RUTAS PÚBLICAS ---
app.get("/", (req, res) => {
  res.send("🐌 Backend Bichos a la fuga funcionando");
});

// Ranking de usuarios
app.get("/ranking", (req, res) => {
  res.json(usuarios.sort((a, b) => b.lechuguines - a.lechuguines));
});

// Historial de apuestas
app.get("/apuestas", (req, res) => {
  res.json(apuestas);
});

// Apostar a una carrera
app.post("/apostar", (req, res) => {
  const { usuarioId, carreraId, opcion, cantidad } = req.body;

  const usuario = usuarios.find(u => u.id === usuarioId);
  const carrera = carreras.find(c => c.id === carreraId);

  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
  if (!carrera || carrera.estado !== "abierta")
    return res.status(400).json({ error: "Carrera no disponible para apuestas" });
  if (cantidad <= 0 || usuario.babosas < cantidad)
    return res.status(400).json({ error: "Saldo insuficiente" });

  usuario.babosas -= cantidad;
  apuestas.push({ usuarioId, carreraId, opcion, cantidad, fecha: new Date() });

  res.json({ mensaje: "Apuesta registrada 🐌", babosasRestantes: usuario.babosas });
});

// --- RUTAS ADMIN ---
// Iniciar carrera (cerrar apuestas)
app.post("/admin/carrera/iniciar", (req, res) => {
  const { carreraId } = req.body;
  const carrera = carreras.find(c => c.id === carreraId);

  if (!carrera) return res.status(404).json({ error: "Carrera no encontrada" });
  if (carrera.estado !== "abierta") return res.status(400).json({ error: "Carrera no se puede iniciar" });

  carrera.estado = "cerrada";
  res.json({ mensaje: `Carrera '${carrera.nombre}' iniciada. Apuestas cerradas 🐌` });
});

// Finalizar carrera y repartir premios
app.post("/admin/carrera/finalizar", (req, res) => {
  const { carreraId, ganador } = req.body;
  const carrera = carreras.find(c => c.id === carreraId);

  if (!carrera) return res.status(404).json({ error: "Carrera no encontrada" });
  if (carrera.estado !== "cerrada") return res.status(400).json({ error: "Carrera no está en curso" });

  carrera.estado = "finalizada";
  carrera.ganador = ganador;

  // Repartir premios (doble de la apuesta)
  apuestas
    .filter(a => a.carreraId === carreraId && a.opcion === ganador)
    .forEach(a => {
      const usuario = usuarios.find(u => u.id === a.usuarioId);
      usuario.lechuguines += a.cantidad * 2;
    });

  res.json({ mensaje: `Carrera finalizada 🏁. Ganador: ${ganador}`, carrera });
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor en puerto", PORT);
});


