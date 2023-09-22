import { useEffect, useRef, useState } from "react";
import { useMovies } from "./fetchmovies";
import { useKey } from "./usekey";
import Starrating from "./star";
import { useLocalStorage } from "./useLocalStorage";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "a1556e7e";
export default function App() {
  const [query, getQuery] = useState("");
  const { movies, error, isloading } = useMovies(query, key, close);
  const [selectedid, setselect] = useState(null);

  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useLocalStorage([], "watched");
  function handleselection(id) {
    setselect((selectedid) => (selectedid === id ? null : id));
    // console.log(id);
  }
  function close() {
    setselect(null);
  }
  function handlewatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function deletewatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <div className="App">
      <Navigation>
        <Search query={query} getQuery={getQuery} />
        <Num movies={movies} />
      </Navigation>
      <Main>
        <ListBox>
          {isloading && <Loading />}
          {!isloading && !error && (
            <MovieList movies={movies} handleselection={handleselection} />
          )}

          {error && <Network message={error} />}
        </ListBox>
        <WatchBox>
          {selectedid ? (
            <Selectedmovie
              selectedid={selectedid}
              close={close}
              addtowatchlist={handlewatched}
              watched={watched}
            />
          ) : (
            <Watchlist
              watched={watched}
              selectedid={selectedid}
              deletewatched={deletewatched}
            />
          )}
        </WatchBox>
      </Main>
    </div>
  );
}
function Selectedmovie({ selectedid, close, addtowatchlist, watched }) {
  const [movie, setmovie] = useState({});
  const [isloading, setisloading] = useState(false);
  const [userRating, setuserrRating] = useState();
  // console.log(userRating);
  const iswatched = watched.map((movie) => movie.imdbID).includes(selectedid);

  const userRRating = watched.find(
    (movie) => movie.imdbID === selectedid
  )?.userRating;

  const trackrating = useRef(0);
  useEffect(
    function () {
      if (userRating) trackrating.current++;
    },
    [userRating]
  );

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  // console.log(title, year);
  useEffect(
    function () {
      async function fetchdetails() {
        setisloading(true);
        try {
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&i=${selectedid}`
          );
          if (!res.ok) throw new Error("Some went wrong");
          const data = await res.json();
          if (data.Response === "False")
            throw new Error("coudn't find such movie");
          setmovie(data);
          setisloading(false);
          // console.log(data);
        } catch (error) {
          console.log(error);
        }
      }

      fetchdetails();
    },
    [selectedid]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie  | ${title}`;

      return function () {
        document.title = "Movie-App";
        // console.log(`hello ${title}`);
      };
    },
    [title]
  );
  useKey("Escape", close);

  function handler() {
    const newmovie = {
      imdbID: selectedid,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating: userRating,
      rt: trackrating.current,
    };

    addtowatchlist(newmovie);
    setuserrRating(null);
    close();
  }
  return (
    <div className="details">
      {isloading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={close}>
              &larr;
            </button>
            <img src={poster} alt={`poster of${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released}&bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} imdb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!iswatched ? (
                <>
                  <Starrating
                    maxrating={10}
                    size={24}
                    onSetMovierating={setuserrRating}
                  />
                  {userRating && (
                    <button className="btn-add" onClick={handler}>
                      + Add to watchlist
                    </button>
                  )}
                </>
              ) : (
                <p> you have rated this movie {userRRating}⭐</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function Network({ message }) {
  return (
    <p className="error">
      <span>⚠️</span>
      {message}
    </p>
  );
}

function Navigation({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Search({ query, getQuery }) {
  const inputel = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputel.current) return;
    inputel.current.focus();
    getQuery("");
  });
  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (e.code === "Enter") {
  //       }
  //     }
  //     document.addEventListener("keydown", callback);

  //     return () => document.addEventListener("keydown", callback);
  //   },
  //   [getQuery]
  // );

  return (
    <input
      type="text"
      placeholder="search"
      value={query}
      className="search "
      onChange={(e) => getQuery(e.target.value)}
      ref={inputel}
    />
  );
}
function Num({ movies }) {
  return <p className="num-results">Found {movies.length} results</p>;
}
function Logo() {
  return (
    <span className="logo">
      🎬
      <h1>Movie-App</h1>
    </span>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function WatchBox({ children }) {
  const [isopen2, setisopen2] = useState(true);
  return (
    <div className="box">
      <button onClick={() => setisopen2(!isopen2)} className="btn-toggle">
        {isopen2 ? "-" : "+"}
      </button>
      {isopen2 ? children : ""}
    </div>
  );
}
function Loading() {
  return <p className="loader">Loading...</p>;
}
function ListBox({ children }) {
  const [isopen1, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button onClick={() => setIsOpen1(!isopen1)} className="btn-toggle">
        {isopen1 ? "-" : "+"}
      </button>

      {isopen1 ? children : ""}
    </div>
  );
}
function Watchlist({ watched, deletewatched }) {
  return (
    <ul className="list">
      <MovieSummary watched={watched} />
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          deletewatched={deletewatched}
        />
      ))}
    </ul>
  );
}

function MovieList({ movies, handleselection }) {
  return (
    <ul className="list list-movies">
      {movies.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleselection={handleselection}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, deletewatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} `} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => deletewatched(movie.imdbID)}
        >
          ❌
        </button>
      </div>
      {/* <MovieSummary watched={movie} /> */}
    </li>
  );
}
function MovieSummary({ watched }) {
  return <Summary watched={watched} />;
}
function Summary({ watched }) {
  const avgImdbRating = Math.round(
    average(watched.map((movie) => movie.imdbRating))
  );
  const avgUserRating = Math.round(
    average(watched.map((movie) => movie.userRating))
  );
  const avgRuntime = Math.round(average(watched.map((movie) => movie.runtime)));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function Movie({ movie, handleselection }) {
  return (
    <li onClick={() => handleselection(movie.imdbID)}>
      <img src={movie.Poster} alt={movie.imdbID}></img>
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
