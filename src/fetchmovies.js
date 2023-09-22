import { useState, useEffect } from "react";

export function useMovies(query, key, callback) {
  const [movies, setMovies] = useState([]);
  const [isloading, setloading] = useState();
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchmovies() {
        try {
          setError("");
          setloading(true);
          const response = await fetch(
            ` http://www.omdbapi.com/?apikey=${key}&s=${query} `,
            { signal: controller.signal }
          );
          if (!response.ok) throw new Error("something went wrong");
          const data = await response.json();
          // console.log(data);
          if (data.Response === "False")
            throw new Error("coudn't find such movie");

          setMovies(data.Search);
          // console.log(data.Search);
          setloading(false);
        } catch (error) {
          if (error.name !== "AbortError") {
            setError(error.message);
          }
        } finally {
          setloading(false);
        }
      }
      if (query.length <= 2) {
        setMovies([]);
        setError("");
        return;
      }
      callback?.();
      fetchmovies();
      return function () {
        controller.abort();
      };
    },

    [query, key]
  );

  return { movies, error, isloading };
}
