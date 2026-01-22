const base = "https://pokeapi.co/api/v2/pokemon/";
const ids = Array.from({ length: 9 }, (_, i) => i + 1); // 1..9

// Cache global para búsqueda
let allPokemonData = [];

async function obtenerPokemon(id) {
  const res = await fetch(`${base}${id}`);
  if (!res.ok) throw new Error(`Error al obtener Pokémon ${id}`);
  return res.json();
}

async function cargarPokedex() {
  try {
    mostrarCargando(true);
    // Fetch en paralelo con Promise.all
    allPokemonData = await Promise.all(ids.map(obtenerPokemon));
    renderCards(allPokemonData);
  } catch (e) {
    console.error(e);
    mostrarError("No fue posible obtener datos de la PokeAPI. Intenta nuevamente.");
  } finally {
    mostrarCargando(false);
  }
}

function renderCards(lista) {
  const grid = document.querySelector("#grid");
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center text-white">No se encontraron Pokémon.</div>';
    return;
  }

  for (const p of lista) {
    const nombre = p.name;
    const id = `#${String(p.id).padStart(3, "0")}`;
    // Imagen oficial con fallback
    const sprite = p.sprites?.other?.["official-artwork"]?.front_default
      || p.sprites?.front_default
      || "https://via.placeholder.com/150";

    // Mapeo de tipos
    const tiposHTML = p.types.map(t => {
      const typeName = t.type.name;
      // Usamos clases CSS específicas si existen (type-grass, etc.), sino fallback
      const colorClass = `type-${typeName}`;
      return `<span class="badge ${colorClass} me-1 text-uppercase">${typeName}</span>`;
    }).join("");

    grid.insertAdjacentHTML("beforeend", `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${sprite}" class="card-img-top" alt="${nombre}">
          <div class="card-body">
            <h5 class="card-title text-capitalize">${nombre}</h5>
            <p class="text-muted">${id}</p>
            <div class="d-flex">
              ${tiposHTML}
            </div>
          </div>
        </div>
      </div>
    `);
  }
}

function mostrarCargando(on) {
  document.getElementById("loader").hidden = !on;
  // Ocultar grid mientras carga
  if (on) document.getElementById("grid").innerHTML = "";
}

function mostrarError(msg) {
  const a = document.getElementById("alert");
  a.textContent = msg;
  a.hidden = false;
}

// Búsqueda
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  const filtrados = allPokemonData.filter(p => p.name.toLowerCase().includes(query));
  renderCards(filtrados);
});

// Iniciar app
document.addEventListener("DOMContentLoaded", cargarPokedex);
