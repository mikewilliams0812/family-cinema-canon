import { writeFileSync } from 'fs';

const key = '1ec3603b';
const films = [
  ['The Lion King', 1994], ['Toy Story', 1995], ['WALL-E', 2008], ['Up', 2009],
  ['E.T. the Extra-Terrestrial', 1982], ['The Iron Giant', 1999], ['Home Alone', 1990],
  ['The Incredibles', 2004], ['The Princess Bride', 1987], ['The Sandlot', 1993],
  ['Star Wars: A New Hope', 1977], ['Star Wars: The Empire Strikes Back', 1980],
  ['Star Wars: Return of the Jedi', 1983], ['Harry Potter and the Sorcerer\'s Stone', 2001],
  ['Harry Potter and the Prisoner of Azkaban', 2004], ['Spirited Away', 2001],
  ['Back to the Future', 1985], ['Raiders of the Lost Ark', 1981],
  ['Indiana Jones and the Last Crusade', 1989], ['Jurassic Park', 1993],
  ['Apollo 13', 1995], ['Hoosiers', 1986], ['Miracle', 2004],
  ['The Lord of the Rings: The Fellowship of the Ring', 2001],
  ['The Lord of the Rings: The Two Towers', 2002],
  ['The Lord of the Rings: The Return of the King', 2003],
  ['The Hobbit: An Unexpected Journey', 2012], ['Rudy', 1993], ['Rocky', 1976],
  ['Top Gun', 1986], ['Top Gun: Maverick', 2022], ['Groundhog Day', 1993],
  ['National Lampoon\'s Christmas Vacation', 1989], ["It's a Wonderful Life", 1946],
  ['Field of Dreams', 1989], ['Forrest Gump', 1994], ['Jaws', 1975],
  ['Interstellar', 2014], ['To Kill a Mockingbird', 1962], ['Tombstone', 1993],
  ["Ferris Bueller's Day Off", 1986], ['North by Northwest', 1959],
  ['Chariots of Fire', 1981], ['Mission: Impossible - Fallout', 2018],
  ['The Dark Knight', 2008], ['Casino Royale', 2006], ['Skyfall', 2012],
  ['The Matrix', 1999], ['Dead Poets Society', 1989], ['Dunkirk', 2017],
  ['Dune', 2021], ['Dune: Part Two', 2024], ['The Good the Bad and the Ugly', 1966],
  ["Schindler's List", 1993], ['Saving Private Ryan', 1998], ['Hacksaw Ridge', 2016],
  ['Good Will Hunting', 1997], ['The Shawshank Redemption', 1994],
  ['Arrival', 2016], ['2001: A Space Odyssey', 1968], ['Oppenheimer', 2023],
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = {};

for (const [title, year] of films) {
  try {
    const q = encodeURIComponent(title);
    let res = await fetch(`https://www.omdbapi.com/?t=${q}&y=${year}&plot=short&apikey=${key}`);
    let d = await res.json();
    if (d.Response === 'False') {
      res = await fetch(`https://www.omdbapi.com/?t=${q}&plot=short&apikey=${key}`);
      d = await res.json();
    }
    if (d.Response === 'True') {
      results[title] = {
        omdbPlot: d.Plot !== 'N/A' ? d.Plot : null,
        omdbDirector: d.Director !== 'N/A' ? d.Director : null,
        omdbRuntime: d.Runtime !== 'N/A' ? d.Runtime : null,
        omdbRating: d.Rated !== 'N/A' ? d.Rated : null,
        omdbImdbRating: d.imdbRating !== 'N/A' ? d.imdbRating : null,
        omdbPoster: d.Poster && d.Poster !== 'N/A' ? d.Poster : null,
      };
      console.log(`✓ ${title}`);
    } else {
      results[title] = null;
      console.log(`✗ ${title} — not found`);
    }
  } catch(e) {
    results[title] = null;
    console.log(`✗ ${title} — ${e.message}`);
  }
  await sleep(300);
}

writeFileSync('scripts/omdb-data.json', JSON.stringify(results, null, 2));
console.log(`\nDone. ${Object.values(results).filter(Boolean).length}/${films.length} found.`);
