'use client';
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const uid = () => Math.random().toString(36).slice(2, 9);
const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const C = {
  bg: "#f5f0e8", surface: "#ede7da", surfaceAlt: "#e6dece",
  border: "#d4c9b5", borderDark: "#b8a98e",
  text: "#1e2b1a", textMid: "#3d4e36", muted: "#7a8c72", mutedLight: "#a8b89e",
  hunterGreen: "#151E14", burntOrange: "#C4621D", slateBlue: "#3F6070", olive: "#5a6632",
};

const CATEGORIES = ["Adventure","Action","Animated","Biographical","Comedy","Drama","Epic Sagas","Sci-Fi","Spy","Sports","Thriller","War","Western","Other"];
const AGE_GROUPS = { "All":[0,99], "5-7":[5,7], "8-10":[8,10], "11-13":[11,13], "14+":[14,99] };
const KID_COLORS = [C.burntOrange, C.slateBlue, "#5a6632", "#6a4a7a", "#3a6a6a", "#7a4a3a"];

function ageColor(a) {
  if (a<=7) return "#16a34a"; if (a<=10) return "#2563eb";
  if (a<=13) return "#d97706"; return "#dc2626";
}
function ageBg(a) {
  if (a<=7) return "#dcfce7"; if (a<=10) return "#dbeafe";
  if (a<=13) return "#fef3c7"; return "#fee2e2";
}

