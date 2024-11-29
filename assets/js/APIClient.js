import { UIManager } from './UIManager.js';

class APIClient {
    constructor()
    {
        this.uimanager = new UIManager()
    }
    const BASE_URL = "http://localhost:8000/api/v1/titles/";

    //Fetch best movie all genres combined
   async fetchBestMovie() {
    try {
      const response = await fetch(
        `${BASE_URL}?sort_by=-imdb_score,-votes`
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      const json = await response.json();

      if (json && json.results && json.results.length > 0) {
        const bestMovie = json.results[0];
        // Étape 2 : Récupérer les détails du meilleur film via son URL
        const descriptionResponse = await fetch(bestMovie.url);
        if (!descriptionResponse.ok) {
          throw new Error(
            `Erreur HTTP pour la description : ${descriptionResponse.status}`
          );
        }
        console.log("print ok");

        const descriptionJson = await descriptionResponse.json();

        // Ajouter la description au film
        bestMovie.description = descriptionJson.description;
        console.log("Détails du film :", bestMovie);
        this.uimanager.updateBestMovieSection(bestMovie);
      }
      return json;
    } catch (error) {
      console.error(`Impossible d'obtenir les films : ${error}`);
      return null;
    }
  }

  //fetch best movies of a specific genre filtered by imdb score and votes
   async fetchBestMovieOfGenre(genre, container_id) {
    try {
      let response = await fetch(
        `${BASE_URL}?genre=${genre}&sort_by=-imdb_score,-votes`
      );

      if (!response.ok) {
        alert(`Une erreur est survenue (${response.status})`);
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      let json = await response.json();
      console.log("Slected genre" + genre)
      console.log("Initial count:", json.results.length);

      // Ensure we have at least 6 movies
      while (json.results.length < 6 && json.next) {
        console.log("Fetching more movies from:", json.next);

        const nextResponse = await fetch(json.next);
        if (!nextResponse.ok) {
          throw new Error(
            `Erreur HTTP pour la page suivante : ${nextResponse.status}`
          );
        }

        const nextJson = await nextResponse.json();
        json.results.push(...nextJson.results);
      }

      console.log("Final count:", json.results.length);

      if (json && json.results && json.results.length > 0) {
        const movies = json.results.slice(0, 6);
        this.uimanager.updateBestMovieGenreSection(movies, container_id);
        return movies;
      }
    } catch (error) {
      console.error(`Impossible d'obtenir les films : ${error}`);
      return null;
    }
  }

  //Fetch all genres
   async fetchGenres() {
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
          break;
        }

        currentPage++;
      }

      this.uimanager.fillSelectElement(allResults);

      return allResults;
    } catch (error) {
      console.error(`Impossible d'obtenir les genres : ${error}`);
      return null;
    }
  }

  //Fetch a movie details

   async fetchBestMovieDetails(movie_url) {
    try {
      const response = await fetch(movie_url);
      console.log("URL récupérée :", movie_url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      const json = await response.json();
      
      this.uimanager.updateModal(json);
      return json;
    } catch (error) {
      console.error("Impossible d'obtenir les films :", error); // Log the full error
      return null;
    }
  }
}

export { APIClient };
