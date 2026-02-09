// index.js
const backendURL = "https://bichos-backend.onrender.com";

// Elementos DOM
const rankingContainer = document.getElementById("ranking");
const ultimasCarrerasContainer = document.getElementById("ultimasCarreras");

// Función para cargar el ranking
async function cargarRanking() {
    try {
        const res = await fetch(`${backendURL}/ranking`);
        if(!res.ok) throw new Error("Error al obtener ranking");
        const data = await res.json();
        rankingContainer.innerHTML = "";
        data.forEach((u, i) => {
            const p = document.createElement("p");
            p.textContent = `#${i+1} ${u.nombre} - ${u.lech} lechuguines`;
            rankingContainer.appendChild(p);
        });
    } catch (e) {
        console.error(e);
        rankingContainer.textContent = "Error cargando ranking";
    }
}

// Función para mostrar últimas carreras
async function cargarUltimasCarreras() {
    try {
        const res = await fetch(`${backendURL}/carreras`);
        if(!res.ok) throw new Error("Error al obtener carreras");
        const carreras = await res.json();
        ultimasCarrerasContainer.innerHTML = "";
        if(carreras.length === 0){
            ultimasCarrerasContainer.textContent = "No hay carreras disponibles";
            return;
        }
        carreras.forEach(c => {
            const div = document.createElement("div");
            div.style.marginBottom = "15px";
            div.innerHTML = `
                <h3>${c.nombre}</h3>
                <p>Ganador: ${c.ganador || "Pendiente"}</p>
                <p>Participantes: ${c.participantes.join(", ")}</p>
            `;
            ultimasCarrerasContainer.appendChild(div);
        });
    } catch(e) {
        console.error(e);
        ultimasCarrerasContainer.textContent = "Error cargando carreras";
    }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    cargarRanking();
    cargarUltimasCarreras();
});


