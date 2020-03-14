/////////////////////////////////////
// apiServices
class TmdbServices {
  constructor() {
    this._baseUrl = "https://api.themoviedb.org/3";
    this._apiKey = "75cc9954806732db3c51dc6240a975be";
  }

  async getResource(url) {
    try {
      const res = await fetch(this._baseUrl + url);
      return await res.json();
    } catch (e) {
      console.log(e);
    }
  }

  async getTrendingMovies(mediaType = "all", timeWindow = "day") {
    const res = await this.getResource(
      `/trending/${mediaType}/${timeWindow}?api_key=${this._apiKey}`
    );

    return res.results.map(this._normalizeShows);
  }

  async searchMovies(movie) {
    const res = await this.getResource(
      `/search/movie?api_key=${
        this._apiKey
      }&language=en-US&query=${movie}&page=1&include_adult=false`
    );

    return res.results.map(this._normalizeShows);
  }

  async getRecomendation(id) {
    const res = await this.getResource(
      `/movie/${id}/recommendations?api_key=${
        this._apiKey
      }&language=en-US&page=1`
    );

    return res.results.map(this._normalizeShows);
  }

  _normalizeShows({ id, title, overview, poster_path }) {
    return {
      id,
      title,
      overview,
      posterPath: poster_path
    };
  }
}

const tmdbServices = new TmdbServices();

/////////////////////////////////////
// app

const form = document.getElementById("form");
const input = document.getElementById("input");
const container = document.getElementById("container");

container.addEventListener("click", listItemClick);
form.addEventListener("submit", search);

let activeList = null;

function addList(list) {
  container.innerHTML = list;
}

async function getTrend() {
  addList(createLoader());

  const res = await tmdbServices.getTrendingMovies();
  activeList = res;
  const listItems = activeList.map(createListItem).join("");
  const trendsList = createListContainer(listItems);

  addList(trendsList);
}

async function search(e) {
  e.preventDefault();

  addList(createLoader());

  if (input.value.trim()) {
    const res = await tmdbServices.searchMovies(input.value);

    activeList = res;

    if (res.length > 0) {
      const showListItems = activeList.map(createListItem).join("");
      const showList = createListContainer(showListItems);

      addList(showList);
    } else {
      addList(createError());
    }

    input.value = "";
  } else {
    getTrend();
  }
}

async function listItemClick(e) {
  if (e.target.dataset.id) {
    addList(createLoader());

    const itemId = +e.target.dataset.id;

    const selectedShow = activeList.find(item => item.id === itemId);
    const show = createShowItem(selectedShow);
    const recomendation = await findRecomendation(itemId);

    addList(show + `<h3>Recomendation</h3>` + recomendation);
  }
}

async function findRecomendation(id) {
  const res = await tmdbServices.getRecomendation(id);

  if (res.length > 0) {
    activeList = res.slice(0, 3);

    const recomedationItems = activeList.map(createListItem).join("");
    const recomedation = createListContainer(recomedationItems);

    return recomedation;
  } else {
    return createError();
  }
}

/////////////////////////////////////
// create functions

function createShowItem({ title, overview, posterPath }) {
  return `
    <div class='show-item'>
      <img
        src="https://image.tmdb.org/t/p/w1280${posterPath}"
        width="200"
        alt=${title}
      />
      <div>
        <h2>${title || "Sorry, without title"}</h2>
        <p>
          <strong>Overview: </strong>
          ${overview || "Sorry, without overview"}
        </p>
      </div>
    </div>
  `;
}

function createListItem({ id, title }) {
  return `
    <li data-id=${id} class="show-list__item">
      ${title || "Sorry, without title"}
    </li>
  `;
}

function createLoader() {
  return `<h2>Loading...</h2>`;
}

function createListContainer(listItem) {
  return `
    <ul class="show-list">
      ${listItem}
    </ul>
  `;
}

function createError() {
  return `
    <h3 class="show-list">
      Sorry, nothing was found
    </h3>
  `;
}

/////////////////////////////////////

getTrend();
