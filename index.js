const express = require("express");
const cors = require("cors");

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
  { id: 1, nombre: "Babosín Turbo", lechuguines: 12 },
  { id: 2, nombre: "Caracol Manolo", lechuguines: 7 },
  { id: 3, nombre: "Limo Express", lechuguines: 3 }
];

app.get("/ranking", (req, res) => {
  res.json(usuarios.sort((a, b) => b.lechuguines - a.lechuguines));
});

