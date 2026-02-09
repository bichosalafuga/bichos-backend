// index.js

// ----------------------
// Datos de participantes por carrera
// ----------------------
const datosCarreras = {
  1: { participantes: ["Toreto","Sinhuellas","Gari","Arrastrado","Baboso Flash"] },
  2: { participantes: ["Sinhuellas","Toreto","Gari","Arrastrado","Baboso Flash"] },
  3: { participantes: ["Gari","Sinhuellas","Toreto","Arrastrado","Baboso Flash"] },
  4: { participantes: ["Toreto","Gari","Sinhuellas","Arrastrado","Baboso Flash"] },
  5: { participantes: ["Sinhuellas","Gari","Toreto","Arrastrado","Baboso Flash"] },
  6: { participantes: ["Gari","Toreto","Sinhuellas","Arrastrado","Baboso Flash"] },
  7: { participantes: ["Toreto","Sinhuellas","Gari","Arrastrado","Baboso Flash"] },
  8: { participantes: ["Baboso Flash","Toreto","Sinhuellas","Gari","Arrastrado"] }
};

// ----------------------
// Referencias a elementos del DOM
// ----------------------
const tipoApuesta = document.getElementById("tipoApuesta");
const objetivoContainer = document.getElementById("objetivoContainer");
const selectCarrera = document.getElementById("selectCarrera");
const apuestaForm = document.getElementById("apuestaForm");
const apuestaResult = document.getElementById("apuestaResult");
const rankingVisual = document.getElementById("rankingVisual");
const refreshRankingBtn = document.getElementById("refreshRanking");

// ----------------------
// Función: Actualizar inputs según tipo de apuesta
// ----------------------
function actualizarObjetivoInput() {
  const tipo = tipoApuesta.value;
  const carrera = selectCarrera.value;
  const datos = datosCarreras[carrera];
  if (!datos) return;

  objetivoContainer.innerHTML = "";

  if (tipo === "posicion") {
    const label = document.createElement("label");
    label.textContent = "Selecciona caracol y posición:";
    const selC = document.createElement("select"); selC.name = "caracol";
    datos.participantes.forEach(p => {
      const opt = document.createElement("option"); opt.value = p; opt.textContent = p; selC.appendChild(opt);
    });
    const selP = document.createElement("select"); selP.name = "posicion";
    [1,2,3,4,5].forEach(n => { const opt = document.createElement("option"); opt.value = n; opt.textContent = n; selP.appendChild(opt); });
    label.appendChild(selC); label.appendChild(selP);
    objetivoContainer.appendChild(label);
  } else if (tipo === "primer_movimiento" || tipo === "primer_salida") {
    const label = document.createElement("label"); label.textContent = "Selecciona caracol:";
    const sel = document.createElement("select"); sel.name = "caracol";
    datos.participantes.forEach(p => { const opt = document.createElement("option"); opt.value = p; opt.textContent = p; sel.appendChild(opt); });
    label.appendChild(sel); objetivoContainer.appendChild(label);
  } else if (tipo === "tiempo") {
    const label = document.createElement("label"); label.textContent = "Selecciona rango de tiempo:";
    const sel = document.createElement("select"); sel.name = "tiempo";
    ["0-10","10-20","20-30"].forEach(r => { const opt = document.createElement("option"); opt.value = r; opt.textContent = r; sel.appendChild(opt); });
    label.appendChild(sel); objetivoContainer.appendChild(label);
  } else if (tipo === "cuantos_llegan") {
    const label = document.createElement("label"); label.textContent = "Selecciona cuántos llegan:";
    const sel = document.createElement("select"); sel.name = "cantidadLlegan";
    [1,2,3,4,5].forEach(n => { const opt = document.createElement("option"); opt.value = n; opt.textContent = n; sel.appendChild(opt); });
    label.appendChild(sel); objetivoContainer.appendChild(label);
  }
}

// Escuchar cambios en el formulario
tipoApuesta.addEventListener("change", actualizarObjetivoInput);
selectCarrera.addEventListener("change", actualizarObjetivoInput);
actualizarObjetivoInput();

// ----------------------
// Función: Enviar apuesta por correo vía backend
// ----------------------
apuestaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const usuario = form.usuario.value.trim();
  const carrera = form.carrera.value;
  const tipo = form.tipo.value;
  const cantidad = form.cantidad.value;
  let objetivo = null;

  if (tipo === "posicion") objetivo = { nombre: form.caracol.value, posicion: form.posicion.value };
  else if (tipo === "primer_movimiento" || tipo === "primer_salida") objetivo = form.caracol.value;
  else if (tipo === "tiempo") objetivo = form.tiempo.value;
  else if (tipo === "cuantos_llegan") objetivo = form.cantidadLlegan.value;

  const datosApuesta = { usuario, carrera, tipo, objetivo, cantidad };

  try {
    await fetch("https://bichos-backend.onrender.com/enviar-apuesta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosApuesta)
    });
    apuestaResult.innerText = "✅ Apuesta enviada correctamente a bichosalafuga@gmail.com.";
    form.reset();
    actualizarObjetivoInput();
  } catch (err) {
    console.error(err);
    apuestaResult.innerText = "❌ Error al enviar la apuesta.";
  }
});

// ----------------------
// Función: Actualizar ranking visual
// ----------------------
async function actualizarRanking() {
  try {
    const res = await fetch("https://bichos-backend.onrender.com/ranking");
    const data = await res.json();
    rankingVisual.innerHTML = "";

    data.forEach(u => {
      const card = document.createElement("div");
      card.className = "ranking-card";
      card.innerHTML = `<h4>${u.nombre}</h4><p>${u.lech} 🥬</p>`;
      rankingVisual.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    rankingVisual.innerText = "❌ Error al cargar ranking.";
  }
}

// Botón para actualizar ranking manualmente
refreshRankingBtn.addEventListener("click", actualizarRanking);

// Inicializar ranking al cargar la página
actualizarRanking();