const SEED_MOVIES = [
  {id:uid(),title:"The Lion King",year:1994,category:"Animated",ageMin:4,ageIdeal:5,series:"",mustWatch:true,description:"Hamlet for kids. Loss, identity, and the courage to return.",watchOrder:"Original only.",omdbPlot:"Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",omdbDirector:"Roger Allers, Rob Minkoff",omdbRuntime:"88 min",omdbRating:"G",omdbImdbRating:"8.5",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZGRiZDZhZjItM2M3ZC00Y2IyLTk3Y2MtMWY5YjliNDFkZTJlXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Toy Story",year:1995,category:"Animated",ageMin:4,ageIdeal:5,series:"Toy Story",mustWatch:true,description:"The film that launched Pixar. Watch Toy Story 3 when they're 12+.",watchOrder:"1 → 2 → 3. Part 3 at age 12+.",omdbPlot:"A cowboy doll is profoundly jealous when a new spaceman action figure supplants him as the top toy in a boy's bedroom. When circumstances separate them from their owner, the duo have to put aside their differences to return to him.",omdbDirector:"John Lasseter",omdbRuntime:"81 min",omdbRating:"G",omdbImdbRating:"8.3",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZTA3OWVjOWItNjE1NS00NzZiLWE1MjgtZDZhMWI1ZTlkNzYwXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"WALL-E",year:2008,category:"Animated",ageMin:5,ageIdeal:6,series:"",mustWatch:true,description:"A love story and masterpiece of visual storytelling with almost no dialogue.",watchOrder:"Standalone.",omdbPlot:"A robot named WALL-E is on a uninhabitable earth by itself but when the human space ship comes and drops of a new robot named Eva on search for a plant. Eva meets WALL-E witch WALL-E shows Eva a plant. the humans come back to take...",omdbDirector:"Andrew Stanton",omdbImdbRating:"8.3",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMzk0ZGMzMDYtMDJkYS00NTdhLWJlZWUtMTdhOTJkOTM3NDUwXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Up",year:2009,category:"Animated",ageMin:5,ageIdeal:6,series:"",mustWatch:true,description:"The first 10 minutes will gut you. Then it becomes an adventure.",watchOrder:"Standalone.",omdbPlot:"78-year-old Carl Fredricksen travels to South America in his house equipped with balloons, inadvertently taking a young stowaway.",omdbDirector:"Pete Docter, Bob Peterson",omdbRuntime:"96 min",omdbRating:"PG",omdbImdbRating:"8.3",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNmI1ZTc5MWMtMDYyOS00ZDc2LTkzOTAtNjQ4NWIxNjYyNDgzXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"E.T. the Extra-Terrestrial",year:1982,category:"Sci-Fi",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"Spielberg at his most tender. A goodbye that wrecks every adult.",watchOrder:"Standalone.",omdbPlot:"A troubled child summons the courage to help a friendly alien escape from Earth and return to his home planet.",omdbDirector:"Steven Spielberg",omdbRuntime:"115 min",omdbRating:"PG",omdbImdbRating:"7.9",omdbPoster:"https://m.media-amazon.com/images/M/MV5BYTNhNmY0YWMtMTczYi00MTA0LThhMmUtMTIxYzE0Y2QwMzRlXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"The Iron Giant",year:1999,category:"Animated",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"You are who you choose to be. The most underrated animated film ever.",watchOrder:"Standalone.",omdbPlot:"A young boy befriends a giant robot from outer space that a paranoid government agent wants to destroy.",omdbDirector:"Brad Bird",omdbRuntime:"86 min",omdbRating:"PG",omdbImdbRating:"8.1",omdbPoster:"https://m.media-amazon.com/images/M/MV5BODM4ZjZjMGEtYmFiMy00MThjLWIzZjUtMDU0ODg1NTI2MzIwXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Home Alone",year:1990,category:"Comedy",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"A boy defends his house. One of the most beloved comedies ever made.",watchOrder:"Annual Christmas tradition.",omdbPlot:"An eight-year-old troublemaker, mistakenly left home alone, must defend his home against a pair of burglars on Christmas Eve.",omdbDirector:"Chris Columbus",omdbRuntime:"103 min",omdbRating:"PG",omdbImdbRating:"7.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNzNmNmQ2ZDEtMTc1MS00NjNiLThlMGUtZmQxNTg1Nzg5NWMzXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"The Incredibles",year:2004,category:"Animated",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"About embracing what makes you exceptional.",watchOrder:"Standalone.",omdbPlot:"While trying to lead a quiet suburban life, a family of undercover superheroes are forced into action to save the world.",omdbDirector:"Brad Bird",omdbRuntime:"115 min",omdbRating:"PG",omdbImdbRating:"8.0",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMTY5OTU0OTc2NV5BMl5BanBnXkFtZTcwMzU4MDcyMQ@@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"The Princess Bride",year:1987,category:"Comedy",ageMin:7,ageIdeal:8,series:"",mustWatch:true,description:"As you wish. Adventure, romance, and the most quotable movie ever made.",watchOrder:"Standalone.",omdbPlot:"A bedridden boy's grandfather reads him the story of a farmboy-turned-pirate who encounters numerous obstacles, enemies and allies in his quest to be reunited with his true love.",omdbDirector:"Rob Reiner",omdbRuntime:"98 min",omdbRating:"PG",omdbImdbRating:"8.0",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMjFiOTEyNGMtN2E4MC00ZjZlLTk3ZDQtNTU1ZGNiZTA1MzJlXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"The Sandlot",year:1993,category:"Comedy",ageMin:7,ageIdeal:8,series:"",mustWatch:true,description:"A summer, a baseball field, and friendships that last a lifetime.",watchOrder:"Standalone.",omdbPlot:"In the summer of 1962, a new kid in town is taken under the wing of a young baseball prodigy and his rowdy team, resulting in many adventures.",omdbDirector:"David Mickey Evans",omdbRuntime:"101 min",omdbRating:"PG",omdbImdbRating:"7.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNTc5YzE5OTAtMmY3YS00ODk4LTgzODItZGEzNmMxMDhhNWUwXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Star Wars: A New Hope",year:1977,category:"Epic Sagas",ageMin:5,ageIdeal:6,series:"Star Wars",mustWatch:true,description:"Where it all began. The Hero's Journey in its purest cinematic form.",watchOrder:"Episodes IV, V, VI first — always.",_enriched:true},
  {id:uid(),title:"Star Wars: The Empire Strikes Back",year:1980,category:"Epic Sagas",ageMin:6,ageIdeal:7,series:"Star Wars",mustWatch:true,description:"The greatest plot twist in cinema history.",watchOrder:"Episode V — second in the saga.",_enriched:true},
  {id:uid(),title:"Star Wars: Return of the Jedi",year:1983,category:"Epic Sagas",ageMin:6,ageIdeal:7,series:"Star Wars",mustWatch:true,description:"The conclusion of the original trilogy.",watchOrder:"Episode VI — third.",_enriched:true},
  {id:uid(),title:"Harry Potter and the Sorcerer's Stone",year:2001,category:"Epic Sagas",ageMin:7,ageIdeal:8,series:"Harry Potter",mustWatch:true,description:"The beginning of one of cinema's greatest coming-of-age sagas.",watchOrder:"1 through 8 in order. All required.",omdbPlot:"An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.",omdbDirector:"Chris Columbus",omdbRuntime:"152 min",omdbRating:"PG",omdbImdbRating:"7.7",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNTU1MzgyMDMtMzBlZS00YzczLThmYWEtMjU3YmFlOWEyMjE1XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Harry Potter and the Prisoner of Azkaban",year:2004,category:"Epic Sagas",ageMin:8,ageIdeal:9,series:"Harry Potter",mustWatch:true,description:"The series transforms here. Best directed of the eight.",watchOrder:"3rd — Alfonso Cuarón directs.",omdbPlot:"Harry Potter, Ron and Hermione return to Hogwarts School of Witchcraft and Wizardry for their third year of study, where they delve into the mystery surrounding an escaped prisoner who poses a dangerous threat to the young wizard.",omdbDirector:"Alfonso Cuarón",omdbRuntime:"142 min",omdbRating:"PG",omdbImdbRating:"7.9",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMTY4NTIwODg0N15BMl5BanBnXkFtZTcwOTc0MjEzMw@@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Spirited Away",year:2001,category:"Animated",ageMin:8,ageIdeal:9,series:"Studio Ghibli",mustWatch:true,description:"Miyazaki's masterpiece. A girl navigates a world of spirits.",watchOrder:"Watch the subtitled Japanese version.",omdbPlot:"During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches and spirits, and where humans are changed into beasts.",omdbDirector:"Hayao Miyazaki",omdbRuntime:"124 min",omdbRating:"PG",omdbImdbRating:"8.6",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNTEyNmEwOWUtYzkyOC00ZTQ4LTllZmUtMjk0Y2YwOGUzYjRiXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Back to the Future",year:1985,category:"Sci-Fi",ageMin:8,ageIdeal:9,series:"Back to the Future",mustWatch:true,description:"The perfect time travel movie. Funny, tight, inventive.",watchOrder:"All three in order. Part I is flawless.",omdbPlot:"Marty McFly, a 17-year-old high school student, is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his close friend, the maverick scientist Doc Brown.",omdbDirector:"Robert Zemeckis",omdbRuntime:"116 min",omdbRating:"PG",omdbImdbRating:"8.5",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZmM3ZjE0NzctNjBiOC00MDZmLTgzMTUtNGVlOWFlOTNiZDJiXkEyXkFqcGc@._V1_QL75_UX380_CR0,14,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Indiana Jones: Raiders of the Lost Ark",year:1981,category:"Adventure",ageMin:8,ageIdeal:10,series:"Indiana Jones",mustWatch:true,description:"The gold standard of adventure films. Pure cinematic joy.",watchOrder:"Start here. This is the one.",omdbPlot:"In 1936, archaeologist Indiana Jones is tasked by Army Intelligence to help locate a legendary ancient power, the Ark of Covenant, before the Nazis get it first.",omdbDirector:"Steven Spielberg",omdbRuntime:"115 min",omdbRating:"PG",omdbImdbRating:"8.4",omdbPoster:"https://m.media-amazon.com/images/M/MV5BOGNhMjg2ZjgtYzk4Ni00MTViLTg1MmUtYzM2MDZiYjZlMmU3XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Indiana Jones: The Last Crusade",year:1989,category:"Adventure",ageMin:8,ageIdeal:10,series:"Indiana Jones",mustWatch:true,description:"Sean Connery as Indy's dad. The emotional heart of the series.",watchOrder:"3rd in series.",omdbPlot:"In 1938, after his father goes missing while pursuing the Holy Grail, Indiana Jones finds himself up against the Nazis again to stop them from obtaining its powers.",omdbDirector:"Steven Spielberg",omdbRuntime:"127 min",omdbRating:"PG-13",omdbImdbRating:"8.2",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNGIxNzQ0YzYtMjNmYi00YjBlLWFjNzEtNGE3ZGFmYTczM2MwXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Jurassic Park",year:1993,category:"Sci-Fi",ageMin:8,ageIdeal:9,series:"",mustWatch:true,description:"The film that made dinosaurs real. Still holds up 30 years later.",watchOrder:"Standalone.",omdbPlot:"An industrialist invites some experts to visit his theme park of cloned dinosaurs. After a power failure, the creatures run loose, putting everyone's lives, including his grandchildren's, in danger.",omdbDirector:"Steven Spielberg",omdbRuntime:"127 min",omdbRating:"PG-13",omdbImdbRating:"8.2",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMjM2MDgxMDg0Nl5BMl5BanBnXkFtZTgwNTM2OTM5NDE@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Apollo 13",year:1995,category:"Biographical",ageMin:9,ageIdeal:10,series:"",mustWatch:true,description:"Three astronauts try to come home alive. Pure suspense from a true story.",watchOrder:"Standalone.",omdbPlot:"NASA must devise a strategy to return Apollo 13 to Earth safely after the spacecraft undergoes massive internal damage putting the lives of the three astronauts on board in jeopardy.",omdbDirector:"Ron Howard",omdbRuntime:"140 min",omdbRating:"PG",omdbImdbRating:"7.7",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMGZmNGY1OTAtNjFkYS00MjcyLWFlZjUtYzEyMDllZGZhMzM3XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Hoosiers",year:1986,category:"Sports",ageMin:9,ageIdeal:10,series:"",mustWatch:true,description:"Small Indiana high school basketball team goes to the state championship.",watchOrder:"Indiana pride. Standalone.",omdbPlot:"A coach with a checkered past and a local drunk train a small-town high school basketball team to become a top contender for the state championship in 1950s Indiana.",omdbDirector:"David Anspaugh",omdbRuntime:"114 min",omdbRating:"PG",omdbImdbRating:"7.4",omdbPoster:"https://m.media-amazon.com/images/M/MV5BOGFlMjJkNzYtMTMwYS00OWE0LWFkNzYtMGMzODIzOWM0ZDM2XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Miracle",year:2004,category:"Sports",ageMin:9,ageIdeal:10,series:"",mustWatch:true,description:"The 1980 US hockey team beating the Soviet Union at the Olympics.",watchOrder:"Standalone.",omdbPlot:"The true story of Herb Brooks, the player-turned-coach who led the 1980 U.S. Olympic hockey team to victory over the seemingly invincible Soviet squad.",omdbDirector:"Gavin O'Connor",omdbRuntime:"135 min",omdbRating:"PG",omdbImdbRating:"7.5",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMjEyOTk1OTcyNV5BMl5BanBnXkFtZTYwNjMzNDU3._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"The Lord of the Rings: Fellowship of the Ring",year:2001,category:"Epic Sagas",ageMin:9,ageIdeal:11,series:"Lord of the Rings",mustWatch:true,description:"The greatest fantasy epic ever put to film.",watchOrder:"Extended edition. All three required.",omdbPlot:"A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",omdbDirector:"Peter Jackson",omdbRuntime:"178 min",omdbRating:"PG-13",omdbImdbRating:"8.9",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg",_enriched:true},
  {id:uid(),title:"The Lord of the Rings: The Two Towers",year:2002,category:"Epic Sagas",ageMin:9,ageIdeal:11,series:"Lord of the Rings",mustWatch:true,description:"The Battle of Helm's Deep. Gollum brought to life.",watchOrder:"2nd in trilogy.",omdbPlot:"While Frodo and Sam edge closer to Mordor with the help of the shifty Gollum, the divided fellowship makes a stand against Sauron's new ally, Saruman, and his hordes of Isengard.",omdbDirector:"Peter Jackson",omdbRuntime:"179 min",omdbRating:"PG-13",omdbImdbRating:"8.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMGQxMDdiOWUtYjc1Ni00YzM1LWE2NjMtZTg3Y2JkMjEzMTJjXkEyXkFqcGc@._V1_QL75_UX380_CR0,14,380,562_.jpg",_enriched:true},
  {id:uid(),title:"The Lord of the Rings: Return of the King",year:2003,category:"Epic Sagas",ageMin:9,ageIdeal:11,series:"Lord of the Rings",mustWatch:true,description:"11 Academy Awards. The most satisfying conclusion to any trilogy.",watchOrder:"Extended edition finale.",omdbPlot:"Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",omdbDirector:"Peter Jackson",omdbRuntime:"201 min",omdbRating:"PG-13",omdbImdbRating:"9.0",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"The Hobbit: An Unexpected Journey",year:2012,category:"Epic Sagas",ageMin:8,ageIdeal:10,series:"The Hobbit",mustWatch:false,description:"A lighter journey into Middle-earth.",watchOrder:"After or before LOTR — either works.",omdbPlot:"A reluctant Hobbit, Bilbo Baggins, sets out to the Lonely Mountain with a spirited group of dwarves to reclaim their mountain home and the gold within it from the dragon Smaug.",omdbDirector:"Peter Jackson",omdbRuntime:"169 min",omdbRating:"PG-13",omdbImdbRating:"7.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMTcwNTE4MTUxMl5BMl5BanBnXkFtZTcwMDIyODM4OA@@._V1_QL75_UX380_CR0,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Rudy",year:1993,category:"Sports",ageMin:10,ageIdeal:11,series:"",mustWatch:true,description:"A kid with no talent who refuses to stop trying.",watchOrder:"Standalone.",omdbPlot:"Rudy has always been told that he was too small to play college football. But he is determined to overcome the odds and fulfill his dream of playing for Notre Dame.",omdbDirector:"David Anspaugh",omdbRuntime:"114 min",omdbRating:"PG",omdbImdbRating:"7.5",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNjQ1MWQ4MWQtZWQzMy00NmU1LThmYzItNGU1OTc5MWJjNzQ1XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Rocky",year:1976,category:"Sports",ageMin:10,ageIdeal:11,series:"Rocky",mustWatch:true,description:"The ultimate film about heart over talent.",watchOrder:"Just the first one is essential.",omdbPlot:"A small-time Philadelphia boxer gets a supremely rare chance to fight the world heavyweight champion in a bout in which he strives to go the distance for his self-respect.",omdbDirector:"John G. Avildsen",omdbRuntime:"120 min",omdbRating:"PG",omdbImdbRating:"8.1",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZDEyY2M2MGMtYjg5OC00ZWFjLWFkZDQtNmQzZTdiYmYzZTBkXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Top Gun",year:1986,category:"Action",ageMin:10,ageIdeal:12,series:"Top Gun",mustWatch:true,description:"Fighter pilots, competition, loss, and redemption.",watchOrder:"Watch before Maverick.",omdbPlot:"The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick is sent to the school, his reckless attitude and cocky demeanor put him at odds ...",omdbDirector:"Tony Scott",omdbRuntime:"110 min",omdbRating:"PG",omdbImdbRating:"7.0",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZmVjNzQ3MjYtYTZiNC00Y2YzLWExZTEtMTM2ZDllNDI0MzgyXkEyXkFqcGc@._V1_QL75_UX380_CR0,12,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Top Gun: Maverick",year:2022,category:"Action",ageMin:10,ageIdeal:13,series:"Top Gun",mustWatch:true,description:"A masterclass in legacy sequels. Better than the original.",watchOrder:"After the original.",omdbPlot:"The story involves Maverick confronting his past while training a group of younger Top Gun graduates, including the son of his deceased best friend, for a dangerous mission.",omdbDirector:"Joseph Kosinski",omdbRuntime:"130 min",omdbRating:"PG-13",omdbImdbRating:"8.2",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Groundhog Day",year:1993,category:"Comedy",ageMin:10,ageIdeal:12,series:"",mustWatch:true,description:"Secretly a profound film about self-improvement.",watchOrder:"Standalone.",omdbPlot:"A narcissistic, self-centered weatherman finds himself in a time loop on Groundhog Day.",omdbDirector:"Harold Ramis",omdbRuntime:"101 min",omdbRating:"PG",omdbImdbRating:"8.0",omdbPoster:"https://m.media-amazon.com/images/M/MV5BOWE3MjQ3ZDAtNDQ2MC00YjBjLTk0ZWYtNjQ0YzQ4YWE3YTEyXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"National Lampoon's Christmas Vacation",year:1989,category:"Comedy",ageMin:10,ageIdeal:11,series:"",mustWatch:true,description:"Clark Griswold's quest for the perfect Christmas.",watchOrder:"Annual Christmas tradition.",omdbPlot:"The Griswold family's plans for a big family Christmas predictably turn into a big disaster.",omdbDirector:"Jeremiah S. Chechik",omdbRuntime:"97 min",omdbRating:"PG-13",omdbImdbRating:"7.5",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZDgxYzI2YWItNmUyNS00ZWE4LWEzZDctYTk1M2VkYjhkOWVmXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"It's a Wonderful Life",year:1946,category:"Drama",ageMin:8,ageIdeal:10,series:"",mustWatch:true,description:"The ultimate film about legacy and meaning.",watchOrder:"Every Christmas, forever.",omdbPlot:"An angel is sent from Heaven to help a desperately frustrated businessman see the value of his own life.",omdbDirector:"Frank Capra",omdbRuntime:"130 min",omdbRating:"PG",omdbImdbRating:"8.6",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMDM4OWFhYjEtNTE5Yy00NjcyLTg5N2UtZDQwNDZlYjlmNDU5XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Field of Dreams",year:1989,category:"Sports",ageMin:11,ageIdeal:12,series:"",mustWatch:true,description:"If you build it, he will come. A film about fathers and sons.",watchOrder:"Watch this one together.",omdbPlot:"Iowa farmer Ray Kinsella is inspired by a voice he can't ignore to pursue a dream he can hardly believe. Supported by his wife, Ray begins the quest by turning his ordinary cornfield into a place where dreams can come true.",omdbDirector:"Phil Alden Robinson",omdbRuntime:"107 min",omdbRating:"PG",omdbImdbRating:"7.5",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZTEwMGYzNDktOWEyMi00NTJjLWE5MGQtNmNlNDkxOTYyZDA5XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Forrest Gump",year:1994,category:"Drama",ageMin:11,ageIdeal:12,series:"",mustWatch:true,description:"A simple man walks through American history.",watchOrder:"Standalone.",omdbPlot:"The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.",omdbDirector:"Robert Zemeckis",omdbRuntime:"142 min",omdbRating:"PG-13",omdbImdbRating:"8.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Jaws",year:1975,category:"Thriller",ageMin:11,ageIdeal:12,series:"",mustWatch:true,description:"The film that invented the summer blockbuster.",watchOrder:"Standalone.",omdbPlot:"When a massive killer shark unleashes chaos on a beach community off Long Island, it's up to the local police chief, a marine biologist, and an old seafarer to hunt the beast down.",omdbDirector:"Steven Spielberg",omdbRuntime:"124 min",omdbRating:"PG",omdbImdbRating:"8.1",omdbPoster:"https://m.media-amazon.com/images/M/MV5BYjViNDQzNmUtYzkxZi00NTk5LTljMmItYjJlZmZkODIxNjU1XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Interstellar",year:2014,category:"Sci-Fi",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"A father's love tested across space and time.",watchOrder:"Standalone. Watch in the dark.",omdbPlot:"When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",omdbDirector:"Christopher Nolan",omdbRuntime:"169 min",omdbRating:"PG-13",omdbImdbRating:"8.7",omdbPoster:"https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"To Kill a Mockingbird",year:1962,category:"Drama",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"Gregory Peck as Atticus Finch. Justice, innocence, and moral courage.",watchOrder:"Read the book alongside.",omdbPlot:"A widowed lawyer in Depression-era Alabama defends a black man against a false rape charge while teaching his young children about the sad reality of prejudice.",omdbDirector:"Robert Mulligan",omdbRuntime:"129 min",omdbRating:"Approved",omdbImdbRating:"8.2",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZTlkYWU4MGEtZmQyYi00OWEzLTgzY2EtYzVjOTEzYzAyNTk1XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Tombstone",year:1993,category:"Western",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"I'm your Huckleberry. The Western for people who aren't sure they like Westerns.",watchOrder:"Standalone.",omdbPlot:"A successful lawman's plans to retire anonymously in Tombstone, Arizona, are disrupted by the kind of outlaws he was famous for eliminating.",omdbDirector:"George P. Cosmatos",omdbRuntime:"130 min",omdbRating:"R",omdbImdbRating:"7.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNmQyMzlhNjUtMzRjYS00MWY4LWI5MDAtZGU1MWE2M2E0OGMxXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Ferris Bueller's Day Off",year:1986,category:"Comedy",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"Life moves pretty fast. A love letter to living in the moment.",watchOrder:"Standalone.",omdbPlot:"A brash, cocky high school senior, tired of skipping school to spend a boring day at home, is determined to enjoy an epic day roaring around his favorite Chicago sites, enlisting his best friend and girlfriend to join him on the a...",omdbDirector:"John Hughes",omdbRuntime:"103 min",omdbRating:"PG-13",omdbImdbRating:"7.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZWYwMjUxNjMtMzE0MC00NDM3LWIxMmQtYmEyNWVjNjdlZGZjXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"North by Northwest",year:1959,category:"Thriller",ageMin:12,ageIdeal:13,series:"Hitchcock",mustWatch:true,description:"Hitchcock's adventure thriller. The crop duster sequence alone.",watchOrder:"Best Hitchcock entry point.",omdbPlot:"A New York City advertising executive goes on the run after being mistaken for a government agent by a group of foreign spies, and falls for a woman whose loyalties he begins to doubt.",omdbDirector:"Alfred Hitchcock",omdbRuntime:"136 min",omdbRating:"Approved",omdbImdbRating:"8.3",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZWIzODI2OGItMzM0Ny00OGRmLTlkNmItMDQxMTFmMTk3YmQwXkEyXkFqcGc@._V1_QL75_UX380_CR0,5,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Chariots of Fire",year:1981,category:"Biographical",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"Two runners at the 1924 Olympics. One runs for pride, one for God.",watchOrder:"Standalone.",omdbPlot:"Two British track athletes, one a determined Jew and the other a devout Christian, are driven to win in the 1924 Olympics as they wrestle with issues of pride and conscience.",omdbDirector:"Hugh Hudson",omdbRuntime:"125 min",omdbRating:"PG",omdbImdbRating:"7.1",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZjkzZjFmZDEtNTliZi00MDcwLThjMTMtNmI5OGVmYjZjZDM1XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Mission: Impossible – Fallout",year:2018,category:"Action",ageMin:12,ageIdeal:14,series:"Mission: Impossible",mustWatch:true,description:"The pinnacle of practical action filmmaking.",watchOrder:"Best entry point, or start from the beginning.",omdbPlot:"A group of terrorists plans to detonate three plutonium cores for a simultaneous nuclear attack on different cities. Ethan Hunt, along with his IMF team, sets out to stop the carnage.",omdbDirector:"Christopher McQuarrie",omdbRuntime:"147 min",omdbRating:"PG-13",omdbImdbRating:"7.7",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZmUwZTg2YmMtMmZjOS00ZDYwLWI2ZDgtZDcyY2ZmMWMwZDdlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"The Dark Knight",year:2008,category:"Action",ageMin:13,ageIdeal:14,series:"Nolan Batman",mustWatch:true,description:"A crime epic. Heath Ledger's Joker is one of cinema's all-time performances.",watchOrder:"Watch Batman Begins first.",omdbPlot:"When a menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman, James Gordon and Harvey Dent must work together to put an end to the madness.",omdbDirector:"Christopher Nolan",omdbRuntime:"152 min",omdbRating:"PG-13",omdbImdbRating:"9.1",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Casino Royale",year:2006,category:"Spy",ageMin:13,ageIdeal:14,series:"James Bond",mustWatch:true,description:"Bond as a flawed human being. The best Bond film ever made.",watchOrder:"Start of the Daniel Craig era.",omdbPlot:"After earning a licence to kill, secret agent James Bond sets out on his first mission as 007. Bond must defeat a private banker funding terrorists in a high-stakes game of poker at Casino Royale, in Montenegro.",omdbDirector:"Martin Campbell",omdbRuntime:"144 min",omdbRating:"PG-13",omdbImdbRating:"8.0",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMWQ1ZDM4NDktMWY0NC00MjcxLWJlMDMtNmE2MGVhYzRjMWQ0XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Skyfall",year:2012,category:"Spy",ageMin:13,ageIdeal:14,series:"James Bond",mustWatch:true,description:"The most cinematic Bond film. Roger Deakins shot it.",watchOrder:"3rd in Craig era.",omdbPlot:"James Bond's loyalty to M is tested when her past comes back to haunt her. When MI6 comes under attack, 007 must track down and destroy the threat, no matter how personal the cost.",omdbDirector:"Sam Mendes",omdbRuntime:"143 min",omdbRating:"PG-13",omdbImdbRating:"7.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNjAzMWNkODUtM2FlMi00NzgyLWJhMGUtMWEyNDYyZGFiN2RlXkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"The Matrix",year:1999,category:"Sci-Fi",ageMin:13,ageIdeal:14,series:"The Matrix",mustWatch:true,description:"Reality is a simulation. Mind-bending action wrapped around genuine philosophy.",watchOrder:"Just the first film is essential.",omdbPlot:"When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",omdbDirector:"Lana Wachowski, Lilly Wachowski",omdbRuntime:"136 min",omdbRating:"R",omdbImdbRating:"8.7",omdbPoster:"https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Dead Poets Society",year:1989,category:"Drama",ageMin:13,ageIdeal:14,series:"",mustWatch:true,description:"O Captain, My Captain. A teacher who changes lives.",watchOrder:"Standalone.",omdbPlot:"Maverick teacher John Keating returns in 1959 to the prestigious New England boys' boarding school where he was once a star student, using poetry to embolden his pupils to new heights of self-expression.",omdbDirector:"Peter Weir",omdbRuntime:"128 min",omdbRating:"PG",omdbImdbRating:"8.1",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMDYwNGVlY2ItMWYxMS00YjZiLWE5MTAtYWM5NWQ2ZWJjY2Q3XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Dunkirk",year:2017,category:"War",ageMin:13,ageIdeal:14,series:"",mustWatch:true,description:"Nolan's non-linear war film. Three timelines on one beach.",watchOrder:"Standalone.",omdbPlot:"Allied soldiers from Belgium, the British Commonwealth and Empire, and France are surrounded by the German Army and evacuated during a fierce battle in World War II.",omdbDirector:"Christopher Nolan",omdbRuntime:"106 min",omdbRating:"PG-13",omdbImdbRating:"7.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMTE0Mjg4MTMwMDZeQTJeQWpwZ15BbWU4MDAwMDQ1ODAy._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Dune",year:2021,category:"Epic Sagas",ageMin:13,ageIdeal:14,series:"Dune",mustWatch:true,description:"The most ambitious sci-fi epic in decades.",watchOrder:"Part One, then Part Two (2024).",omdbPlot:"Paul Atreides arrives on Arrakis after his father accepts the stewardship of the dangerous planet. However, chaos ensues after a betrayal as forces clash to control melange, a precious resource.",omdbDirector:"Denis Villeneuve",omdbRuntime:"155 min",omdbRating:"PG-13",omdbImdbRating:"8.0",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNWIyNmU5MGYtZDZmNi00ZjAwLWJlYjgtZTc0ZGIxMDE4ZGYwXkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Dune: Part Two",year:2024,category:"Epic Sagas",ageMin:13,ageIdeal:15,series:"Dune",mustWatch:true,description:"Extraordinary filmmaking. A morally complex conclusion.",watchOrder:"Immediately after Part One.",omdbPlot:"Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible fu...",omdbDirector:"Denis Villeneuve",omdbRuntime:"166 min",omdbRating:"PG-13",omdbImdbRating:"8.4",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"The Good, the Bad and the Ugly",year:1966,category:"Western",ageMin:13,ageIdeal:15,series:"",mustWatch:true,description:"Ennio Morricone's score. The greatest Western ever made.",watchOrder:"Standalone.",omdbPlot:"A bounty-hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.",omdbDirector:"Sergio Leone",omdbRuntime:"178 min",omdbRating:"R",omdbImdbRating:"8.8",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMWM5ZjQxM2YtNDlmYi00ZDNhLWI4MWUtN2VkYjBlMTY1ZTkwXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Schindler's List",year:1993,category:"Drama",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"Spielberg's account of the Holocaust. A film that changes you.",watchOrder:"Watch with a parent. Discussion required.",_enriched:true},
  {id:uid(),title:"Saving Private Ryan",year:1998,category:"War",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"The most realistic war film ever made.",watchOrder:"Opening 20 minutes are extremely intense.",omdbPlot:"Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose comrades have been killed in action.",omdbDirector:"Steven Spielberg",omdbRuntime:"169 min",omdbRating:"R",omdbImdbRating:"8.6",omdbPoster:"https://m.media-amazon.com/images/M/MV5BZGZhZGQ1ZWUtZTZjYS00MDJhLWFkYjctN2ZlYjE5NWYwZDM2XkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Hacksaw Ridge",year:2016,category:"War",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"A conscientious objector saved 75 men without a weapon. True story.",watchOrder:"Standalone.",omdbPlot:"World War II American Army Medic Desmond T. Doss, serving during the Battle of Okinawa, refuses to kill people and becomes the first man in American history to receive the Medal of Honor without firing a shot.",omdbDirector:"Mel Gibson",omdbRuntime:"139 min",omdbRating:"R",omdbImdbRating:"8.1",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMjQ1NjM3MTUxNV5BMl5BanBnXkFtZTgwMDc5MTY5OTE@._V1_QL75_UX380_CR0,12,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Good Will Hunting",year:1997,category:"Drama",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"A genius afraid of his own gifts. Robin Williams is extraordinary.",watchOrder:"Standalone.",_enriched:true},
  {id:uid(),title:"The Shawshank Redemption",year:1994,category:"Drama",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"Hope, friendship, and perseverance. Consistently voted the greatest film ever.",watchOrder:"Standalone.",omdbPlot:"A wrongfully convicted banker forms a close friendship with a hardened convict over a quarter century while retaining his humanity through simple acts of compassion.",omdbDirector:"Frank Darabont",omdbRuntime:"142 min",omdbRating:"R",omdbImdbRating:"9.3",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",_enriched:true},
  {id:uid(),title:"Arrival",year:2016,category:"Sci-Fi",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"The most quietly devastating sci-fi film in decades.",watchOrder:"Don't look anything up first.",omdbPlot:"Linguist Louise Banks leads a team of investigators when gigantic spaceships touch down around the world. As nations teeter on the verge of global war, Banks and her crew must find a way to communicate with the extraterrestrial vi...",omdbDirector:"Denis Villeneuve",omdbRuntime:"116 min",omdbRating:"PG-13",omdbImdbRating:"7.9",omdbPoster:"https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"2001: A Space Odyssey",year:1968,category:"Sci-Fi",ageMin:14,ageIdeal:16,series:"",mustWatch:true,description:"Kubrick's monolith. Slow, strange, and visionary.",watchOrder:"Standalone. Patience required.",omdbPlot:"When a mysterious artifact is uncovered on the Moon, a spacecraft manned by two humans and one supercomputer is sent to Jupiter to find its origins.",omdbDirector:"Stanley Kubrick",omdbRuntime:"149 min",omdbRating:"G",omdbImdbRating:"8.3",omdbPoster:"https://m.media-amazon.com/images/M/MV5BNjU0NDFkMTQtZWY5OS00MmZhLTg3Y2QtZmJhMzMzMWYyYjc2XkEyXkFqcGc@._V1_SX300.jpg",_enriched:true},
  {id:uid(),title:"Oppenheimer",year:2023,category:"Biographical",ageMin:15,ageIdeal:16,series:"",mustWatch:true,description:"Three hours on the man who built the bomb.",watchOrder:"Some WWII history helps.",omdbPlot:"A dramatization of the life story of J. Robert Oppenheimer, the physicist who had a large hand in the development of the atomic bombs that brought an end to World War II.",omdbDirector:"Christopher Nolan",omdbRuntime:"180 min",omdbRating:"R",omdbImdbRating:"8.2",omdbPoster:"https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",_enriched:true},
];


async function fetchFilmTitles(query) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `Film search: "${query}". Return ONLY a JSON array of up to 5 matches, most well-known/popular version first. Each object: {"title":"exact title","year":number,"director":"director name","popular":true/false}. Set popular:true only for the most widely-known version when multiple versions exist (e.g. Titanic 1997 not 1943). No markdown.`
      }]
    })
  });
  const data = await response.json();
  const text = data.text || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

