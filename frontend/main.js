// frontend/src/main.js
const btn = document.getElementById("scrapeBtn");
const input = document.getElementById("keyword");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

function showStatus(text) {
  statusEl.textContent = text;
}

function clearResults() {
  resultsEl.innerHTML = "";
}

function renderCard(item) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img src="${item.imageUrl || ''}" alt="${item.title || ''}" />
    <h3>${item.title || "Sem título"}</h3>
    <div class="meta">
      <div>⭐ ${item.rating ?? "N/A"} • ${item.reviewsCount ?? "0"} avaliações</div>
    </div>
    ${item.productUrl ? `<a href="${item.productUrl}" target="_blank" rel="noopener">Ver no site</a>` : ''}
  `;
  return div;
}

btn.addEventListener("click", async () => {
  const keyword = input.value.trim();
  if (!keyword) {
    showStatus("Digite uma palavra-chave.");
    return;
  }
  clearResults();
  showStatus("Buscando... (pode demorar alguns segundos)");

  try {
    // Chama o backend (ajuste porta se necessário)
    const resp = await fetch(`/api/scrape?keyword=${encodeURIComponent(keyword)}`);
    if (!resp.ok) {
      const err = await resp.json().catch(()=>({error:resp.statusText}));
      showStatus(`Erro: ${err.error || resp.statusText}`);
      return;
    }
    const json = await resp.json();
    showStatus(`Encontrados ${json.count} resultados para "${json.keyword}".`);
    if (Array.isArray(json.results) && json.results.length) {
      json.results.forEach(item => {
        resultsEl.appendChild(renderCard(item));
      });
    } else {
      resultsEl.innerHTML = "<div>Nenhum resultado encontrado.</div>";
    }
  } catch (err) {
    console.error(err);
    showStatus("Erro na requisição. Veja o console do navegador.");
  }
});

// Permitir submeter pressionando Enter
input.addEventListener("keydown", (e)=> {
  if (e.key === "Enter") btn.click();
});
