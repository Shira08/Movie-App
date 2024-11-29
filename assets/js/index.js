import { APIClient } from './APIClient.js';
import { UIManager } from './UIManager.js';

const api = new APIClient();
const updater = new UIManager();

document.addEventListener('DOMContentLoaded',  function () {
    api.fetchBestMovie();
    api.fetchGenres();

  api.fetchBestMovieOfGenre("comedy", ".best-movies-genre-comedy");
  api.fetchBestMovieOfGenre("crime", ".best-movies-genre-animation");
  api.fetchBestMovieOfGenre("family", ".best-movies-selected-genre");

  const detailsButton = document.querySelector('.best-movie-details');
  detailsButton.addEventListener('click', () => {
    const dataUrl = detailsButton.getAttribute("data-url");
    api.fetchBestMovieDetails(dataUrl);
  });


  // Initialisation
  updater.checkWindowSize();
  updater.addLoadMoreLogic();

  // Ajout d'un écouteur d'événement pour détecter les redimensionnements
  window.addEventListener("resize", updater.checkWindowSize);

  window.handleDetailsClick = handleDetailsClick;
  window.fetchMoviesOfSelectedGenre = fetchMoviesOfSelectedGenre;

});
function handleDetailsClick(button) {
  const dataUrl = button.getAttribute('data-url');
  if (dataUrl) {
    api.fetchBestMovieDetails(dataUrl);
  } else {
    console.error('URL des détails manquante pour ce bouton');
  }
}

//Fecth the movies of selected genre
function fetchMoviesOfSelectedGenre() {
const selectedValue = document.getElementById("genresList");
 const selectedText = selectedValue.options[selectedValue.selectedIndex].text;
   console.log(selectedText);

const bestMoviesContainer = document.querySelector(".best-movies-selected-genre");
const movieContainer = bestMoviesContainer.querySelector('.row');

movieContainer.innerHTML = '';

api.fetchBestMovieOfGenre(selectedText, ".best-movies-selected-genre");
}


