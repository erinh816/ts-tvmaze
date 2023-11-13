import jQuery from 'jquery';

const $ = jQuery;

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = "https://api.tvmaze.com";


interface DataInterface {
  score: number,
  show: ShowsInterface;
}

interface ShowsInterface {
  id: number,
  name: string,
  summary: string | null,
  image: { medium: string | null, original: string | null; },
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function searchShowsByTerm(term: string): Promise<object[]> {

  const response: Response = await fetch(`${BASE_URL}/search/shows?q=${term}`);
  const data: DataInterface[] = await response.json();
  return data.map(obj => ({
    id: obj.show.id,
    name: obj.show.name,
    summary: obj.show.summary,
    image: {
      medium: obj.show.image.medium, original: obj.show.image.original
    }
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
              src=${show.image.medium}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
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
  console.log(term);
  const shows: object[] = await searchShowsByTerm(term.toString());
  console.log(shows);
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

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }
