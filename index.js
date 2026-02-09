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
// Referencias DOM
// ----------------------
const tipoApuesta = document.getElementById("tipoApuesta");
const objetivoContainer = document.getElementById("objetivoContainer");
const selectCarrera = document.getElementById("selectCarrera");
const apuestaForm = document.getElementById("apuestaForm");
const apuestaResult = document.getElementById("apuestaResult");

// ----------------------
// Función: actualizar inputs según tipo de apuesta
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
      const opt = document.createElement("option"); opt.value = p; opt.textContent = p;
      selC.appendChild(opt);
    });
    const selP = document.createElement("select"); selP.name = "posicion";
    [1,2,3,4,5].forEach(n => { const opt = document.createElement("option"); opt.value = n; opt.textContent = n; selP.appendChild(opt); });
    label.appendChild(selC); label.appendChild(selP);
    objetivoContainer.appendChild(label);
  } else if (tipo === "primer_movimiento" || tipo === "primer_salida") {
    const label = document.createElement("label");
    label.textContent = "Selecciona caracol:";
    const sel = document.createElement("select"); sel.name = "caracol";
    datos.participantes.forEach(p => { const opt = document.createElement("option"); opt.value = p; opt.textContent = p; sel.appendChild(opt); });
    label.appendChild(sel);
    objetivoContainer.appendChild(label);
  } else if (tipo === "tiempo") {
    const label = document.createElement("label");
    label.textContent = "Selecciona rango de tiempo:";
    const sel = document.createElement("select"); sel.name = "tiempo";
    ["0-10","10-20","20-30"].forEach(r => { const opt = document.createElement("option"); opt.value = r; opt.textContent = r; sel.appendChild(opt); });
    label.appendChild(sel);
    objetivoContainer.appendChild(label);
  } else if (tipo === "cuantos_llegan") {
    const label = document.createElement("label");
    label.textContent = "Selecciona cuántos llegan:";
    const sel = document.createElement("select"); sel.name = "cantidadLlegan";
    [1,2,3,4,5].forEach(n => { const opt = document.createElement("option"); opt.value = n; opt.textContent = n; sel.appendChild(opt); });
    label.appendChild(sel);
    objetivoContainer.appendChild(label);
  }
}

// Inicializar inputs dinámicos
tipoApuesta.addEventListener("change", actualizarObjetivoInput);
selectCarrera.addEventListener("change", actualizarObjetivoInput);
actualizarObjetivoInput();

// ----------------------
// Función: enviar apuesta por mailto
// ----------------------
apuestaForm.addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target;

  const usuario = form.usuario.value.trim();
  const carrera = selectCarrera.options[selectCarrera.selectedIndex].text;
  const tipo = tipoApuesta.options[tipoApuesta.selectedIndex].text;
  const cantidad = form.cantidad.value;

  let objetivo = "";
  if (tipoApuesta.value === "posicion") {
    objetivo = `Caracol: ${form.caracol.value}, Posición: ${form.posicion.value}`;
  } else if (tipoApuesta.value === "primer_movimiento" || tipoApuesta.value === "primer_salida") {
    objetivo = form.caracol.value;
  } else if (tipoApuesta.value === "tiempo") {
    objetivo = form.tiempo.value;
  } else if (tipoApuesta.value === "cuantos_llegan") {
    objetivo = form.cantidadLlegan.value;
  }

  // Construir mailto
  const subject = encodeURIComponent(`Apuesta de ${usuario}`);
  const body = encodeURIComponent(
    `Nueva apuesta registrada:\n\nUsuario: ${usuario}\nCarrera: ${carrera}\nTipo de apuesta: ${tipo}\nObjetivo: ${objetivo}\nCantidad de babosas: ${cantidad}`
  );

  // Abrir cliente de correo
  window.location.href = `mailto:bichosalafuga@gmail.com?subject=${subject}&body=${body}`;

  apuestaResult.textContent = "📧 Se ha abierto tu cliente de correo para enviar la apuesta.";
  form.reset();
  actualizarObjetivoInput();
});


