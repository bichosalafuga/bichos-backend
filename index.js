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
          <option value="1">Jugador 1</option>
          <option value="2">Jugador 2</option>
          <option value="3">Jugador 3</option>
        </select>
      </label>

      <label>Carrera ID: <input type="number" name="carreraId" value="1" required></label>
      <label>Tipo de apuesta:
        <select name="tipo" id="tipoApuesta" required>
          <option value="posicion">Posición final</option>
          <option value="primer_movimiento">Primer en moverse</option>
          <option value="primer_salida">Primer en salirse</option>
          <option value="tiempo">Tiempo de llegada</option>
          <option value="cuantos_llegan">Cuántos llegan</option>
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
  { nombre: "Baboso Flash", descripcion: "Rápido y resbaladizo" }
];

const carrerasNombres = [
  "Escalada Pegada",
  "Gran Desliz",
  "Baba Rápida",
  "Trofeo Lento",
  "Flash Final",
  "Maratón Babosa",
  "Carrera Sin Huella",
  "Desafío Arrastrado"
];

let lechuguines = 0;

const objetivoContainer = document.getElementById("objetivoContainer");
const tipoApuesta = document.getElementById("tipoApuesta");

// Función para actualizar inputs según tipo de apuesta
function actualizarObjetivoInput() {
  const tipo = tipoApuesta.value;
  objetivoContainer.innerHTML = "";

  if(tipo === "posicion") {
    const label = document.createElement("label");
    label.textContent = "Selecciona 1º, 2º o 3º lugar:";
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
    [1,2,3].forEach(n => {
      const option = document.createElement("option");
      option.value = n;
      option.textContent = n;
      selectPos.appendChild(option);
    });
    label.appendChild(selectCaracol);
    label.appendChild(selectPos);
    objetivoContainer.appendChild(label);
  }
  else if(tipo === "primer_movimiento" || tipo === "primer_salida") {
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
  else if(tipo === "tiempo") {
    const label = document.createElement("label");
    label.textContent = "Selecciona rango de tiempo:";
    const selectTiempo = document.createElement("select");
    selectTiempo.name = "tiempo";
    ["0-10","10-20","20-30"].forEach(r => {
      const option = document.createElement("option");
      option.value = r;
      option.textContent = r;
      selectTiempo.appendChild(option);
    });
    label.appendChild(selectTiempo);
    objetivoContainer.appendChild(label);
  }
  else if(tipo === "cuantos_llegan") {
    const label = document.createElement("label");
    label.textContent = "Selecciona cuántos llegan:";
    const select = document.createElement("select");
    select.name = "cantidadLlegan";
    [1,2,3,4,5].forEach(n => {
      const option = document.createElement("option");
      option.value = n;
      option.textContent = n;
      select.appendChild(option);
    });
    label.appendChild(select);
    objetivoContainer.appendChild(label);
  }
}

actualizarObjetivoInput();
tipoApuesta.addEventListener("change", actualizarObjetivoInput);

// Enviar apuesta
document.getElementById("apuestaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const tipo = form.tipo.value;
  let objetivo;

  if(tipo === "posicion") {
    objetivo = { nombre: form.caracol.value, posicion: parseInt(form.posicion.value) };
  }
  else if(tipo === "primer_movimiento" || tipo === "primer_salida") {
    objetivo = form.caracol.value;
  }
  else if(tipo === "tiempo") {
    objetivo = form.tiempo.value;
  }
  else if(tipo === "cuantos_llegan") {
    objetivo = parseInt(form.cantidadLlegan.value);
  }

  const data = {
    usuarioId: parseInt(form.usuarioId.value),
    carreraId: parseInt(form.carreraId.value),
    tipo,
    objetivo,
    cantidad: parseInt(form.cantidad.value)
  };

  // Aquí se haría fetch a backend
  // Simulación de cálculo de lechuguines
  let ganancia = 100; // Babosas base
  if(tipo === "posicion") ganancia *= 2;
  else ganancia *= 3; // Triplica para otros tipos

  lechuguines += ganancia;

  document.getElementById("apuestaResult").innerText = `
    Apuesta enviada:\n${JSON.stringify(data,null,2)}
    \nGanancia simulada: ${ganancia} lechuguines
    \nTotal acumulado: ${lechuguines} lechuguines
  `;
});

// PANEL ADMIN (simulado)
document.getElementById("iniciarCarrera").addEventListener("click", () => {
  const carreraId = parseInt(document.getElementById("adminCarreraId").value);
  alert(`Carrera ${carrerasNombres[carreraId-1] || "Desconocida"} iniciada`);
});

document.getElementById("finalizarCarrera").addEventListener("click", () => {
  const carreraId = parseInt(document.getElementById("adminCarreraId").value);
  alert(`Carrera ${carrerasNombres[carreraId-1] || "Desconocida"} finalizada`);
});

// Ranking e historial simulados
document.getElementById("refreshRanking").addEventListener("click", () => {
  document.getElementById("ranking").innerText = `Lechuguines acumulados: ${lechuguines}`;
});
document.getElementById("refreshApuestas").addEventListener("click", () => {
  document.getElementById("historial").innerText = `Simulación de apuestas realizadas. Total lechuguines: ${lechuguines}`;
});
</script>

</body>
</html>
