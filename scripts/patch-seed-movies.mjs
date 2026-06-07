import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const omdb = JSON.parse(readFileSync('scripts/omdb-data.json', 'utf8'));

const titleMap = {
  "Indiana Jones: Raiders of the Lost Ark": "Raiders of the Lost Ark",
  "Indiana Jones: The Last Crusade": "Indiana Jones and the Last Crusade",
  "The Lord of the Rings: Fellowship of the Ring": "The Lord of the Rings: The Fellowship of the Ring",
  "The Lord of the Rings: The Two Towers": "The Lord of the Rings: The Two Towers",
  "The Lord of the Rings: Return of the King": "The Lord of the Rings: The Return of the King",
  "Mission: Impossible – Fallout": "Mission: Impossible - Fallout",
  "The Good, the Bad and the Ugly": "The Good the Bad and the Ugly",
};

// These OMDb results were clearly wrong movies (radio dramas, short films)
const badEntries = new Set([
  "Star Wars: A New Hope",
  "Star Wars: The Empire Strikes Back",
  "Star Wars: Return of the Jedi",
  "Good Will Hunting",
]);

// Fields to null out for specific entries (correct movie but some bad fields)
const partialFix = {
  "WALL-E": { omdbRuntime: null, omdbRating: null },
};

const seeds = [
  {title:"The Lion King",year:1994,category:"Animated",ageMin:4,ageIdeal:5,series:"",mustWatch:true,description:"Hamlet for kids. Loss, identity, and the courage to return.",watchOrder:"Original only."},
  {title:"Toy Story",year:1995,category:"Animated",ageMin:4,ageIdeal:5,series:"Toy Story",mustWatch:true,description:"The film that launched Pixar. Watch Toy Story 3 when they're 12+.",watchOrder:"1 → 2 → 3. Part 3 at age 12+."},
  {title:"WALL-E",year:2008,category:"Animated",ageMin:5,ageIdeal:6,series:"",mustWatch:true,description:"A love story and masterpiece of visual storytelling with almost no dialogue.",watchOrder:"Standalone."},
  {title:"Up",year:2009,category:"Animated",ageMin:5,ageIdeal:6,series:"",mustWatch:true,description:"The first 10 minutes will gut you. Then it becomes an adventure.",watchOrder:"Standalone."},
  {title:"E.T. the Extra-Terrestrial",year:1982,category:"Sci-Fi",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"Spielberg at his most tender. A goodbye that wrecks every adult.",watchOrder:"Standalone."},
  {title:"The Iron Giant",year:1999,category:"Animated",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"You are who you choose to be. The most underrated animated film ever.",watchOrder:"Standalone."},
  {title:"Home Alone",year:1990,category:"Comedy",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"A boy defends his house. One of the most beloved comedies ever made.",watchOrder:"Annual Christmas tradition."},
  {title:"The Incredibles",year:2004,category:"Animated",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"About embracing what makes you exceptional.",watchOrder:"Standalone."},
  {title:"The Princess Bride",year:1987,category:"Comedy",ageMin:7,ageIdeal:8,series:"",mustWatch:true,description:"As you wish. Adventure, romance, and the most quotable movie ever made.",watchOrder:"Standalone."},
  {title:"The Sandlot",year:1993,category:"Comedy",ageMin:7,ageIdeal:8,series:"",mustWatch:true,description:"A summer, a baseball field, and friendships that last a lifetime.",watchOrder:"Standalone."},
  {title:"Star Wars: A New Hope",year:1977,category:"Epic Sagas",ageMin:5,ageIdeal:6,series:"Star Wars",mustWatch:true,description:"Where it all began. The Hero's Journey in its purest cinematic form.",watchOrder:"Episodes IV, V, VI first — always."},
  {title:"Star Wars: The Empire Strikes Back",year:1980,category:"Epic Sagas",ageMin:6,ageIdeal:7,series:"Star Wars",mustWatch:true,description:"The greatest plot twist in cinema history.",watchOrder:"Episode V — second in the saga."},
  {title:"Star Wars: Return of the Jedi",year:1983,category:"Epic Sagas",ageMin:6,ageIdeal:7,series:"Star Wars",mustWatch:true,description:"The conclusion of the original trilogy.",watchOrder:"Episode VI — third."},
  {title:"Harry Potter and the Sorcerer's Stone",year:2001,category:"Epic Sagas",ageMin:7,ageIdeal:8,series:"Harry Potter",mustWatch:true,description:"The beginning of one of cinema's greatest coming-of-age sagas.",watchOrder:"1 through 8 in order. All required."},
  {title:"Harry Potter and the Prisoner of Azkaban",year:2004,category:"Epic Sagas",ageMin:8,ageIdeal:9,series:"Harry Potter",mustWatch:true,description:"The series transforms here. Best directed of the eight.",watchOrder:"3rd — Alfonso Cuarón directs."},
  {title:"Spirited Away",year:2001,category:"Animated",ageMin:8,ageIdeal:9,series:"Studio Ghibli",mustWatch:true,description:"Miyazaki's masterpiece. A girl navigates a world of spirits.",watchOrder:"Watch the subtitled Japanese version."},
  {title:"Back to the Future",year:1985,category:"Sci-Fi",ageMin:8,ageIdeal:9,series:"Back to the Future",mustWatch:true,description:"The perfect time travel movie. Funny, tight, inventive.",watchOrder:"All three in order. Part I is flawless."},
  {title:"Indiana Jones: Raiders of the Lost Ark",year:1981,category:"Adventure",ageMin:8,ageIdeal:10,series:"Indiana Jones",mustWatch:true,description:"The gold standard of adventure films. Pure cinematic joy.",watchOrder:"Start here. This is the one."},
  {title:"Indiana Jones: The Last Crusade",year:1989,category:"Adventure",ageMin:8,ageIdeal:10,series:"Indiana Jones",mustWatch:true,description:"Sean Connery as Indy's dad. The emotional heart of the series.",watchOrder:"3rd in series."},
  {title:"Jurassic Park",year:1993,category:"Sci-Fi",ageMin:8,ageIdeal:9,series:"",mustWatch:true,description:"The film that made dinosaurs real. Still holds up 30 years later.",watchOrder:"Standalone."},
  {title:"Apollo 13",year:1995,category:"Biographical",ageMin:9,ageIdeal:10,series:"",mustWatch:true,description:"Three astronauts try to come home alive. Pure suspense from a true story.",watchOrder:"Standalone."},
  {title:"Hoosiers",year:1986,category:"Sports",ageMin:9,ageIdeal:10,series:"",mustWatch:true,description:"Small Indiana high school basketball team goes to the state championship.",watchOrder:"Indiana pride. Standalone."},
  {title:"Miracle",year:2004,category:"Sports",ageMin:9,ageIdeal:10,series:"",mustWatch:true,description:"The 1980 US hockey team beating the Soviet Union at the Olympics.",watchOrder:"Standalone."},
  {title:"The Lord of the Rings: Fellowship of the Ring",year:2001,category:"Epic Sagas",ageMin:9,ageIdeal:11,series:"Lord of the Rings",mustWatch:true,description:"The greatest fantasy epic ever put to film.",watchOrder:"Extended edition. All three required."},
  {title:"The Lord of the Rings: The Two Towers",year:2002,category:"Epic Sagas",ageMin:9,ageIdeal:11,series:"Lord of the Rings",mustWatch:true,description:"The Battle of Helm's Deep. Gollum brought to life.",watchOrder:"2nd in trilogy."},
  {title:"The Lord of the Rings: Return of the King",year:2003,category:"Epic Sagas",ageMin:9,ageIdeal:11,series:"Lord of the Rings",mustWatch:true,description:"11 Academy Awards. The most satisfying conclusion to any trilogy.",watchOrder:"Extended edition finale."},
  {title:"The Hobbit: An Unexpected Journey",year:2012,category:"Epic Sagas",ageMin:8,ageIdeal:10,series:"The Hobbit",mustWatch:false,description:"A lighter journey into Middle-earth.",watchOrder:"After or before LOTR — either works."},
  {title:"Rudy",year:1993,category:"Sports",ageMin:10,ageIdeal:11,series:"",mustWatch:true,description:"A kid with no talent who refuses to stop trying.",watchOrder:"Standalone."},
  {title:"Rocky",year:1976,category:"Sports",ageMin:10,ageIdeal:11,series:"Rocky",mustWatch:true,description:"The ultimate film about heart over talent.",watchOrder:"Just the first one is essential."},
  {title:"Top Gun",year:1986,category:"Action",ageMin:10,ageIdeal:12,series:"Top Gun",mustWatch:true,description:"Fighter pilots, competition, loss, and redemption.",watchOrder:"Watch before Maverick."},
  {title:"Top Gun: Maverick",year:2022,category:"Action",ageMin:10,ageIdeal:13,series:"Top Gun",mustWatch:true,description:"A masterclass in legacy sequels. Better than the original.",watchOrder:"After the original."},
  {title:"Groundhog Day",year:1993,category:"Comedy",ageMin:10,ageIdeal:12,series:"",mustWatch:true,description:"Secretly a profound film about self-improvement.",watchOrder:"Standalone."},
  {title:"National Lampoon's Christmas Vacation",year:1989,category:"Comedy",ageMin:10,ageIdeal:11,series:"",mustWatch:true,description:"Clark Griswold's quest for the perfect Christmas.",watchOrder:"Annual Christmas tradition."},
  {title:"It's a Wonderful Life",year:1946,category:"Drama",ageMin:8,ageIdeal:10,series:"",mustWatch:true,description:"The ultimate film about legacy and meaning.",watchOrder:"Every Christmas, forever."},
  {title:"Field of Dreams",year:1989,category:"Sports",ageMin:11,ageIdeal:12,series:"",mustWatch:true,description:"If you build it, he will come. A film about fathers and sons.",watchOrder:"Watch this one together."},
  {title:"Forrest Gump",year:1994,category:"Drama",ageMin:11,ageIdeal:12,series:"",mustWatch:true,description:"A simple man walks through American history.",watchOrder:"Standalone."},
  {title:"Jaws",year:1975,category:"Thriller",ageMin:11,ageIdeal:12,series:"",mustWatch:true,description:"The film that invented the summer blockbuster.",watchOrder:"Standalone."},
  {title:"Interstellar",year:2014,category:"Sci-Fi",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"A father's love tested across space and time.",watchOrder:"Standalone. Watch in the dark."},
  {title:"To Kill a Mockingbird",year:1962,category:"Drama",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"Gregory Peck as Atticus Finch. Justice, innocence, and moral courage.",watchOrder:"Read the book alongside."},
  {title:"Tombstone",year:1993,category:"Western",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"I'm your Huckleberry. The Western for people who aren't sure they like Westerns.",watchOrder:"Standalone."},
  {title:"Ferris Bueller's Day Off",year:1986,category:"Comedy",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"Life moves pretty fast. A love letter to living in the moment.",watchOrder:"Standalone."},
  {title:"North by Northwest",year:1959,category:"Thriller",ageMin:12,ageIdeal:13,series:"Hitchcock",mustWatch:true,description:"Hitchcock's adventure thriller. The crop duster sequence alone.",watchOrder:"Best Hitchcock entry point."},
  {title:"Chariots of Fire",year:1981,category:"Biographical",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"Two runners at the 1924 Olympics. One runs for pride, one for God.",watchOrder:"Standalone."},
  {title:"Mission: Impossible – Fallout",year:2018,category:"Action",ageMin:12,ageIdeal:14,series:"Mission: Impossible",mustWatch:true,description:"The pinnacle of practical action filmmaking.",watchOrder:"Best entry point, or start from the beginning."},
  {title:"The Dark Knight",year:2008,category:"Action",ageMin:13,ageIdeal:14,series:"Nolan Batman",mustWatch:true,description:"A crime epic. Heath Ledger's Joker is one of cinema's all-time performances.",watchOrder:"Watch Batman Begins first."},
  {title:"Casino Royale",year:2006,category:"Spy",ageMin:13,ageIdeal:14,series:"James Bond",mustWatch:true,description:"Bond as a flawed human being. The best Bond film ever made.",watchOrder:"Start of the Daniel Craig era."},
  {title:"Skyfall",year:2012,category:"Spy",ageMin:13,ageIdeal:14,series:"James Bond",mustWatch:true,description:"The most cinematic Bond film. Roger Deakins shot it.",watchOrder:"3rd in Craig era."},
  {title:"The Matrix",year:1999,category:"Sci-Fi",ageMin:13,ageIdeal:14,series:"The Matrix",mustWatch:true,description:"Reality is a simulation. Mind-bending action wrapped around genuine philosophy.",watchOrder:"Just the first film is essential."},
  {title:"Dead Poets Society",year:1989,category:"Drama",ageMin:13,ageIdeal:14,series:"",mustWatch:true,description:"O Captain, My Captain. A teacher who changes lives.",watchOrder:"Standalone."},
  {title:"Dunkirk",year:2017,category:"War",ageMin:13,ageIdeal:14,series:"",mustWatch:true,description:"Nolan's non-linear war film. Three timelines on one beach.",watchOrder:"Standalone."},
  {title:"Dune",year:2021,category:"Epic Sagas",ageMin:13,ageIdeal:14,series:"Dune",mustWatch:true,description:"The most ambitious sci-fi epic in decades.",watchOrder:"Part One, then Part Two (2024)."},
  {title:"Dune: Part Two",year:2024,category:"Epic Sagas",ageMin:13,ageIdeal:15,series:"Dune",mustWatch:true,description:"Extraordinary filmmaking. A morally complex conclusion.",watchOrder:"Immediately after Part One."},
  {title:"The Good, the Bad and the Ugly",year:1966,category:"Western",ageMin:13,ageIdeal:15,series:"",mustWatch:true,description:"Ennio Morricone's score. The greatest Western ever made.",watchOrder:"Standalone."},
  {title:"Schindler's List",year:1993,category:"Drama",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"Spielberg's account of the Holocaust. A film that changes you.",watchOrder:"Watch with a parent. Discussion required."},
  {title:"Saving Private Ryan",year:1998,category:"War",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"The most realistic war film ever made.",watchOrder:"Opening 20 minutes are extremely intense."},
  {title:"Hacksaw Ridge",year:2016,category:"War",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"A conscientious objector saved 75 men without a weapon. True story.",watchOrder:"Standalone."},
  {title:"Good Will Hunting",year:1997,category:"Drama",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"A genius afraid of his own gifts. Robin Williams is extraordinary.",watchOrder:"Standalone."},
  {title:"The Shawshank Redemption",year:1994,category:"Drama",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"Hope, friendship, and perseverance. Consistently voted the greatest film ever.",watchOrder:"Standalone."},
  {title:"Arrival",year:2016,category:"Sci-Fi",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"The most quietly devastating sci-fi film in decades.",watchOrder:"Don't look anything up first."},
  {title:"2001: A Space Odyssey",year:1968,category:"Sci-Fi",ageMin:14,ageIdeal:16,series:"",mustWatch:true,description:"Kubrick's monolith. Slow, strange, and visionary.",watchOrder:"Standalone. Patience required."},
  {title:"Oppenheimer",year:2023,category:"Biographical",ageMin:15,ageIdeal:16,series:"",mustWatch:true,description:"Three hours on the man who built the bomb.",watchOrder:"Some WWII history helps."},
];

