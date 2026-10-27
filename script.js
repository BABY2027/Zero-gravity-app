
const form = document.querySelector("#searchForm");
const queryInput = document.querySelector("#query");
const searchButton = document.querySelector("#searchButton");
const statusBox = document.querySelector("#status");
const resultsBox = document.querySelector("#results");

// Wikimedia public API
const API_URL = "https://en.wikipedia.org/w/api.php";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = queryInput.value.trim();

  if (!query) {
    statusBox.textContent = "Tafadhali andika unachotafuta.";
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Inatafuta...";
  statusBox.textContent = `Inatafuta: "${query}"`;
  resultsBox.replaceChildren();

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "0",
    gsrlimit: "10",
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    exsentences: "3",
    inprop: "url",
    format: "json",
    origin: "*"
  });

  try {
    const response = await fetch(
      `${API_URL}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const pages = Object.values(
      data.query?.pages || {}
    ).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    if (pages.length === 0) {
      statusBox.textContent =
        "Hakuna matokeo. Jaribu maneno tofauti.";
      return;
    }

    statusBox.textContent =
      `Matokeo ${pages.length} yamepatikana. Chanzo: Wikipedia.`;

    for (const page of pages) {
      const article = document.createElement("article");
      article.className = "result";

      const heading = document.createElement("h2");
      const link = document.createElement("a");

      link.href =
        page.fullurl ||
        `https://en.wikipedia.org/?curid=${page.pageid}`;

      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = page.title;

      heading.appendChild(link);

      const summary = document.createElement("p");

      summary.textContent =
        page.extract ||
        "Muhtasari haupatikani. Fungua makala kwa maelezo zaidi.";

      const source = document.createElement("div");
      source.className = "source";
      source.textContent =
        "WIKIPEDIA · Fungua makala kusoma zaidi";

      article.append(heading, summary, source);
      resultsBox.appendChild(article);
    }

  } catch (error) {
    console.error("Zero Gravity search error:", error);

    statusBox.textContent =
      "Imeshindikana kupata matokeo. " +
      "Hakikisha una intaneti kisha jaribu tena.";

  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Tafuta";
  }
});