async function fetchFilmDetails(title, year) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_tokens: 700,
      messages: [{
        role: "user",
        content: `Return a JSON object for the film "${title}" (${year}). No explanation, no markdown, just raw JSON starting with { and ending with }.
Fields:
- title (string)
- year (number)  
- category (one of: Adventure, Action, Animated, Biographical, Comedy, Drama, Epic Sagas, Sci-Fi, Spy, Sports, Thriller, War, Western, Other)
- ageMin (number: youngest age this film is appropriate for)
- ageIdeal (number: ideal age to first watch for maximum impact)
- series (string or "")
- mustWatch (boolean: is this a genuinely essential/iconic film?)
- familyNote (string: 1-2 sentences about WHY this film matters specifically for a family to watch together — what it teaches, why it's worth watching as kids grow up, what conversations it sparks. Make it personal and meaningful, not a plot summary.)
- watchOrder (string: brief watch order note or viewing recommendation)`
      }]
    })
  });
  const data = await response.json();
  const text = data.text || "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return JSON.parse(text.slice(start, end + 1));
}

const OMDB_KEY = "1ec3603b";
async function fetchOmdb(title, year) {
  try {
    const q = encodeURIComponent(title);
    const url = `https://www.omdbapi.com/?t=${q}&y=${year}&plot=short&apikey=${OMDB_KEY}`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.Response === "False") {
      const r2 = await fetch(`https://www.omdbapi.com/?t=${q}&plot=short&apikey=${OMDB_KEY}`);
      const d2 = await r2.json();
      if (d2.Response === "False") return null;
      return d2;
    }
    return d;
  } catch { return null; }
}

