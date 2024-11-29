class UIManager {
  constructor() {
    this.genresDropdown = document.getElementById('genresList')
  }

  // Gérer les clics sur les détails
  handleDetailsClick(button) {
    const dataUrl = button.getAttribute("data-url");
    if (dataUrl) {
      this.fetchBestMovieDetails(dataUrl);
    } else {
      console.error("URL des détails manquante pour ce bouton");
    }
  }

  // Mise à jour d'une section de genre
  updateBestMovieGenreSection(movies, containerId) {
    const genreSection = document.querySelector(containerId);
    const container = genreSection.querySelector(".row");
    const template = document.querySelector("#movie-card-template");

    // Vider le conteneur avant d'ajouter de nouveaux éléments
    container.innerHTML = "";

    //const fragment = document.createDocumentFragment();

    movies.forEach((movie) => {
      const clone = template.content.cloneNode(true);
      const img = clone.querySelector("img");
      const title = clone.querySelector(".title");
      const button = clone.querySelector("button");

      img.src =
        movie.image_url ||
        "https://img.freepik.com/vecteurs-premium/vecteur-icone-image-par-defaut-page-image-manquante-pour-conception-site-web-application-mobile-aucune-photo-disponible_87543-11093.jpg?w=740";
      img.alt = movie.title || "Image non disponible";
      title.textContent = movie.title || "Titre inconnu";
      button.dataset.url = movie.url || "#";

      container.appendChild(clone);
    });

  }

  // Récupération des films pour le genre sélectionné
  fetchMoviesOfSelectedGenre(fetchCallback) {
    const selectedGenre = this.genresDropdown.value;

    const bestMoviesContainer = document.querySelector(
      ".best-movies-selected-genre"
    );
    const movieContainer = bestMoviesContainer.querySelector(".row");
    movieContainer.innerHTML = "";

    fetchCallback(selectedGenre, ".best-movies-selected-genre");
  }

  // Mise à jour de la section du meilleur film
  updateBestMovieSection(movie) {
    const bestMovieImage = document.getElementById("best-movie-image");
    const bestMovieTitle = document.querySelector(".best-movie-body h1");
    const detailsButton = document.getElementById("best-movie-details");
    const description = document.getElementById("best-movie-description");

    bestMovieImage.src = movie.image_url || "";
    bestMovieTitle.textContent = movie.title || "Titre non disponible";
    detailsButton.setAttribute("data-url", movie.url || "#");
    description.textContent = movie.description || "Description non disponible";
  }

  // Remplir la liste déroulante avec les genres / categorie
  fillSelectElement(genresList) {
    this.genresDropdown.innerHTML = ""; // Nettoyer la liste existante
    genresList.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre.id; // Utiliser un ID unique si disponible
      option.text = genre.name || "Genre inconnu";
      this.genresDropdown.add(option);
    });
  }

  // Mise à jour de la modale avec les détails du film

  updateModal(movie) {
    console.log(movie)
  
    document.getElementById("staticBackdropLabel").textContent = movie.title || 'Titre non disponible';
  
    document.getElementById("modal-secondary-image").src = movie.image_url;
    console.log(document.getElementById("modal-secondary-image"))
    document.getElementById("modal-secondary-image").alt = movie.title;
  
    // Mettez à jour les informations principales
    document.getElementById("modal-info").innerHTML = `<strong>${movie.year} - ${movie.genres.join(', ')}</strong>`;
    document.getElementById("modal-rating").textContent = `${movie.rated} - ${movie.duration} minutes (${movie.countries? `Pays : ${movie.countries.join(', ')}`
      : 'Pays non disponibles'})`;
    document.getElementById("modal-score").textContent = `IMDB score: ${movie.imdb_score}/10`;

  
    // Mettez à jour la description et les autres détails
    document.getElementById("modal-directors").innerHTML = `<strong>Réalisé par:</strong> ${movie.directors.join(', ')}`;
    document.getElementById("modal-summary").textContent = movie.description;
  }
  
  checkWindowSize() {
    const w = window.innerWidth;

    // Sélectionner tous les conteneurs de films
    const moviesContainers = document.querySelectorAll("#movies-container");

    moviesContainers.forEach((moviesContainer) => {
      const rows = moviesContainer.querySelectorAll(
        ".row.d-flex.justify-content-between.align-items-center"
      );

      rows.forEach((row) => {
        const cols = row.querySelectorAll(".col-lg-4");
        const totalCols = cols.length;

        // Sélectionner les boutons Load More / Load Less
        const loadMoreBtn = moviesContainer.querySelector(".load-more-btn");
        const loadLessBtn = moviesContainer.querySelector(".load-less-btn");

        // Réinitialiser les classes des colonnes et masquer les boutons
        cols.forEach((col) =>
          col.classList.remove("tablet-hide", "phone-hide")
        );
        if (loadMoreBtn) loadMoreBtn.classList.add("d-none");
        if (loadLessBtn) loadLessBtn.classList.add("d-none");

        if (w >= 768 && w <= 991) {
          // Tablette : cacher les 2 dernières colonnes
          for (let i = totalCols - 2; i < totalCols; i++) {
            if (i >= 0) cols[i].classList.add("tablet-hide");
          }
          if (loadMoreBtn) loadMoreBtn.classList.remove("d-none"); // Afficher le bouton Load More
        } else if (w < 768) {
          // Téléphone : cacher les 4 dernières colonnes
          for (let i = totalCols - 4; i < totalCols; i++) {
            if (i >= 0) cols[i].classList.add("phone-hide");
          }
          if (loadMoreBtn) loadMoreBtn.classList.remove("d-none");
        } else {
          // Desktop : tout afficher (pas de colonnes cachées)
          cols.forEach((col) => {
            col.style.display = "";
          });

          if (loadMoreBtn) loadMoreBtn.classList.add("d-none");
          if (loadLessBtn) loadLessBtn.classList.add("d-none");
        }
      });
    });
  }

  addLoadMoreLogic() {
    // Sélectionner tous les conteneurs de films
    const moviesContainers = document.querySelectorAll("#movies-container");

    moviesContainers.forEach((moviesContainer) => {
      const rows = moviesContainer.querySelectorAll(
        ".row.d-flex.justify-content-between.align-items-center"
      );
      const loadMoreBtn = moviesContainer.querySelector(".load-more-btn");
      const loadLessBtn = moviesContainer.querySelector(".load-less-btn");
      rows.forEach((row) => {
        if (loadMoreBtn && loadLessBtn) {
          loadMoreBtn.addEventListener("click", () => {
            // Afficher les colonnes masquées
            const hiddenCols = row.querySelectorAll(
              ".tablet-hide, .phone-hide"
            );
            hiddenCols.forEach((col) => (col.style.display = "block"));
            loadMoreBtn.classList.add("d-none");
            loadLessBtn.classList.remove("d-none");
          });

          loadLessBtn.addEventListener("click", () => {
            // Cacher les colonnes masquées
            const hiddenCols = row.querySelectorAll(
              ".tablet-hide, .phone-hide"
            );
            hiddenCols.forEach((col) => (col.style.display = "none"));
            loadMoreBtn.classList.remove("d-none");
            loadLessBtn.classList.add("d-none");
          });
        }
      });
    });
  }
}
export { UIManager };
