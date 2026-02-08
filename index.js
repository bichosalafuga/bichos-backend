// index.js (Node.js backend)
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let apuestas = [];
let lechuguines = 0;

app.get('/', (req, res) => {
  res.send('Backend de Bichos funcionando!');
});

app.post('/apuesta', (req, res) => {
  const data = req.body;
  let ganancia = 100;
  if(data.tipo === 'posicion') ganancia *= 2;
  else ganancia *= 3;

  lechuguines += ganancia;
  apuestas.push(data);

  res.json({
    mensaje: 'Apuesta registrada',
    ganancia,
    totalLechuguines: lechuguines
  });
});

app.get('/ranking', (req, res) => {
  res.json({ totalLechuguines: lechuguines });
});

app.get('/apuestas', (req, res) => {
  res.json(apuestas);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