const posterCache = {};
async function fetchPoster(title, year) {
  const key = `${title}:${year}`;
  if (posterCache[key] !== undefined) return posterCache[key];
  try {
    const r = await fetch(`/api/poster?title=${encodeURIComponent(title)}&year=${year}`);
    const d = await r.json();
    posterCache[key] = d.url || null;
    return posterCache[key];
  } catch {
    posterCache[key] = null;
    return null;
  }
}


function PosterImg({title, year, omdbPoster=null, size=48, radius=6, showPlaceholder=false}) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!title) { setLoading(false); return; }
    setLoading(true); setSrc(null); setImgError(false);
    if (omdbPoster) {
      setSrc(omdbPoster);
      setLoading(false);
    } else {
      fetchPoster(title, year).then(url => { setSrc(url); setLoading(false); });
    }
  }, [title, year, omdbPoster]);

  const h = Math.round(size * 1.5);

  if (loading) return (
    <div style={{width:size, height:h, borderRadius:radius, background:C.surfaceAlt,
      flexShrink:0, border:`1px solid ${C.border}`}}/>
  );

  if (!src || imgError) {
    return (
      <div style={{width:size, height:h, borderRadius:radius, background:C.surfaceAlt,
        flexShrink:0, border:`1px solid ${C.border}`, display:"flex",
        alignItems:"center", justifyContent:"center"}}>
        <span style={{fontSize:Math.round(size*0.3), color:C.muted}}>🎬</span>
      </div>
    );
  }

  return (
    <img src={src} alt={title}
      style={{width:size, height:h, objectFit:"cover", borderRadius:radius,
        flexShrink:0, border:`1px solid ${C.border}`, display:"block",
        background:C.surfaceAlt}}
      onError={() => setImgError(true)}/>
  );
}

function AgeBubble({a, size=36}) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:ageBg(a),border:`2px solid ${ageColor(a)}`,
      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:Math.round(size*0.28),fontWeight:700,color:ageColor(a),lineHeight:1}}>{a}+</span>
    </div>
  );
}
function KidBubble({kid,size=26,watched}) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:watched?kid.color:C.surface,border:`2px solid ${watched?kid.color:C.border}`,
      display:"flex",alignItems:"center",justifyContent:"center"}}
      title={`${kid.name}${watched?" · Watched":""}`}>
      <span style={{fontSize:Math.round(size*0.38),fontWeight:700,color:watched?"#fff":C.muted}}>{kid.name[0]}</span>
    </div>
  );
}
function Btn({children,onClick,variant="primary",small,style={}}) {
  const v = {
    primary:{background:C.hunterGreen,border:`1px solid ${C.hunterGreen}`,color:"#fff"},
    ghost:{background:"transparent",border:`1px solid ${C.border}`,color:C.muted},
    accent:{background:C.burntOrange,border:`1px solid ${C.burntOrange}`,color:"#fff"},
    danger:{background:"transparent",border:"1px solid #dc2626",color:"#dc2626"},
    light:{background:C.surface,border:`1px solid ${C.border}`,color:C.textMid},
  };
  return (
    <button onClick={onClick} style={{...v[variant],borderRadius:7,padding:small?"5px 12px":"8px 18px",
      fontSize:small?11:13,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.03em",
      transition:"opacity 0.15s",whiteSpace:"nowrap",...style}}
      onMouseEnter={e=>e.currentTarget.style.opacity="0.75"}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>
  );
}
function Modal({title,onClose,children,wide}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,
        width:"100%",maxWidth:wide?700:520,maxHeight:"92vh",overflowY:"auto",padding:26}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:16,fontWeight:600,color:C.text}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",padding:"0 4px",lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Inp({label,value,onChange,type="text",placeholder}) {
  return (
    <div style={{marginBottom:11}}>
      {label&&<div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:4,fontWeight:500}}>{label}</div>}
      <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,
          padding:"8px 11px",color:C.text,fontSize:13,fontFamily:"system-ui,sans-serif",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}
function Sel({label,value,onChange,options}) {
  return (
    <div style={{marginBottom:11}}>
      {label&&<div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:4,fontWeight:500}}>{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,
          padding:"8px 11px",color:C.text,fontSize:13,fontFamily:"system-ui,sans-serif",outline:"none"}}>
        {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
    </div>
  );
}
function Txt({label,value,onChange,placeholder,rows=2}) {
  return (
    <div style={{marginBottom:11}}>
      {label&&<div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:4,fontWeight:500}}>{label}</div>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,
          padding:"8px 11px",color:C.text,fontSize:13,fontFamily:"system-ui,sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
    </div>
  );
}