function getOmdb(title) {
  const key = titleMap[title] || title;
  if (badEntries.has(key)) return {};
  const d = omdb[key];
  if (!d) return {};
  const result = { ...d };
  const fixes = partialFix[key];
  if (fixes) Object.assign(result, fixes);
  return result;
}

function buildSeedLine(m) {
  const d = getOmdb(m.title);
  const omdbFields = [];
  if (d.omdbPlot != null) omdbFields.push(`omdbPlot:${JSON.stringify(d.omdbPlot)}`);
  if (d.omdbDirector != null) omdbFields.push(`omdbDirector:${JSON.stringify(d.omdbDirector)}`);
  if (d.omdbRuntime != null) omdbFields.push(`omdbRuntime:${JSON.stringify(d.omdbRuntime)}`);
  if (d.omdbRating != null) omdbFields.push(`omdbRating:${JSON.stringify(d.omdbRating)}`);
  if (d.omdbImdbRating != null) omdbFields.push(`omdbImdbRating:${JSON.stringify(d.omdbImdbRating)}`);
  if (d.omdbPoster != null) omdbFields.push(`omdbPoster:${JSON.stringify(d.omdbPoster)}`);
  omdbFields.push('_enriched:true');
  return `  {id:uid(),title:${JSON.stringify(m.title)},year:${m.year},category:${JSON.stringify(m.category)},ageMin:${m.ageMin},ageIdeal:${m.ageIdeal},series:${JSON.stringify(m.series)},mustWatch:${m.mustWatch},description:${JSON.stringify(m.description)},watchOrder:${JSON.stringify(m.watchOrder)},${omdbFields.join(',')}},`;
}

const newSeedMovies = 'const SEED_MOVIES = [\n' + seeds.map(buildSeedLine).join('\n') + '\n];';

let src = readFileSync('src/components/CinemaApp.jsx', 'utf8');

// Replace SEED_MOVIES block
const start = src.indexOf('const SEED_MOVIES = [');
const endMarker = '\n];';
const endIdx = src.indexOf(endMarker, start) + endMarker.length;

if (start === -1) { console.error('SEED_MOVIES not found'); process.exit(1); }

src = src.slice(0, start) + newSeedMovies + src.slice(endIdx);

writeFileSync('src/components/CinemaApp.jsx', src);
console.log('Patched SEED_MOVIES successfully.');
