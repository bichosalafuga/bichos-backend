// backend.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// --- DATOS ---
let usuarios = [
  { id: 1, nombre: "Toreto", babosas: 1000, lechuguines: 12 },
  { id: 2, nombre: "Sinhuellas", babosas: 1000, lechuguines: 7 },
  { id: 3, nombre: "Gari", babosas: 1000, lechuguines: 3 }
];

let carreras = [
  {
    id: 1,
    nombre: "Gran Premio del Charco",
    estado: "abierta",
    participantes: [
      { nombre: "Rápido Slim", tiempoLlegada: null, seMovioPrimero: false, seSalio: false },
      { nombre: "Lento pero Seguro", tiempoLlegada: null, seMovioPrimero: false, seSalio: false },
      { nombre: "Turbo Baba", tiempoLlegada: null, seMovioPrimero: false, seSalio: false }
    ],
    apuestas: [],
    ganador: null
  }
];

// --- ENDPOINTS ---
app.get("/", (req, res) => res.send("🐌 Backend Bichos funcionando"));

// Ranking
app.get("/ranking", (req, res) => {
  res.json(usuarios.sort((a,b)=>b.lechuguines - a.lechuguines));
});

// Historial de apuestas
app.get("/apuestas", (req, res) => res.json(carreras.flatMap(c => c.apuestas)));

// Apostar
app.post("/apostar", (req, res) => {
  const { usuarioId, carreraId, tipo, objetivo, cantidad } = req.body;
  const usuario = usuarios.find(u => u.id === usuarioId);
  const carrera = carreras.find(c => c.id === carreraId);

  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
  if (!carrera || carrera.estado !== "abierta") return res.status(400).json({ error: "Carrera no disponible para apuestas" });
  if (cantidad <= 0 || usuario.babosas < cantidad) return res.status(400).json({ error: "Saldo insuficiente" });

  usuario.babosas -= cantidad;
  const apuesta = { usuarioId, tipo, objetivo, cantidad, fecha: new Date() };
  carrera.apuestas.push(apuesta);

  res.json({ mensaje: "Apuesta registrada 🐌", babosasRestantes: usuario.babosas });
});

// --- ADMIN ---
// Iniciar carrera
app.post("/admin/carrera/iniciar", (req, res) => {
  const { carreraId } = req.body;
  const carrera = carreras.find(c => c.id === carreraId);
  if (!carrera) return res.status(404).json({ error: "Carrera no encontrada" });
  if (carrera.estado !== "abierta") return res.status(400).json({ error: "Carrera no se puede iniciar" });

  carrera.estado = "cerrada";
  res.json({ mensaje: `Carrera '${carrera.nombre}' iniciada. Apuestas cerradas 🐌` });
});

// Finalizar carrera y calcular premios
app.post("/admin/carrera/finalizar", (req, res) => {
  const { carreraId, resultados } = req.body;
  // resultados = [{nombre:"Rápido Slim", tiempoLlegada:5, seMovioPrimero:true, seSalio:false}, ...]
  const carrera = carreras.find(c => c.id === carreraId);
  if (!carrera) return res.status(404).json({ error: "Carrera no encontrada" });
  if (carrera.estado !== "cerrada") return res.status(400).json({ error: "Carrera no está en curso" });

  // Actualizar participantes con resultados
  carrera.participantes.forEach(p => {
    const r = resultados.find(r => r.nombre === p.nombre);
    if (r) Object.assign(p, r);
  });
  carrera.estado = "finalizada";

  // Determinar ganador = quien tiene menor tiempoLlegada
  const orden = carrera.participantes.slice().sort((a,b)=>a.tiempoLlegada - b.tiempoLlegada);
  carrera.ganador = orden[0].nombre;

  // Repartir premios según apuestas
  carrera.apuestas.forEach(a => {
    const usuario = usuarios.find(u => u.id === a.usuarioId);
    let premio = 0;

    if (a.tipo === "posicion") {
      const pos = orden.indexOf(orden.find(p => p.nombre === a.objetivo)) + 1;
      if (pos === a.objetivo) premio = a.cantidad * 2;
    }
    else if (a.tipo === "primer_movimiento") {
      const primero = orden.find(p => p.seMovioPrimero);
      if (primero.nombre === a.objetivo) premio = a.cantidad * 1.5;
    }
    else if (a.tipo === "primer_salida") {
      const salio = orden.find(p => p.seSalio);
      if (salio && salio.nombre === a.objetivo) premio = a.cantidad * 1.5;
    }
    else if (a.tipo === "tiempo") {
      const participante = orden.find(p => p.nombre === a.objetivo.nombre);
      if (participante && participante.tiempoLlegada <= a.objetivo.tiempoMax) premio = a.cantidad * 2;
    }

    usuario.lechuguines += premio;
  });

  res.json({ mensaje: "Carrera finalizada 🏁", carrera });
});

// --- SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor en puerto", PORT));