function AddFilmModal({onSave, onClose, existingTitles}) {
  const [step, setStep] = useState("search");
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState([]);
  const [titlesLoading, setTitlesLoading] = useState(false);
  const [film, setFilm] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (step !== "search") return;
    if (!query.trim() || query.length < 2) { setTitles([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setTitlesLoading(true); setError("");
      try { setTitles(await fetchFilmTitles(query)); }
      catch(e) { setTitles([]); }
      setTitlesLoading(false);
    }, 500);
    return () => clearTimeout(timerRef.current);
  }, [query, step]);

  const pick = async (t) => {
    if (existingTitles.some(e => e.toLowerCase() === t.title.toLowerCase())) return;
    setTitles([]);
    setQuery(t.title);
    setStep("loading-details");
    setError("");
    try {
      const [details, omdb] = await Promise.all([
        fetchFilmDetails(t.title, t.year),
        fetchOmdb(t.title, t.year)
      ]);
      const film = { ...details, id: uid() };
      if (omdb && omdb.Response !== "False") {
        film.omdbPlot = omdb.Plot !== "N/A" ? omdb.Plot : null;
        film.omdbDirector = omdb.Director !== "N/A" ? omdb.Director : null;
        film.omdbRuntime = omdb.Runtime !== "N/A" ? omdb.Runtime : null;
        film.omdbRating = omdb.Rated !== "N/A" ? omdb.Rated : null;
        film.omdbImdbRating = omdb.imdbRating !== "N/A" ? omdb.imdbRating : null;
        film.omdbPoster = omdb.Poster && omdb.Poster !== "N/A" ? omdb.Poster : null;
      }
      setFilm(film);
      setStep("confirm");
    } catch(e) {
      setError("Couldn't load film details. Try again.");
      setStep("search");
    }
  };

  const reset = () => { setStep("search"); setQuery(""); setTitles([]); setFilm(null); setError(""); };
  const u = (k) => (v) => setFilm(p => ({...p, [k]: v}));
  const alreadyAdded = film && existingTitles.some(t => t.toLowerCase() === film.title.toLowerCase());
  const showDrop = step === "search" && (titlesLoading || titles.length > 0);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,
      display:"flex",alignItems:"flex-start",justifyContent:"center",
      padding:"5vh 16px 40px",overflowY:"auto"}}
      onClick={onClose}>
      <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:580,
        boxShadow:"0 20px 60px rgba(0,0,0,0.18)",flexShrink:0}}
        onClick={e=>e.stopPropagation()}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`}}>
          <h2 style={{margin:0,fontSize:17,fontWeight:600,color:C.text}}>Add a Film</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,
            fontSize:24,cursor:"pointer",padding:"0 4px",lineHeight:1}}>×</button>
        </div>

        <div style={{padding:"20px 24px 24px"}}>

          {(step === "search" || step === "loading-details") && (<>
            <div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",
              color:C.muted,marginBottom:8,fontWeight:500}}>Search by title</div>

            <div style={{position:"relative"}}>
              <input ref={inputRef} value={query}
                onChange={e => { setQuery(e.target.value); setFilm(null); }}
                placeholder="e.g. The Godfather, Gladiator, Stand By Me…"
                disabled={step === "loading-details"}
                style={{width:"100%",background:C.bg,
                  border:`1px solid ${showDrop ? C.borderDark : C.border}`,
                  borderRadius: showDrop ? "8px 8px 0 0" : "8px",
                  padding:"12px 44px 12px 16px",color:C.text,fontSize:15,
                  fontFamily:"system-ui,sans-serif",outline:"none",
                  boxSizing:"border-box",opacity:step==="loading-details"?0.6:1}}/>
              <div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",
                color:C.muted,fontSize:14,pointerEvents:"none"}}>
                {titlesLoading||step==="loading-details" ? "⟳" : "🔍"}
              </div>
            </div>

            {showDrop && (
              <div style={{background:"#fff",border:`1px solid ${C.borderDark}`,
                borderTop:"none",borderRadius:"0 0 8px 8px",
                boxShadow:"0 4px 12px rgba(0,0,0,0.08)",overflow:"hidden",marginBottom:8}}>
                {titlesLoading && titles.length === 0 && (
                  <div style={{padding:"14px 16px",color:C.muted,fontSize:13}}>Searching…</div>
                )}
                {titles.map((t, i) => {
                  const exists = existingTitles.some(e => e.toLowerCase() === t.title.toLowerCase());
                  return (
                    <div key={i} onClick={() => pick(t)}
                      style={{padding:"13px 16px",
                        borderBottom: i < titles.length-1 ? `1px solid ${C.border}` : "none",
                        cursor: exists ? "default" : "pointer",
                        background: exists ? "#fafaf8" : "#fff",
                        opacity: exists ? 0.55 : 1, transition:"background 0.1s"}}
                      onMouseEnter={e=>{if(!exists)e.currentTarget.style.background=C.surface;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=exists?"#fafaf8":"#fff";}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:14,color:C.text,fontWeight:600}}>{t.title}</span>
                        <span style={{fontSize:12,color:C.muted}}>{t.year}</span>
                        {t.popular && (
                          <span style={{fontSize:10,background:"#fff5ed",color:C.burntOrange,
                            padding:"2px 7px",borderRadius:8,border:"1px solid #fdd8b8",fontWeight:600}}>
                            Most Popular
                          </span>
                        )}
                        {exists && <span style={{fontSize:10,color:C.muted,fontStyle:"italic"}}>already in list</span>}
                      </div>
                      {t.director && (
                        <div style={{fontSize:11,color:C.muted,marginTop:2}}>dir. {t.director}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {step === "loading-details" && (
              <div style={{marginTop:14,padding:"16px",background:C.bg,borderRadius:8,
                border:`1px solid ${C.border}`,textAlign:"center",color:C.muted,fontSize:13}}>
                Loading details for <strong style={{color:C.text}}>{query}</strong>…
              </div>
            )}

            {!query && step === "search" && (
              <div style={{marginTop:14,textAlign:"center",color:C.mutedLight,fontSize:12}}>
                Type a title — suggestions appear as you type
              </div>
            )}
          </>)}

          {error && (
            <div style={{padding:"11px 14px",background:"#fee2e2",borderRadius:8,
              color:"#991b1b",fontSize:13,marginTop:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>{error}</span>
              <button onClick={reset} style={{background:"none",border:"none",color:"#991b1b",
                textDecoration:"underline",cursor:"pointer",fontFamily:"inherit",fontSize:12,flexShrink:0,marginLeft:10}}>
                Try again
              </button>
            </div>
          )}

          {step === "confirm" && film && (<>
            <div style={{padding:"16px",background:C.bg,borderRadius:10,
              border:`1px solid ${C.border}`,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:10}}>
                <PosterImg title={film.title} year={film.year} omdbPoster={film.omdbPoster} size={72} radius={8} showPlaceholder/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                    <span style={{fontSize:17,fontWeight:700,color:C.text}}>{film.title}</span>
                    {film.mustWatch && (
                      <span style={{fontSize:11,color:C.burntOrange,fontWeight:600,
                        background:"#fff5ed",padding:"2px 8px",borderRadius:10,border:"1px solid #fdd8b8"}}>
                        ★ Must-Watch
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:12,color:C.muted,display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
                    <span>{film.year}</span>
                    <span>{film.category}</span>
                    {film.omdbDirector&&<span>dir. {film.omdbDirector}</span>}
                    {film.omdbRuntime&&<span>{film.omdbRuntime}</span>}
                    {film.omdbRating&&<span style={{padding:"0px 5px",background:C.surfaceAlt,borderRadius:3,
                      border:`1px solid ${C.border}`,fontSize:11}}>{film.omdbRating}</span>}
                    {film.omdbImdbRating&&<span>⭐ {film.omdbImdbRating}</span>}
                  </div>
                  <AgeBubble a={film.ageIdeal} size={38}/>
                </div>
              </div>
              {film.omdbPlot&&(
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",
                    color:C.muted,fontWeight:500,marginBottom:4}}>Plot</div>
                  <p style={{margin:0,fontSize:13,color:C.textMid,lineHeight:1.6}}>{film.omdbPlot}</p>
                </div>
              )}
              {film.familyNote&&(
                <div style={{background:"#fff",borderRadius:6,padding:"9px 12px",
                  border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.burntOrange}`}}>
                  <div style={{fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",
                    color:C.burntOrange,fontWeight:600,marginBottom:3}}>Why it matters for your family</div>
                  <p style={{margin:0,fontSize:13,color:C.textMid,lineHeight:1.6,fontStyle:"italic"}}>{film.familyNote}</p>
                </div>
              )}
              {film.watchOrder && (
                <div style={{fontSize:12,color:C.muted,display:"flex",gap:6,alignItems:"flex-start",marginTop:8}}>
                  <span>📽</span><span>{film.watchOrder}</span>
                </div>
              )}
            </div>

            {alreadyAdded && (
              <div style={{padding:"10px 14px",background:"#fef3c7",borderRadius:7,
                color:"#92400e",fontSize:13,marginBottom:14,border:"1px solid #fde68a"}}>
                This film is already in your list.
              </div>
            )}

            <div style={{fontSize:10,color:C.muted,marginBottom:10,letterSpacing:"0.08em",fontWeight:500}}>ADJUST IF NEEDED</div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}><Inp label="Min Age" value={film.ageMin} onChange={v=>u("ageMin")(parseInt(v)||"")} type="number"/></div>
              <div style={{flex:1}}><Inp label="Ideal Age" value={film.ageIdeal} onChange={v=>u("ageIdeal")(parseInt(v)||"")} type="number"/></div>
              <div style={{flex:2}}><Sel label="Category" value={film.category} onChange={u("category")} options={CATEGORIES}/></div>
            </div>
            <Txt label="Description" value={film.description} onChange={u("description")} rows={2}/>
            <Txt label="Watch Order / Notes" value={film.watchOrder||""} onChange={u("watchOrder")} rows={1}/>
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:20}}>
              <input type="checkbox" checked={film.mustWatch} onChange={e=>u("mustWatch")(e.target.checked)}
                style={{accentColor:C.burntOrange,width:15,height:15}}/>
              <span style={{fontSize:13,color:C.text}}>Must-Watch ★</span>
            </label>

            <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
              <Btn variant="light" onClick={reset}>← Search Again</Btn>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                <Btn variant="accent" onClick={()=>!alreadyAdded&&onSave(film)}
                  style={{opacity:alreadyAdded?0.4:1}}>Add to List</Btn>
              </div>
            </div>
          </>)}

        </div>
      </div>
    </div>
  );
}

