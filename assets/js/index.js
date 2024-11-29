document.addEventListener('DOMContentLoaded', function () {

checkWindowSize();
addLoadMoreLogic();

//Adding a listiner to detect window size changing
window.addEventListener("resize", checkWindowSize);

  fetchBestMovie();
  fetchGenres();

  fetchBestMovieOfGenre("comedy", ".best-movies-genre-comedy");
  fetchBestMovieOfGenre("crime", ".best-movies-genre-animation");
  fetchBestMovieOfGenre("family", ".best-movies-selected-genre");
  const detailsButton = document.querySelector('.best-movie-details');
  console.log(detailsButton)

  detailsButton.addEventListener('click', function () {
      const detailsButton_data_url = detailsButton.getAttribute("data-url");
      console.log(detailsButton_data_url);
      fetchBestMovieDetails(detailsButton_data_url);
  });


});

function handleDetailsClick(button) {
  const dataUrl = button.getAttribute("data-url");
  if (dataUrl) {
    this.fetchBestMovieDetails(dataUrl);
  } else {
    console.error("URL des détails manquante pour ce bouton");
  }
}

//Function use to hide or display some content base on windows size
function checkWindowSize() {
const w = window.innerWidth;

const moviesContainers = document.querySelectorAll('#movies-container');

moviesContainers.forEach(moviesContainer => {
  const rows = moviesContainer.querySelectorAll('.row.d-flex.justify-content-between.align-items-center');

  rows.forEach(row => {
    const cols = row.querySelectorAll('.col-lg-4');
    const totalCols = cols.length;

    const loadMoreBtn = moviesContainer.querySelector('.load-more-btn');
    const loadLessBtn = moviesContainer.querySelector('.load-less-btn');

    cols.forEach(col => col.classList.remove('tablet-hide', 'phone-hide'));
    if (loadMoreBtn) loadMoreBtn.classList.add('d-none');
    if (loadLessBtn) loadLessBtn.classList.add('d-none');

    if (w >= 768 && w <= 991) {
      // Tablette : cacher les 2 dernières colonnes
      for (let i = totalCols - 2; i < totalCols; i++) {
        if (i >= 0) cols[i].classList.add('tablet-hide');
      }
      if (loadMoreBtn) loadMoreBtn.classList.remove('d-none');
    } else if (w < 768) {
      for (let i = totalCols - 4; i < totalCols; i++) {
        if (i >= 0) cols[i].classList.add('phone-hide');
      }
      if (loadMoreBtn) loadMoreBtn.classList.remove('d-none');
    }else {
      cols.forEach(col => {
        col.style.display = '';
      });

      if (loadMoreBtn) loadMoreBtn.classList.add('d-none');
      if (loadLessBtn) loadLessBtn.classList.add('d-none');
    }
  });
});
}

//Logic of load more and load less for each section
function addLoadMoreLogic() {
const moviesContainers = document.querySelectorAll('#movies-container');

moviesContainers.forEach(moviesContainer => {
  const rows = moviesContainer.querySelectorAll('.row.d-flex.justify-content-between.align-items-center');
  const loadMoreBtn = moviesContainer.querySelector('.load-more-btn');
  const loadLessBtn = moviesContainer.querySelector('.load-less-btn');
  rows.forEach(row => {

    if (loadMoreBtn && loadLessBtn) {
      loadMoreBtn.addEventListener('click', () => {
        const hiddenCols = row.querySelectorAll('.tablet-hide, .phone-hide');
        hiddenCols.forEach(col => (col.style.display = 'block'));
        loadMoreBtn.classList.add('d-none');
        loadLessBtn.classList.remove('d-none');
      });

      loadLessBtn.addEventListener('click', () => {
        const hiddenCols = row.querySelectorAll('.tablet-hide, .phone-hide');
        hiddenCols.forEach(col => (col.style.display = 'none'));
        loadMoreBtn.classList.remove('d-none');
        loadLessBtn.classList.add('d-none');
      });
    }
  });
});
}


async function fetchBestMovie() {
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes`
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    const json = await response.json();

    if (json && json.results && json.results.length > 0) {
      const bestMovie = json.results[0];
    const descriptionResponse = await fetch(bestMovie.url);
    if (!descriptionResponse.ok) {
      throw new Error(`Erreur HTTP pour la description : ${descriptionResponse.status}`);
    }

    const descriptionJson = await descriptionResponse.json();

    bestMovie.description = descriptionJson.description;
    console.log("Détails du film :", bestMovie);
      updateBestMovieSection(bestMovie);
    }
    return json;
  } catch (error) {
    console.error(`Impossible d'obtenir les films : ${error}`);
    return null;
  }
}

