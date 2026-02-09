const backendURL = "https://bichos-backend.onrender.com";

// Elementos DOM
const rankingContainer = document.getElementById("ranking");
const ultimasCarrerasContainer = document.getElementById("ultimasCarreras");

// Función para cargar ranking
async function cargarRanking() {
    if (!rankingContainer) return console.warn("No se encontró el contenedor de ranking");
    rankingContainer.textContent = "Cargando ranking...";
    try {
        const res = await fetch(`${backendURL}/ranking`);
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Formato de datos incorrecto");
        
        rankingContainer.innerHTML = "";
        data.forEach((u, i) => {
            const p = document.createElement("p");
            p.textContent = `#${i + 1} ${u.nombre} - ${u.lech} lechuguines`;
            rankingContainer.appendChild(p);
        });
    } catch (e) {
        console.error("Error al cargar ranking:", e);
        rankingContainer.textContent = "❌ Error cargando ranking. Revisa la consola.";
    }
}

// Función para cargar últimas carreras
async function cargarUltimasCarreras() {
    if (!ultimasCarrerasContainer) return console.warn("No se encontró el contenedor de carreras");
    ultimasCarrerasContainer.textContent = "Cargando carreras...";
    try {
        const res = await fetch(`${backendURL}/carreras`);
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        const carreras = await res.json();
        if (!Array.isArray(carreras)) throw new Error("Formato de datos incorrecto");
        
        ultimasCarrerasContainer.innerHTML = "";
        if (carreras.length === 0) {
            ultimasCarrerasContainer.textContent = "No hay carreras disponibles";
            return;
        }

        carreras.forEach(c => {
            const div = document.createElement("div");
            div.style.marginBottom = "15px";
            div.innerHTML = `
                <h3>${c.nombre}</h3>
                <p>Ganador: ${c.ganador || "Pendiente"}</p>
                <p>Participantes: ${c.participantes?.join(", ") || "Sin participantes"}</p>
            `;
            ultimasCarrerasContainer.appendChild(div);
        });
    } catch (e) {
        console.error("Error al cargar carreras:", e);
        ultimasCarrerasContainer.textContent = "❌ Error cargando las carreras. Revisa la consola.";
    }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    cargarRanking();
    cargarUltimasCarreras();
});