function FilmModal({movie: initialMovie, kids, watches, onSave, onDelete, onClose, isCustom}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({...initialMovie});
  const [movie, setMovie] = useState(initialMovie);
  const [local, setLocal] = useState(
    kids.reduce((acc,k)=>{
      const w=watches[`${initialMovie.id}:${k.id}`];
      acc[k.id]={watched:w?.watched||false,date:w?.date||"",note:w?.note||""};
      return acc;
    },{})
  );
  const ud=(k)=>(v)=>setDraft(p=>({...p,[k]:v}));

  const saveEdit = () => {
    setMovie(draft);
    onSave(draft.id, null, draft);
    setEditing(false);
  };
  const cancelEdit = () => { setDraft({...movie}); setEditing(false); };

  return (
    <Modal title="" onClose={onClose} wide>
      <div style={{background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,
        marginBottom:20,overflow:"hidden"}}>

        <div style={{padding:"14px 16px 0",display:"flex",alignItems:"flex-start",
          justifyContent:"space-between",gap:10}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:700,color:C.text,lineHeight:1.2}}>{movie.title}</h2>
              {movie.mustWatch&&(
                <span style={{fontSize:11,color:C.burntOrange,fontWeight:600,background:"#fff5ed",
                  padding:"2px 8px",borderRadius:10,border:"1px solid #fdd8b8",flexShrink:0}}>★ Must-Watch</span>
              )}
            </div>
            <div style={{fontSize:12,color:C.muted,display:"flex",gap:10,flexWrap:"wrap"}}>
              <span>{movie.year}</span>
              <span>{movie.category}</span>
              {movie.series&&<span>{movie.series}</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0,marginTop:2}}>
            {isCustom&&!editing&&(
              <button onClick={()=>setEditing(true)}
                style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,
                  padding:"5px 11px",fontSize:12,color:C.muted,cursor:"pointer",
                  fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderDark}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                ✎ Edit
              </button>
            )}
            {isCustom&&(
              <button onClick={onDelete}
                style={{background:"#fff",border:"1px solid #fecaca",borderRadius:6,
                  padding:"5px 11px",fontSize:12,color:"#ef4444",cursor:"pointer",
                  fontFamily:"inherit"}}
                onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
                onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                🗑
              </button>
            )}
          </div>
        </div>

        <div style={{padding:"12px 16px 14px",display:"flex",gap:14,alignItems:"flex-start"}}>
          <PosterImg title={movie.title} year={movie.year} omdbPoster={movie.omdbPoster} size={80} radius={8} showPlaceholder/>
          <div style={{flex:1,minWidth:0}}>
            {(movie.omdbDirector||movie.omdbRuntime||movie.omdbRating||movie.omdbImdbRating)&&(
              <div style={{fontSize:12,color:C.muted,display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
                {movie.omdbDirector&&<span>dir. {movie.omdbDirector}</span>}
                {movie.omdbRuntime&&<span>{movie.omdbRuntime}</span>}
                {movie.omdbRating&&<span style={{padding:"1px 5px",background:C.surfaceAlt,borderRadius:3,
                  border:`1px solid ${C.border}`,fontSize:11}}>{movie.omdbRating}</span>}
                {movie.omdbImdbRating&&<span>⭐ {movie.omdbImdbRating}/10</span>}
              </div>
            )}
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",
                borderRadius:8,background:"#fff",border:`1px solid ${C.border}`}}>
                <AgeBubble a={movie.ageMin} size={28}/>
                <div>
                  <div style={{fontSize:9,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>Min Age</div>
                  <div style={{fontSize:13,fontWeight:600,color:ageColor(movie.ageMin)}}>{movie.ageMin}+</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",
                borderRadius:8,background:"#fff",border:`1px solid ${C.border}`}}>
                <AgeBubble a={movie.ageIdeal} size={28}/>
                <div>
                  <div style={{fontSize:9,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>Ideal Age</div>
                  <div style={{fontSize:13,fontWeight:600,color:ageColor(movie.ageIdeal)}}>{movie.ageIdeal}+</div>
                </div>
              </div>
            </div>
            {movie.omdbPlot&&(
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",
                  color:C.muted,fontWeight:500,marginBottom:3}}>Plot</div>
                <p style={{margin:0,fontSize:13,color:C.textMid,lineHeight:1.65}}>{movie.omdbPlot}</p>
              </div>
            )}
            {(movie.familyNote||movie.description)&&(
              <div style={{background:"#fff",borderRadius:6,padding:"9px 12px",
                border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.burntOrange}`,marginBottom:10}}>
                <div style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",
                  color:C.burntOrange,fontWeight:600,marginBottom:3}}>Why it matters for your family</div>
                <p style={{margin:0,fontSize:13,color:C.textMid,lineHeight:1.65,fontStyle:"italic"}}>
                  {movie.familyNote||movie.description}
                </p>
              </div>
            )}
            {movie.watchOrder&&(
              <div style={{fontSize:12,color:C.muted,background:"#fff",padding:"8px 11px",
                borderRadius:6,border:`1px solid ${C.border}`,display:"flex",gap:7,alignItems:"flex-start"}}>
                <span style={{flexShrink:0}}>📽</span>
                <span>{movie.watchOrder}</span>
              </div>
            )}
          </div>
        </div>

        {kids.length>0&&(
          <div style={{padding:"0 16px 14px",display:"flex",gap:7,flexWrap:"wrap"}}>
            {kids.map(kid=>{
              const w=watches[`${movie.id}:${kid.id}`];
              const kidAge=calcAge(kid.dob);
              const ready=kidAge===null||kidAge>=movie.ageMin;
              return (
                <div key={kid.id} style={{display:"flex",alignItems:"center",gap:6,
                  padding:"5px 11px",borderRadius:20,
                  border:`1px solid ${w?.watched?kid.color:C.border}`,
                  background:w?.watched?kid.color+"18":"#fff"}}>
                  <KidBubble kid={kid} size={20} watched={!!w?.watched}/>
                  <span style={{fontSize:12,fontWeight:w?.watched?600:400,
                    color:w?.watched?kid.color:C.muted}}>{kid.name}</span>
                  {!w?.watched&&(
                    <span style={{fontSize:10,color:ready?"#16a34a":"#dc2626"}}>
                      {ready?"ready":"not yet"}
                    </span>
                  )}
                  {w?.watched&&w?.date&&(
                    <span style={{fontSize:10,color:C.muted}}>
                      {new Date(w.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",year:"numeric"})}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {editing&&(
          <div style={{borderTop:`1px solid ${C.border}`,padding:"16px 16px 14px",background:"#fff"}}>
            <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",
              marginBottom:12,fontWeight:500}}>Edit Details</div>
            <Inp label="Title" value={draft.title} onChange={ud("title")}/>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}><Inp label="Year" value={draft.year} onChange={v=>ud("year")(parseInt(v)||"")} type="number"/></div>
              <div style={{flex:2}}><Sel label="Category" value={draft.category} onChange={ud("category")} options={CATEGORIES}/></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}><Inp label="Min Age" value={draft.ageMin} onChange={v=>ud("ageMin")(parseInt(v)||"")} type="number"/></div>
              <div style={{flex:1}}><Inp label="Ideal Age" value={draft.ageIdeal} onChange={v=>ud("ageIdeal")(parseInt(v)||"")} type="number"/></div>
              <div style={{flex:2}}><Inp label="Series" value={draft.series||""} onChange={ud("series")} placeholder="e.g. Indiana Jones"/></div>
            </div>
            <Txt label="Description" value={draft.description} onChange={ud("description")} rows={2}/>
            <Txt label="Watch Order / Notes" value={draft.watchOrder||""} onChange={ud("watchOrder")} rows={1}/>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:14}}>
              <input type="checkbox" checked={draft.mustWatch}
                onChange={e=>ud("mustWatch")(e.target.checked)}
                style={{accentColor:C.burntOrange,width:15,height:15}}/>
              <span style={{fontSize:13,color:C.text}}>Must-Watch ★</span>
            </label>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn variant="ghost" onClick={cancelEdit}>Cancel</Btn>
              <Btn onClick={saveEdit}>Save Changes</Btn>
            </div>
          </div>
        )}
      </div>

      <div>
        <div style={{fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",
          color:C.muted,fontWeight:500,marginBottom:12}}>Log Watches</div>

        {kids.length===0&&(
          <p style={{color:C.muted,fontSize:13,padding:"10px 0"}}>Add kids in the Kids tab first.</p>
        )}

        {kids.map(kid=>{
          const kidAge=calcAge(kid.dob);
          const ready=kidAge===null||kidAge>=movie.ageMin;
          const isWatched=local[kid.id]?.watched||false;
          return (
            <div key={kid.id} style={{marginBottom:10,padding:14,background:C.bg,
              borderRadius:8,border:`2px solid ${isWatched?kid.color:C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,
                marginBottom:isWatched?14:0}}>
                <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",flex:1}}>
                  <input type="checkbox" checked={isWatched}
                    onChange={e=>setLocal(p=>({...p,[kid.id]:{...p[kid.id],watched:e.target.checked}}))}
                    style={{accentColor:kid.color,width:18,height:18}}/>
                  <div style={{width:30,height:30,borderRadius:"50%",
                    background:isWatched?kid.color:C.surface,
                    border:`2px solid ${kid.color}`,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:13,fontWeight:700,
                      color:isWatched?"#fff":C.muted}}>{kid.name[0]}</span>
                  </div>
                  <span style={{fontSize:15,color:C.text,fontWeight:500}}>{kid.name}</span>
                </label>
                {kidAge!==null&&(
                  <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,
                    background:ready?"#dcfce7":"#fee2e2",
                    color:ready?"#16a34a":"#dc2626",
                    border:`1px solid ${ready?"#bbf7d0":"#fecaca"}`}}>
                    Age {kidAge} · {ready?"Ready":`Min ${movie.ageMin}`}
                  </span>
                )}
              </div>
              {isWatched&&(<>
                <Inp label="Date Watched" value={local[kid.id].date}
                  onChange={v=>setLocal(p=>({...p,[kid.id]:{...p[kid.id],date:v}}))} type="date"/>
                <Txt label={kid.name+"'s Notes"} value={local[kid.id].note}
                  onChange={v=>setLocal(p=>({...p,[kid.id]:{...p[kid.id],note:v}}))}
                  placeholder="What did they think? Favorite moment? Questions it raised?"/>
              </>)}
            </div>
          );
        })}

        {kids.length>0&&(
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
            <Btn variant="ghost" onClick={onClose}>Close</Btn>
            <Btn variant="accent" onClick={()=>onSave(movie.id,local)}>Save</Btn>
          </div>
        )}
      </div>
    </Modal>
  );
}

function KidForm({initial,onSave,onClose,existingCount}) {
  const [f,setF]=useState(initial??{name:"",dob:"",color:KID_COLORS[existingCount%KID_COLORS.length]});
  return (<>
    <Inp label="Name" value={f.name} onChange={v=>setF(p=>({...p,name:v}))} placeholder="e.g. Jed"/>
    <Inp label="Birthday" value={f.dob} onChange={v=>setF(p=>({...p,dob:v}))} type="date"/>
    <div style={{marginBottom:18}}>
      <div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:8,fontWeight:500}}>Color</div>
      <div style={{display:"flex",gap:8}}>
        {KID_COLORS.map(col=>(
          <div key={col} onClick={()=>setF(p=>({...p,color:col}))}
            style={{width:28,height:28,borderRadius:"50%",background:col,cursor:"pointer",
              border:`3px solid ${f.color===col?C.text:"transparent"}`,boxSizing:"border-box"}}/>
        ))}
      </div>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      <Btn onClick={()=>{if(f.name)onSave(f);}}>Save</Btn>
    </div>
  </>);
}

