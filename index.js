<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Bichos a la fuga</title>
<style>
  body { font-family: sans-serif; margin: 20px; }
  fieldset { margin-bottom: 20px; padding: 10px; }
  label { display: block; margin: 5px 0; }
  button { margin-top: 10px; }
  pre { background: #f0f0f0; padding: 10px; }
</style>
</head>
<body>

<header>
  <h1>🐌 Bichos a la fuga</h1>
  <p>El campeonato más lento del mundo</p>
</header>

<main>
  <p>Juego privado con fines lúdicos.<br>Apuestas con moneda ficticia sin valor económico.</p>

  <!-- FORMULARIO DE APUESTAS -->
  <fieldset>
    <legend>Apostar</legend>
    <form id="apuestaForm">
<label>Usuario:
  <select name="usuarioId" required>
    <option value="1">Toreto</option>
    <option value="2">Sinhuellas</option>
    <option value="3">Gari</option>
  </select>
</label>
      <label>Carrera ID: <input type="number" name="carreraId" value="1" required></label>
      <label>Tipo de apuesta:
        <select name="tipo" id="tipoApuesta" required>
          <option value="posicion">Posición final</option>
          <option value="primer_movimiento">Primer en moverse</option>
          <option value="primer_salida">Primer en salirse</option>
          <option value="tiempo">Tiempo de llegada</option>
        </select>
      </label>

      <div id="objetivoContainer"></div>

      <label>Cantidad de babosas: <input type="number" name="cantidad" required></label>
      <button type="submit">Apostar</button>
    </form>
    <pre id="apuestaResult"></pre>
  </fieldset>

  <!-- PANEL ADMIN -->
  <fieldset>
    <legend>Panel Admin</legend>
    <label>Carrera ID: <input type="number" id="adminCarreraId" value="1"></label>
    <label>Resultados JSON:</label>
    <textarea id="adminResultados" placeholder='[{"nombre":"Toreto","tiempoLlegada":5,"seMovioPrimero":true,"seSalio":false}]' rows="5" cols="60"></textarea>
    <button id="iniciarCarrera">Iniciar Carrera</button>
    <button id="finalizarCarrera">Finalizar Carrera</button>
    <pre id="adminResult"></pre>
  </fieldset>

  <!-- RANKING -->
  <fieldset>
    <legend>Ranking</legend>
    <button id="refreshRanking">Actualizar Ranking</button>
    <pre id="ranking"></pre>
  </fieldset>

  <!-- HISTORIAL DE APUESTAS -->
  <fieldset>
    <legend>Historial de apuestas</legend>
    <button id="refreshApuestas">Actualizar Apuestas</button>
    <pre id="historial"></pre>
  </fieldset>
</main>

<footer>
  <p>Juego privado · Moneda ficticia · Sin pagos ni premios reales</p>
</footer>

<script>
const API = "http://localhost:3000";

// PARTICIPANTES DE LA CARRERA
let participantes = [
  { nombre: "Toreto", descripcion: "Rápido y baboso" },
  { nombre: "Sinhuellas", descripcion: "No deja rastro" },
  { nombre: "Tro Gari", descripcion: "Ojo loco" },
  { nombre: "Arrastrado", descripcion: "Lento pero constante" },
  { nombre: "Baboso Flash", descripcion: "Rápido y resbaladizo" },
  { nombre: "Caracolín", descripcion: "Lento pero estratégico" }
];

const objetivoContainer = document.getElementById("objetivoContainer");
const tipoApuesta = document.getElementById("tipoApuesta");

// Función para actualizar los inputs según tipo de apuesta
function actualizarObjetivoInput() {
  const tipo = tipoApuesta.value;
  objetivoContainer.innerHTML = "";

  if (tipo === "posicion") {
    const label = document.createElement("label");
    label.textContent = "Selecciona caracol y posición:";
    const selectCaracol = document.createElement("select");
    selectCaracol.name = "caracol";
    participantes.forEach(p => {
      const option = document.createElement("option");
      option.value = p.nombre;
      option.textContent = `${p.nombre} — ${p.descripcion}`;
      selectCaracol.appendChild(option);
    });
    const selectPos = document.createElement("select");
    selectPos.name = "posicion";
    [1,2,3,4,5].forEach(n => {
      const option = document.createElement("option");
      option.value = n;
      option.textContent = n;
      selectPos.appendChild(option);
    });
    label.appendChild(selectCaracol);
    label.appendChild(selectPos);
    objetivoContainer.appendChild(label);
  }
  else if (tipo === "primer_movimiento" || tipo === "primer_salida") {
    const label = document.createElement("label");
    label.textContent = "Selecciona caracol:";
    const select = document.createElement("select");
    select.name = "caracol";
    participantes.forEach(p => {
      const option = document.createElement("option");
      option.value = p.nombre;
      option.textContent = `${p.nombre} — ${p.descripcion}`;
      select.appendChild(option);
    });
    label.appendChild(select);
    objetivoContainer.appendChild(label);
  }
  else if (tipo === "tiempo") {
    const label = document.createElement("label");
    label.textContent = "Caracol y tiempo máximo (minutos, hasta 30):";
    const inputNombre = document.createElement("input");
    inputNombre.name = "nombre";
    inputNombre.placeholder = "Nombre del caracol";
    const inputTiempo = document.createElement("input");
    inputTiempo.name = "tiempoMax";
    inputTiempo.type = "number";
    inputTiempo.min = 1;
    inputTiempo.max = 30;
    inputTiempo.placeholder = "Tiempo máximo";
    label.appendChild(inputNombre);
    label.appendChild(inputTiempo);
    objetivoContainer.appendChild(label);
  }
}

// Inicializar formulario
actualizarObjetivoInput();
tipoApuesta.addEventListener("change", actualizarObjetivoInput);

// Enviar apuesta
document.getElementById("apuestaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const tipo = form.tipo.value;
  let objetivo;

  if (tipo === "posicion") {
    objetivo = { nombre: form.caracol.value, posicion: parseInt(form.posicion.value) };
  } else if (tipo === "primer_movimiento" || tipo === "primer_salida") {
    objetivo = form.caracol.value;
  } else if (tipo === "tiempo") {
    objetivo = { nombre: form.nombre.value, tiempoMax: parseInt(form.tiempoMax.value) };
  }

  const data = {
    usuarioId: parseInt(form.usuarioId.value),
    carreraId: parseInt(form.carreraId.value),
    tipo,
    objetivo,
    cantidad: parseInt(form.cantidad.value)
  };

  const res = await fetch(`${API}/apostar`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
  const json = await res.json();
  document.getElementById("apuestaResult").innerText = JSON.stringify(json, null, 2);
});

// PANEL ADMIN
document.getElementById("iniciarCarrera").addEventListener("click", async () => {
  const carreraId = parseInt(document.getElementById("adminCarreraId").value);
  const res = await fetch(`${API}/admin/carrera/iniciar`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ carreraId })
  });
  document.getElementById("adminResult").innerText = JSON.stringify(await res.json(), null, 2);
});

document.getElementById("finalizarCarrera").addEventListener("click", async () => {
  const carreraId = parseInt(document.getElementById("adminCarreraId").value);
  const resultadosText = document.getElementById("adminResultados").value;
  let resultados;
  try { resultados = JSON.parse(resultadosText); } 
  catch(e) { alert("JSON inválido"); return; }

  const res = await fetch(`${API}/admin/carrera/finalizar`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ carreraId, resultados })
  });
  document.getElementById("adminResult").innerText = JSON.stringify(await res.json(), null, 2);
});

// RANKING
document.getElementById("refreshRanking").addEventListener("click", async () => {
  const res = await fetch(`${API}/ranking`);
  document.getElementById("ranking").innerText = JSON.stringify(await res.json(), null, 2);
});

// HISTORIAL DE APUESTAS
document.getElementById("refreshApuestas").addEventListener("click", async () => {
  const res = await fetch(`${API}/apuestas`);
  document.getElementById("historial").innerText = JSON.stringify(await res.json(), null, 2);
});
</script>

</body>
</html>


