// backend/server.js
// Executar com: bun server.js
import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;
const AMAZON_DOMAIN = process.env.AMAZON_DOMAIN || "https://www.amazon.com";

// Permitir chamadas do frontend (em dev)
app.use(cors());
app.use(express.json());

// Helper: transforma caminhos relativos em URL absoluta para domínio Amazon
function makeAbsolute(href) {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  // evita links como javascript:... ou #
  if (href.startsWith("/")) return `${AMAZON_DOMAIN}${href}`;
  return `${AMAZON_DOMAIN}/${href}`;
}

/**
 * Rota: /api/scrape?keyword=seuTexto
 * Retorna JSON com array de itens { title, rating, reviewsCount, imageUrl, productUrl }
 */
app.get("/api/scrape", async (req, res) => {
  const keyword = (req.query.keyword || "").trim();
  if (!keyword) {
    return res.status(400).json({ error: "query parameter 'keyword' é obrigatório" });
  }

  try {
    const searchUrl = `${AMAZON_DOMAIN}/s?k=${encodeURIComponent(keyword)}`;

    // Requisição com header de browser; timeout para não travar
    const { data: html } = await axios.get(searchUrl, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    // Parse HTML com JSDOM
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Seletores robustos: busca por itens com data-asin e component-type s-search-result
    const items = Array.from(
      doc.querySelectorAll('div.s-main-slot div[data-asin][data-component-type="s-search-result"]')
    );

    const results = items.map((el) => {
      try {
        // Título
        const titleEl = el.querySelector("h2 a span");
        const title = titleEl ? titleEl.textContent.trim() : null;

        // Product URL (link do h2 a)
        const linkEl = el.querySelector("h2 a");
        let productUrl = linkEl ? linkEl.getAttribute("href") : null;
        productUrl = makeAbsolute(productUrl);

        // Imagem (vários possíveis seletores)
        let imgEl =
          el.querySelector("img.s-image") ||
          el.querySelector("img.a-dynamic-image") ||
          el.querySelector("img[data-image-latency]");
        const imageUrl = imgEl ? imgEl.getAttribute("src") || imgEl.getAttribute("data-src") : null;

        // Rating (texto tipo "4.5 out of 5 stars")
        let ratingText =
          el.querySelector('i span.a-icon-alt')?.textContent ||
          el.querySelector('span.a-icon-alt')?.textContent ||
          null;
        let rating = null;
        if (ratingText) {
          const m = ratingText.match(/([0-9.,]+)\s*out of\s*5/);
          if (m) {
            rating = parseFloat(m[1].replace(",", "."));
          } else {
            // tenta extrair primeiro número
            const m2 = ratingText.match(/([0-9.,]+)/);
            rating = m2 ? parseFloat(m2[1].replace(",", ".")) : null;
          }
        }

        // Número de avaliações (reviews count)
        let reviewsText =
          el.querySelector('a[href*="/product-reviews/"]')?.textContent ||
          el.querySelector('span.a-size-base')?.textContent ||
          null;
        let reviewsCount = null;
        if (reviewsText) {
          // extrai apenas dígitos e pontuação
          const m = reviewsText.replace(/\s+/g, "").match(/([0-9.,]+)/);
          if (m) {
            reviewsCount = parseInt(m[1].replace(/[.,]/g, ""));
          }
        }

        return {
          title,
          rating,
          reviewsCount,
          imageUrl,
          productUrl,
        };
      } catch (innerErr) {
        // ignora item ruim mas mantém processo
        return null;
      }
    })
    .filter(Boolean);

    // Retorna JSON
    return res.json({
      keyword,
      scrapedFrom: searchUrl,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("Erro ao raspar:", err.message ?? err);
    // Mensagem amigável para o frontend; inclui detalhes limitados
    return res.status(500).json({
      error: "Falha ao buscar/parsear a página. Verifique a rede e se a Amazon bloqueou a requisição.",
      details: err.message,
    });
  }
});

// Servir a pasta frontend build se você quiser (opcional)
// app.use(express.static("../frontend/dist"));

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}. Endpoint: http://localhost:${PORT}/api/scrape?keyword=mouse`);
});