//fetch a best movie section of a specific genre
async function fetchBestMovieOfGenre(genre, container_id) {
try {
  let response = await fetch(
    `http://localhost:8000/api/v1/titles/?genre=${genre}&sort_by=-imdb_score,-votes`
  );

  if (!response.ok) {
    alert(`Une erreur est survenue (${response.status}). Veuillez réessayer plus tard.`);
    throw new Error(`Erreur HTTP : ${response.status}`);
  }

  let json = await response.json();
  console.log("Initial count:", json.results.length);

  // Ensure we have at least 6 movies
  while (json.results.length < 6 && json.next) {
    console.log("Fetching more movies from:", json.next);

    const nextResponse = await fetch(json.next);
    if (!nextResponse.ok) {
      throw new Error(`Erreur HTTP pour la page suivante : ${nextResponse.status}`);
    }

    const nextJson = await nextResponse.json();
    json.results.push(...nextJson.results);
  }

  console.log("Final count:", json.results.length);

  if (json && json.results && json.results.length > 0) {
    const movies = json.results.slice(0, 6); // Take the first 6 movies
    updateBestMovieGenreSection(movies,container_id);
    return movies;
  }
} catch (error) {
  console.error(`Impossible d'obtenir les films : ${error}`);
  return null;
}
}

//Update the best movie section of a specific genre
function updateBestMovieGenreSection(movies, container_id) {
const comedyGenreSection = document.querySelector(container_id);
const container = comedyGenreSection.querySelector('.row');
const template = document.querySelector('#movie-card-template');

movies.forEach(movie => {
  const clone = template.content.cloneNode(true);

  const img = clone.querySelector('img');
  const title = clone.querySelector('.title');
  const button = clone.querySelector('button');

  img.src = movie.image_url || 'https://img.freepik.com/vecteurs-premium/vecteur-icone-image-par-defaut-page-image-manquante-pour-conception-site-web-application-mobile-aucune-photo-disponible_87543-11093.jpg?w=740'; // Mettre une image par défaut si aucune image
  img.alt = movie.title;
  title.textContent = movie.title;
  button.dataset.url = movie.url;

  container.appendChild(clone);
});
}

//Fecth the movies of selected genre
function fetchMoviesOfSelectedGenre() {
const selectedValue = document.getElementById("genresList").value;
console.log(selectedValue);

const bestMoviesContainer = document.querySelector(".best-movies-selected-genre");
const movieContainer = bestMoviesContainer.querySelector('.row');

movieContainer.innerHTML = '';

fetchBestMovieOfGenre(selectedValue, ".best-movies-selected-genre");
}

// Update the best movie section without taking account of the genre
function updateBestMovieSection(movie) {
  console.log(movie);

  const bestMovieImage = document.getElementById("best-movie-image");
  const bestMovieTitle = document.querySelector(".best-movie-body h1");
  const detailsButton = document.getElementById("best-movie-details");
  const description = document.getElementById("best-movie-description");

  console.log(bestMovieImage);

  bestMovieImage.src = movie.image_url;
  bestMovieTitle.textContent = movie.title;
  detailsButton.setAttribute('data-url', movie.url);
  description.textContent = movie.description
}

//Fetch all genres by taking tha page in account
async function fetchGenres() {
let allResults = [];
let currentPage = 1;
const baseUrl = `http://localhost:8000/api/v1/genres`;

try {
  while (true) {
    const url = `${baseUrl}/?page=${currentPage}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const json = await response.json();

    if (json && json.results) {
      allResults = allResults.concat(json.results);
    }

    if (!json.next) {
      break; // Sortir de la boucle si pas de page suivante
    }

    currentPage++;
  }
    fillSelectElement(allResults);

  return allResults;
} catch (error) {
  console.error(`Impossible d'obtenir les genres : ${error}`);
  return null;
}
}

//Fill select element with genres
function fillSelectElement(genresList){
select = document.getElementById("genresList");
genresList.forEach((genre) =>{
option = document.createElement('option')
option.text = genre.name
select.add(option)
}
)
}

//Fetch Movie Details
async function fetchBestMovieDetails(movie_url) {
  try {
    const response = await fetch(
      movie_url
    );
    console.log('URL récupérée :', movie_url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    const json = await response.json();
      updateModal(json);
    return json;
  } catch (error) {
  console.error("Impossible d'obtenir les films :", error); // Log the full error
  return null;
  }
}
// Update modal informations
function updateModal(movie) {
console.log(movie)
document.getElementById("staticBackdropLabel").textContent = movie.title;

document.getElementById("modal-secondary-image").src = movie.image_url;
console.log(document.getElementById("modal-secondary-image"))
document.getElementById("modal-secondary-image").alt = movie.title;

document.getElementById("modal-info").innerHTML = `<strong>${movie.year} - ${movie.genres.join(', ')}</strong>`;
document.getElementById("modal-rating").textContent = `${movie.rated} - ${movie.duration} minutes (${movie.countries})`;
document.getElementById("modal-score").textContent = `IMDB score: ${movie.imdb_score}/10`;

document.getElementById("modal-directors").innerHTML = `<strong>Réalisé par:</strong> ${movie.directors.join(', ')}`;
document.getElementById("modal-summary").textContent = movie.description;
// document.getElementById("modal-cast").innerHTML = `<strong>Avec:</strong> ${movie.cast.join(', ')}`;
}



