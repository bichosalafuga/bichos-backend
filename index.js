const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ================= DATOS =================
const jugadores = ["Junma01","Jony67","Jorge07"];
let ranking = {
  Junma01: 0,
  Jony67: 0,
  Jorge07: 0
};

let apuestas = [];
let carrerasFinalizadas = [];
const babosasCarreras = Array(8).fill(100);
let resultadosCarreras = {};

// ================= RUTAS =================
app.get("/", (req,res)=>{
  res.send("🐌 Backend Bichos a la fuga funcionando");
});

// Registrar apuesta
app.post("/apuesta",(req,res)=>{
  const { usuario, carrera, tipo, objetivo, cantidad } = req.body;

  if(!jugadores.includes(usuario))
    return res.status(400).json({error:"Usuario no válido"});

  if(carrerasFinalizadas.includes(carrera))
    return res.status(400).json({error:"Carrera finalizada"});

  if(cantidad > babosasCarreras[carrera-1])
    return res.status(400).json({error:"No quedan babosas"});

  babosasCarreras[carrera-1] -= cantidad;
  apuestas.push({ usuario, carrera, tipo, objetivo, cantidad });

  res.json({mensaje:"Apuesta registrada"});
});

// Ver apuestas
app.get("/apuestas",(req,res)=>res.json(apuestas));

// Ranking
app.get("/ranking",(req,res)=>{
  const data = Object.entries(ranking)
    .map(([nombre,lech])=>({nombre,lech}))
    .sort((a,b)=>b.lech-a.lech);
  res.json(data);
});

// Carreras finalizadas
app.get("/carreras-finalizadas",(req,res)=>{
  res.json(carrerasFinalizadas);
});

// ADMIN: procesar resultados
app.post("/admin/resultado",(req,res)=>{
  const { carrera, resultado } = req.body;

  if(carrerasFinalizadas.includes(carrera))
    return res.status(400).json({error:"Carrera ya procesada"});

  resultadosCarreras[carrera] = resultado;
  carrerasFinalizadas.push(carrera);

  apuestas.forEach(a=>{
    if(a.carrera !== carrera) return;

    let acierto = false;
    if(a.tipo==="posicion")
      acierto = resultado.posicion[a.objetivo.posicion-1] === a.objetivo.nombre;
    if(a.tipo==="primer_movimiento")
      acierto = resultado.primer_movimiento === a.objetivo;
    if(a.tipo==="primer_salida")
      acierto = resultado.primer_salida === a.objetivo;
    if(a.tipo==="tiempo")
      acierto = resultado.tiempo === a.objetivo;
    if(a.tipo==="cuantos_llegan")
      acierto = resultado.cuantos_llegan === a.objetivo;

    if(acierto)
      ranking[a.usuario] += a.cantidad * (a.tipo==="posicion"?2:3);
  });

  res.json({mensaje:"Carrera procesada", ranking});
});

// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("Servidor activo en puerto",PORT));
