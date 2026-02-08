// index.js (Node.js backend)
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Configuración inicial ---
const jugadores = ["Junma01","Jony67","Jorge07"];
let ranking = [0,0,0]; // lechuguines por jugador
const apuestas = []; // todas las apuestas
const babosasCarreras = Array(8).fill(100); // 8 carreras

// Resultados de las carreras (simulado, se actualizará al procesar)
const resultadosCarreras = [
  {posicion:["Toreto","Sinhuellas","Tro Gari","Arrastrado","Baboso Flash"], primer_movimiento:"Sinhuellas", primer_salida:"Toreto", tiempo:"10-20", cuantos_llegan:5},
  {}, {}, {}, {}, {}, {}, {}
];

// --- Rutas ---
app.get('/', (req,res) => {
  res.send('Backend de Bichos funcionando!');
});

// Registrar apuesta
app.post('/apuesta', (req,res)=>{
  const { usuario, carrera, tipo, objetivo, cantidad } = req.body;

  const indiceJugador = jugadores.indexOf(usuario);
  if(indiceJugador === -1) return res.status(400).json({error:"Usuario no válido"});

  const carreraIdx = carrera - 1;
  if(cantidad > babosasCarreras[carreraIdx]) return res.status(400).json({error:`No quedan suficientes babosas. Restan: ${babosasCarreras[carreraIdx]}`});

  // Restar babosas
  babosasCarreras[carreraIdx] -= cantidad;

  // Guardar apuesta
  apuestas.push({ usuario, carrera, tipo, objetivo, cantidad });

  res.json({
    mensaje: "Apuesta registrada",
    babosasRestantes: babosasCarreras[carreraIdx]
  });
});

// Obtener ranking ordenado
app.get('/ranking', (req,res)=>{
  const copia = ranking.map((lech,i)=>({nombre:jugadores[i], lech}));
  copia.sort((a,b)=>b.lech - a.lech);
  res.json(copia);
});

// Obtener todas las apuestas
app.get('/apuestas', (req,res)=>{
  res.json(apuestas);
});

// Procesar carrera: actualizar ranking según resultados
app.post("/procesar-carrera", (req,res)=>{
  const { carrera } = req.body;
  const idxCarrera = carrera-1;
  const resultado = resultadosCarreras[idxCarrera];

  if(!resultado || Object.keys(resultado).length===0) return res.status(400).json({error:"Carrera no definida o sin resultados"});

  apuestas.forEach(a=>{
    if(a.carrera == carrera){
      let acierto=false;
      if(a.tipo==="posicion") acierto = resultado.posicion[a.objetivo.posicion-1] === a.objetivo.nombre;
      else if(a.tipo==="primer_movimiento") acierto = resultado.primer_movimiento === a.objetivo;
      else if(a.tipo==="primer_salida") acierto = resultado.primer_salida === a.objetivo;
      else if(a.tipo==="tiempo") acierto = resultado.tiempo === a.objetivo;
      else if(a.tipo==="cuantos_llegan") acierto = resultado.cuantos_llegan === a.objetivo;

      if(acierto){
        const idxJugador = jugadores.indexOf(a.usuario);
        ranking[idxJugador] += a.cantidad * (a.tipo==="posicion"?2:3);
      }
    }
  });

  res.json({ mensaje:"Carrera procesada", ranking });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`Servidor escuchando en puerto ${PORT}`));

