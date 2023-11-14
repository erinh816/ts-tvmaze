import jQuery from 'jquery';

const $ = jQuery;

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

const BASE_URL = "https://api.tvmaze.com";
const DEFAULT_IMG = 'https://static.wikia.nocookie.net/d4f2425a-cfaf-41c2-8ecf-c78593720fb6';


interface DataInterface {
  score: number,
  show: ShowsInterface;
}

interface ShowsInterface {
  id: number,
  name: string,
  summary: string | null,
  image: { medium: string, original: string; } | null,
}

interface EpisodesInterface {
  id: number,
  name: string,
  season: string,
  number: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function searchShowsByTerm(term: string): Promise<ShowsInterface[]> {

  const response: Response = await fetch(`${BASE_URL}/search/shows?q=${term}`);
  const data: DataInterface[] = await response.json();
  return data.map(obj => ({
    id: obj.show.id,
    name: obj.show.name,
    summary: obj.show.summary,
    image: {
      medium: obj.show.image.medium, original: obj.show.image.original
    } || null
  }));
}



/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowsInterface[]): void {
  console.log("shows in populate", shows);
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image.medium || DEFAULT_IMG}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button data-show-id="${show.id}" class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term: string | number = $("#searchForm-term").val() as string | number;
  const shows: ShowsInterface[] = await searchShowsByTerm(term.toString());
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number) {
  console.log(id);
  const response: Response = await fetch(`${BASE_URL}/shows/${id}/episodes`);
  const data: EpisodesInterface[] = await response.json();
  console.log('in episodes', data);
  return data.map(obj => ({
    id: obj.id,
    name: obj.name,
    season: obj.season,
    number: obj.number
  }));

}

/**  Given list of episodes, create markup for each and to episodes list in DOM
 * shows episode area
 */

function populateEpisodes(episodes: EpisodesInterface[]): void {
  console.log("episodes in populate", episodes);
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
      `
         <li>${episode.name} (season ${episode.season}), number ${episode.number}</li>
      `);

    $episodesList.append($episode);
  }
  $episodesArea.show();
}

/** Handle button click: get episodes from API and displays. */

async function searchForEpisodesAndDisplay(evt) {
  console.log(evt.target);
  const id: string = $(evt.target).closest('button').attr("data-show-id");
  console.log(id);
  const episodes: EpisodesInterface[] = await getEpisodesOfShow(Number(id));
  console.log(episodes);

  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", async function (evt) {
  await searchForEpisodesAndDisplay(evt);
});