function KidDetailModal({kid,movies,watches,onClose}) {
  const watched=movies.filter(m=>watches[`${m.id}:${kid.id}`]?.watched)
    .sort((a,b)=>(watches[`${b.id}:${kid.id}`]?.date||"").localeCompare(watches[`${a.id}:${kid.id}`]?.date||""));
  return (
    <Modal title={`${kid.name} — Watch History`} onClose={onClose} wide>
      {watched.length===0&&<p style={{color:C.muted,textAlign:"center",padding:"20px 0"}}>No films logged yet.</p>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {watched.map(m=>{
          const w=watches[`${m.id}:${kid.id}`];
          return (
            <div key={m.id} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:w.note?7:0}}>
                <AgeBubble a={m.ageIdeal} size={30}/>
                <div style={{flex:1}}>
                  <span style={{fontSize:14,color:C.text,fontWeight:500}}>{m.title}</span>
                  <span style={{fontSize:12,color:C.muted,marginLeft:8}}>{m.year}</span>
                </div>
                {w.date&&<span style={{fontSize:11,color:C.muted}}>
                  {new Date(w.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                </span>}
              </div>
              {w.note&&<div style={{fontSize:13,color:C.textMid,fontStyle:"italic",paddingLeft:40}}>"{w.note}"</div>}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function dbToMovie(row) {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    category: row.category,
    ageMin: row.age_min,
    ageIdeal: row.age_ideal,
    series: row.series || '',
    mustWatch: row.must_watch || false,
    description: row.description || '',
    watchOrder: row.watch_order || '',
    familyNote: row.family_note || '',
    omdbPlot: row.omdb_plot || null,
    omdbDirector: row.omdb_director || null,
    omdbRuntime: row.omdb_runtime || null,
    omdbRating: row.omdb_rating || null,
    omdbImdbRating: row.omdb_imdb_rating || null,
    omdbPoster: row.omdb_poster || null,
    _custom: true,
    _enriched: true,
  };
}

function movieToDb(movie, familyId) {
  return {
    id: movie.id,
    family_id: familyId,
    title: movie.title,
    year: movie.year,
    category: movie.category,
    age_min: movie.ageMin,
    age_ideal: movie.ageIdeal,
    series: movie.series || null,
    must_watch: movie.mustWatch || false,
    description: movie.description || null,
    watch_order: movie.watchOrder || null,
    family_note: movie.familyNote || null,
    omdb_plot: movie.omdbPlot || null,
    omdb_director: movie.omdbDirector || null,
    omdb_runtime: movie.omdbRuntime || null,
    omdb_rating: movie.omdbRating || null,
    omdb_imdb_rating: movie.omdbImdbRating || null,
    omdb_poster: movie.omdbPoster || null,
  };
}

function LoginScreen({onLogin}) {
  const [mode, setMode] = useState('signin');
  const [familyName, setFamilyName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !pin.trim()) { setError('Username and PIN are required.'); return; }
    if (mode === 'create' && !familyName.trim()) { setError('Family name is required.'); return; }
    setLoading(true); setError('');
    try {
      if (mode === 'signin') {
        const { data, error: err } = await supabase
          .from('cc_families')
          .select('id, username, family_name')
          .eq('username', username.trim().toLowerCase())
          .eq('pin', pin.trim())
          .single();
        if (err || !data) { setError('Username or PIN is incorrect.'); setLoading(false); return; }
        const f = {id: data.id, username: data.username, familyName: data.family_name};
        localStorage.setItem('cc-family', JSON.stringify(f));
        onLogin(f);
      } else {
        const check = await supabase.from('cc_families').select('id').eq('username', username.trim().toLowerCase()).single();
        if (check.data) { setError('That username is already taken.'); setLoading(false); return; }
        const { data, error: err } = await supabase
          .from('cc_families')
          .insert({username: username.trim().toLowerCase(), pin: pin.trim(), family_name: familyName.trim()})
          .select('id, username, family_name')
          .single();
        if (err || !data) { setError('Could not create account. Try again.'); setLoading(false); return; }
        const f = {id: data.id, username: data.username, familyName: data.family_name};
        localStorage.setItem('cc-family', JSON.stringify(f));
        onLogin(f);
      }
    } catch(e) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",color:C.burntOrange,fontWeight:600,marginBottom:6}}>What Will Last</div>
          <h1 style={{margin:"0 0 6px",fontSize:26,fontWeight:700,color:C.text,letterSpacing:"0.02em"}}>Family Cinema Canon</h1>
          <p style={{margin:0,fontSize:13,color:C.muted}}>Track the films that shape your family</p>
        </div>

        <div style={{background:"#fff",borderRadius:14,border:`1px solid ${C.border}`,padding:"28px 28px 24px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",marginBottom:22,background:C.bg,borderRadius:8,padding:3}}>
            {[['signin','Sign In'],['create','Create Family']].map(([m,l])=>(
              <button key={m} onClick={()=>{setMode(m);setError('');}}
                style={{flex:1,padding:"7px 0",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",
                  fontSize:12,fontWeight:mode===m?600:400,
                  background:mode===m?"#fff":C.bg,
                  color:mode===m?C.text:C.muted,
                  boxShadow:mode===m?"0 1px 4px rgba(0,0,0,0.08)":"none",
                  transition:"all 0.15s"}}>{l}</button>
            ))}
          </div>

          {mode === 'create' && (
            <Inp label="Family Name" value={familyName} onChange={setFamilyName} placeholder="e.g. The Williams Family"/>
          )}
          <Inp label="Username" value={username} onChange={v=>setUsername(v.toLowerCase())} placeholder="e.g. williamsfamily"/>
          <Inp label="PIN" value={pin} onChange={setPin} type="password" placeholder="4–8 digits or letters"/>

          {error && (
            <div style={{padding:"9px 12px",background:"#fee2e2",borderRadius:7,color:"#991b1b",fontSize:12,marginBottom:14}}>
              {error}
            </div>
          )}

          <Btn onClick={handleSubmit} style={{width:"100%",padding:"11px 0",fontSize:14,marginTop:4,
            opacity:loading?0.6:1,pointerEvents:loading?"none":"auto"}}>
            {loading ? "…" : mode === 'signin' ? 'Sign In' : 'Create Family'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [family, setFamily] = useState(null);
  const [kids, setKids] = useState([]);
  const [watches, setWatches] = useState({});
  const [customMovies, setCustomMovies] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [filterCat, setFilterCat] = useState("All");
  const [filterAge, setFilterAge] = useState("All");
  const [filterKid, setFilterKid] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMust, setFilterMust] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("ageIdeal");

  const [addModal, setAddModal] = useState(false);
  const [filmModal, setFilmModal] = useState(null);
  const [kidModal, setKidModal] = useState(null);
  const [kidDetail, setKidDetail] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [tab, setTab] = useState("list");

  useEffect(() => {
    const saved = localStorage.getItem('cc-family');
    if (saved) {
      try {
        const f = JSON.parse(saved);
        setFamily(f);
        loadFamilyData(f.id);
      } catch { setLoaded(true); }
    } else {
      setLoaded(true);
    }
  }, []);

  const movies = [...SEED_MOVIES, ...customMovies];

  async function loadFamilyData(familyId) {
    const [kidsRes, watchesRes, moviesRes] = await Promise.all([
      supabase.from('cc_kids').select('*').eq('family_id', familyId),
      supabase.from('cc_watches').select('*').eq('family_id', familyId),
      supabase.from('cc_custom_movies').select('*').eq('family_id', familyId),
    ]);
    setKids((kidsRes.data || []).map(k => ({id:k.id, name:k.name, dob:k.dob, color:k.color})));
    const watchesObj = {};
    for (const w of (watchesRes.data || [])) {
      watchesObj[`${w.movie_id}:${w.kid_id}`] = {watched:w.watched, date:w.watch_date||'', note:w.note||''};
    }
    setWatches(watchesObj);
    setCustomMovies((moviesRes.data || []).map(dbToMovie));
    setLoaded(true);
  }

  const signOut = () => {
    localStorage.removeItem('cc-family');
    setFamily(null); setKids([]); setWatches({}); setCustomMovies([]);
    setLoaded(true);
  };

  const handleLogin = (f) => { setFamily(f); loadFamilyData(f.id); };

  const addMovie = async (f) => {
    const newMovie = {...f, id: uid(), _custom: true};
    await supabase.from('cc_custom_movies').insert(movieToDb(newMovie, family.id));
    setCustomMovies(p => [...p, newMovie]);
    setAddModal(false);
  };

  const saveFromFilmModal = async (movieId, kidData, updatedFilm) => {
    if (kidData) {
      const rows = Object.entries(kidData).map(([kidId, v]) => ({
        family_id: family.id, kid_id: kidId, movie_id: movieId,
        watched: v.watched, watch_date: v.date||null, note: v.note||null,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('cc_watches').upsert(rows, {onConflict: 'kid_id,movie_id'});
      setWatches(p => {
        const n = {...p};
        Object.entries(kidData).forEach(([kId, v]) => { n[`${movieId}:${kId}`] = v; });
        return n;
      });
    }
    if (updatedFilm && updatedFilm._custom) {
      await supabase.from('cc_custom_movies').update(movieToDb(updatedFilm, family.id)).eq('id', updatedFilm.id);
      setCustomMovies(p => p.map(m => m.id === updatedFilm.id ? updatedFilm : m));
    }
    setFilmModal(null);
  };

  const deleteMovie = async (id) => {
    await supabase.from('cc_custom_movies').delete().eq('id', id);
    await supabase.from('cc_watches').delete().eq('movie_id', id).eq('family_id', family.id);
    setCustomMovies(p => p.filter(m => m.id !== id));
    setWatches(p => {const n={...p}; Object.keys(n).filter(k=>k.startsWith(id+':')).forEach(k=>delete n[k]); return n;});
    setFilmModal(null); setDeleteConfirm(null);
  };

  const addKid = async (f) => {
    const newKid = {...f, id: uid()};
    await supabase.from('cc_kids').insert({id:newKid.id, family_id:family.id, name:newKid.name, dob:newKid.dob, color:newKid.color});
    setKids(p => [...p, newKid]);
    setKidModal(null);
  };
  const editKid = async (f) => {
    await supabase.from('cc_kids').update({name:f.name, dob:f.dob, color:f.color}).eq('id', f.id);
    setKids(p => p.map(k => k.id === f.id ? f : k));
    setKidModal(null);
  };
  const deleteKid = async (id) => {
    await supabase.from('cc_kids').delete().eq('id', id);
    setKids(p => p.filter(k => k.id !== id));
    setWatches(p => {const n={...p}; Object.keys(n).filter(k=>k.endsWith(':'+id)).forEach(k=>delete n[k]); return n;});
  };

  const jumpToList = (kidName, status) => {
    setTab("list"); setFilterKid(kidName); setFilterStatus(status);
    setFilterCat("All"); setFilterAge("All"); setFilterMust(false); setSearch("");
  };

  const kidStats = (kid) => {
    const kidAge = calcAge(kid.dob);
    const total = movies.length;
    const w = movies.filter(m => watches[`${m.id}:${kid.id}`]?.watched).length;
    const r = movies.filter(m => kidAge!==null && kidAge>=m.ageMin && !watches[`${m.id}:${kid.id}`]?.watched).length;
    return {total, watched:w, ready:r, coming:total-w-r, pct:total?Math.round((w/total)*100):0};
  };

  const filtered = movies.filter(m => {
    if (filterCat !== "All" && m.category !== filterCat) return false;
    const [lo, hi] = AGE_GROUPS[filterAge] || [0, 99];
    if (m.ageIdeal < lo || m.ageIdeal > hi) return false;
    if (filterMust && !m.mustWatch) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) &&
        !m.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterKid !== "All" && filterStatus !== "All") {
      const kid = kids.find(k => k.name === filterKid);
      if (kid) {
        const w = watches[`${m.id}:${kid.id}`];
        const isW = w?.watched;
        const kidAge = calcAge(kid.dob);
        if (filterStatus === "Watched" && !isW) return false;
        if (filterStatus === "Unwatched" && isW) return false;
        if (filterStatus === "Ready" && (isW || (kidAge !== null && kidAge < m.ageMin))) return false;
        if (filterStatus === "Not Ready" && (isW || (kidAge === null || kidAge >= m.ageMin))) return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sort === "ageIdeal") return a.ageIdeal - b.ageIdeal;
    if (sort === "year") return a.year - b.year;
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "category") return a.category.localeCompare(b.category);
    return 0;
  });

  const allCats = ["All", ...CATEGORIES.filter(c => movies.some(m => m.category === c))];
  const totalWatches = Object.values(watches).filter(w => w.watched).length;
  const activeFilters = filterCat !== "All" || filterAge !== "All" || filterKid !== "All" || filterStatus !== "All" || filterMust || search;

  if (!loaded) return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",
      justifyContent:"center",color:C.muted,fontFamily:"system-ui,sans-serif"}}>Loading…</div>
  );

  if (!family) return <LoginScreen onLogin={handleLogin}/>;

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"system-ui,-apple-system,sans-serif",fontSize:14}}>

      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"18px 20px 0",
        position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:1080,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:C.burntOrange,marginBottom:2,fontWeight:600}}>What Will Last</div>
              <h1 style={{margin:0,fontSize:20,fontWeight:700,color:C.text,letterSpacing:"0.03em"}}>Family Cinema Canon</h1>
              <div style={{fontSize:11,color:C.muted,marginTop:1}}>{movies.length} films · {totalWatches} watches logged · {family.familyName}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setShowSettings(true)}
                style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,
                  padding:"7px 10px",fontSize:16,cursor:"pointer",color:C.muted,lineHeight:1,
                  display:"flex",alignItems:"center"}}
                title="Settings"
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderDark}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>⚙️</button>
              <Btn variant="accent" onClick={()=>setAddModal(true)}>+ Add Film</Btn>
            </div>
          </div>
          <div style={{display:"flex"}}>
            {[["list","Films"],["kids","Kids"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{background:"none",border:"none",
                padding:"9px 18px",color:tab===k?C.text:C.muted,
                borderBottom:`2px solid ${tab===k?C.burntOrange:"transparent"}`,
                fontSize:12,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em",
                textTransform:"uppercase",fontWeight:tab===k?600:400,transition:"color 0.15s"}}>
                {l}
                {k==="kids"&&kids.length>0&&(
                  <span style={{marginLeft:5,fontSize:10,background:C.surfaceAlt,color:C.muted,padding:"1px 6px",borderRadius:8}}>{kids.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1080,margin:"0 auto",padding:"18px 20px 48px"}}>

        {tab==="list"&&(<>
          {filterKid!=="All"&&filterStatus!=="All"&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"9px 14px",background:"#fef3c7",borderRadius:7,border:"1px solid #fde68a",marginBottom:10}}>
              <span style={{fontSize:12,color:"#92400e"}}>Showing <strong>{filterStatus}</strong> for <strong>{filterKid}</strong></span>
              <button onClick={()=>{setFilterKid("All");setFilterStatus("All");}}
                style={{background:"none",border:"none",color:C.burntOrange,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Clear ×</button>
            </div>
          )}

          <div style={{background:C.surface,borderRadius:9,border:`1px solid ${C.border}`,marginBottom:14,overflow:"hidden"}}>
            <div style={{padding:"9px 14px",borderBottom:`1px solid ${C.border}`,background:C.surfaceAlt,display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:C.muted}}>👆</span>
              <span style={{fontSize:12,color:C.muted}}>Click any film to see details, log watches, and write notes</span>
              <span style={{marginLeft:"auto",fontSize:11,color:C.mutedLight}}>{filtered.length} of {movies.length} films</span>
            </div>
            <div style={{padding:"11px 13px",display:"flex",flexWrap:"wrap",gap:7,alignItems:"center"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search films…"
                style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",
                  color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",width:140}}/>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
                style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none"}}>
                {allCats.map(c=><option key={c}>{c}</option>)}
              </select>
              <select value={filterAge} onChange={e=>setFilterAge(e.target.value)}
                style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none"}}>
                {Object.keys(AGE_GROUPS).map(r=><option key={r}>{r}</option>)}
              </select>
              {kids.length>0&&(
                <select value={filterKid} onChange={e=>setFilterKid(e.target.value)}
                  style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none"}}>
                  <option>All</option>
                  {kids.map(k=><option key={k.id}>{k.name}</option>)}
                </select>
              )}
              {filterKid!=="All"&&(
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
                  style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none"}}>
                  {["All","Watched","Unwatched","Ready","Not Ready"].map(s=><option key={s}>{s}</option>)}
                </select>
              )}
              <select value={sort} onChange={e=>setSort(e.target.value)}
                style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none"}}>
                <option value="ageIdeal">Age ↑</option>
                <option value="year">Year</option>
                <option value="title">Title A–Z</option>
                <option value="category">Category</option>
              </select>
              <button onClick={()=>setFilterMust(p=>!p)}
                style={{background:filterMust?C.burntOrange:"#fff",border:`1px solid ${filterMust?C.burntOrange:C.border}`,
                  color:filterMust?"#fff":C.muted,borderRadius:6,padding:"6px 11px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                ★ Must-Watch
              </button>
              {activeFilters&&(
                <button onClick={()=>{setFilterCat("All");setFilterAge("All");setFilterKid("All");setFilterStatus("All");setFilterMust(false);setSearch("");}}
                  style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"6px 10px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {filtered.map(movie=>{
              const anyWatched=kids.some(k=>watches[`${movie.id}:${k.id}`]?.watched);
              return (
                <div key={movie.id} onClick={()=>setFilmModal(movie)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"8px 14px 8px 10px",
                    borderRadius:10,border:`1px solid ${anyWatched?C.borderDark:C.border}`,
                    background:anyWatched?C.surface:"#fff",cursor:"pointer",transition:"all 0.12s",
                    minHeight:68}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderDark;e.currentTarget.style.background=C.surface;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=anyWatched?C.borderDark:C.border;e.currentTarget.style.background=anyWatched?C.surface:"#fff";}}>

                  <PosterImg title={movie.title} year={movie.year} omdbPoster={movie.omdbPoster} size={44} radius={5} showPlaceholder/>

                  <span style={{fontSize:13,color:movie.mustWatch?C.burntOrange:C.border,flexShrink:0,width:14,textAlign:"center"}}>{movie.mustWatch?"★":"·"}</span>
                  <AgeBubble a={movie.ageIdeal} size={36}/>

                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:7,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,color:C.text,fontWeight:500}}>{movie.title}</span>
                      <span style={{fontSize:11,color:C.muted}}>{movie.year}</span>
                      {movie.series&&(
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:3,background:C.surfaceAlt,
                          color:C.muted,border:`1px solid ${C.border}`,letterSpacing:"0.03em"}}>{movie.series}</span>
                      )}
                    </div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{movie.description}</div>
                  </div>

                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    {kids.map(kid=>(
                      <KidBubble key={kid.id} kid={kid} size={26} watched={!!watches[`${movie.id}:${kid.id}`]?.watched}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length===0&&<div style={{textAlign:"center",color:C.muted,padding:"60px 0",fontSize:14}}>No films match your filters.</div>}

          <div style={{display:"flex",gap:14,marginTop:18,flexWrap:"wrap"}}>
            {[["≤7","#16a34a","#dcfce7"],["8–10","#2563eb","#dbeafe"],["11–13","#d97706","#fef3c7"],["14+","#dc2626","#fee2e2"]].map(([label,color,bg])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:bg,border:`2px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:7,fontWeight:700,color}}>{label[0]}</span>
                </div>
                <span style={{fontSize:11,color:C.muted}}>{label}</span>
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:11,color:C.burntOrange}}>★</span>
              <span style={{fontSize:11,color:C.muted}}>Must-Watch</span>
            </div>
          </div>
        </>)}

        {tab==="kids"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <Btn onClick={()=>setKidModal({mode:"add"})}>+ Add Kid</Btn>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {kids.map(kid=>{
                const s=kidStats(kid);
                const kidAge=calcAge(kid.dob);
                return (
                  <div key={kid.id} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
                    <div style={{background:kid.color,padding:"15px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.2)",
                          border:"2px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:20,fontWeight:700,color:"#fff"}}>{kid.name[0]}</span>
                        </div>
                        <div>
                          <div style={{fontSize:19,fontWeight:700,color:"#fff"}}>{kid.name}</div>
                          {kid.dob&&<div style={{fontSize:12,color:"rgba(255,255,255,0.8)"}}>
                            Age {kidAge} · Born {new Date(kid.dob+"T00:00:00").toLocaleDateString("en-US",{month:"long",year:"numeric",timeZone:"UTC"})}
                          </div>}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <Btn small onClick={()=>setKidModal({mode:"edit",kid})}
                          style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff"}}>Edit</Btn>
                        <Btn small variant="danger" onClick={()=>deleteKid(kid.id)}
                          style={{background:"rgba(0,0,0,0.15)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff"}}>Remove</Btn>
                      </div>
                    </div>
                    <div style={{padding:"16px 18px"}}>
                      <div style={{marginBottom:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <span style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500}}>Progress</span>
                          <span style={{fontSize:12,color:kid.color,fontWeight:600}}>{s.pct}%</span>
                        </div>
                        <div style={{height:5,background:C.border,borderRadius:3}}>
                          <div style={{height:5,background:kid.color,borderRadius:3,width:`${s.pct}%`,transition:"width 0.4s"}}/>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                        {[
                          {label:"Watched",value:s.watched,color:"#16a34a",bg:"#dcfce7",status:"Watched"},
                          {label:"Ready to Watch",value:s.ready,color:kid.color,bg:C.bg,status:"Ready"},
                          {label:"Coming Up",value:s.coming,color:C.muted,bg:C.surface,status:"Not Ready"},
                        ].map(stat=>(
                          <button key={stat.label} onClick={()=>jumpToList(kid.name,stat.status)}
                            style={{background:stat.bg,border:`1px solid ${C.border}`,borderRadius:10,
                              padding:"12px 14px",textAlign:"center",cursor:"pointer",transition:"all 0.15s",flex:1,minWidth:80,fontFamily:"inherit"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=stat.color;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}>
                            <div style={{fontSize:24,fontWeight:700,color:stat.color,lineHeight:1}}>{stat.value}</div>
                            <div style={{fontSize:10,color:C.muted,marginTop:3,letterSpacing:"0.04em",textTransform:"uppercase"}}>{stat.label}</div>
                          </button>
                        ))}
                      </div>
                      {s.watched>0&&(
                        <button onClick={()=>setKidDetail(kid)}
                          style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,
                            padding:"8px 16px",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",
                            width:"100%",transition:"all 0.15s",textAlign:"center"}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=kid.color;e.currentTarget.style.color=kid.color;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                          View {kid.name}&apos;s Notes &amp; Watch History →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {kids.length===0&&<div style={{textAlign:"center",color:C.muted,padding:"40px 0"}}>No kids added yet.</div>}
            </div>
          </div>
        )}
      </div>

      {addModal&&(
        <AddFilmModal onSave={addMovie} onClose={()=>setAddModal(false)}
          existingTitles={movies.map(m=>m.title)}/>
      )}
      {filmModal&&(
        <FilmModal
          movie={filmModal} kids={kids} watches={watches}
          isCustom={!!filmModal._custom}
          onSave={saveFromFilmModal}
          onDelete={()=>setDeleteConfirm(filmModal)}
          onClose={()=>setFilmModal(null)}/>
      )}
      {kidModal&&(
        <Modal title={kidModal.mode==="add"?"Add a Kid":"Edit Kid"} onClose={()=>setKidModal(null)}>
          <KidForm initial={kidModal.mode==="edit"?kidModal.kid:null}
            onSave={kidModal.mode==="add"?addKid:editKid}
            onClose={()=>setKidModal(null)} existingCount={kids.length}/>
        </Modal>
      )}
      {kidDetail&&(
        <KidDetailModal kid={kidDetail} movies={movies} watches={watches} onClose={()=>setKidDetail(null)}/>
      )}
      {deleteConfirm&&(
        <Modal title="Remove Film" onClose={()=>setDeleteConfirm(null)}>
          <p style={{color:C.muted,fontSize:14,margin:"0 0 22px"}}>
            Remove <strong style={{color:C.text}}>{deleteConfirm.title}</strong>? All watch records will also be deleted.
          </p>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn variant="ghost" onClick={()=>setDeleteConfirm(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={()=>deleteMovie(deleteConfirm.id)}>Remove Film</Btn>
          </div>
        </Modal>
      )}
      {showSettings&&(
        <Modal title="Settings" onClose={()=>setShowSettings(false)}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>
              Signed in as <strong style={{color:C.text}}>{family.username}</strong> · {family.familyName}
            </div>
          </div>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
            <Btn variant="danger" onClick={signOut}>Sign Out</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
