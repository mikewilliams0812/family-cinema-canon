'use client';
import { useState, useEffect, useRef } from "react";

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
  {id:uid(),title:"The Lion King",year:1994,category:"Animated",ageMin:4,ageIdeal:5,series:"",mustWatch:true,description:"Hamlet for kids. Loss, identity, and the courage to return.",watchOrder:"Original only."},
  {id:uid(),title:"Toy Story",year:1995,category:"Animated",ageMin:4,ageIdeal:5,series:"Toy Story",mustWatch:true,description:"The film that launched Pixar. Watch Toy Story 3 when they're 12+.",watchOrder:"1 → 2 → 3. Part 3 at age 12+."},
  {id:uid(),title:"WALL-E",year:2008,category:"Animated",ageMin:5,ageIdeal:6,series:"",mustWatch:true,description:"A love story and masterpiece of visual storytelling with almost no dialogue.",watchOrder:"Standalone."},
  {id:uid(),title:"Up",year:2009,category:"Animated",ageMin:5,ageIdeal:6,series:"",mustWatch:true,description:"The first 10 minutes will gut you. Then it becomes an adventure.",watchOrder:"Standalone."},
  {id:uid(),title:"E.T. the Extra-Terrestrial",year:1982,category:"Sci-Fi",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"Spielberg at his most tender. A goodbye that wrecks every adult.",watchOrder:"Standalone."},
  {id:uid(),title:"The Iron Giant",year:1999,category:"Animated",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"You are who you choose to be. The most underrated animated film ever.",watchOrder:"Standalone."},
  {id:uid(),title:"Home Alone",year:1990,category:"Comedy",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"A boy defends his house. One of the most beloved comedies ever made.",watchOrder:"Annual Christmas tradition."},
  {id:uid(),title:"The Incredibles",year:2004,category:"Animated",ageMin:6,ageIdeal:7,series:"",mustWatch:true,description:"About embracing what makes you exceptional.",watchOrder:"Standalone."},
  {id:uid(),title:"The Princess Bride",year:1987,category:"Comedy",ageMin:7,ageIdeal:8,series:"",mustWatch:true,description:"As you wish. Adventure, romance, and the most quotable movie ever made.",watchOrder:"Standalone."},
  {id:uid(),title:"The Sandlot",year:1993,category:"Comedy",ageMin:7,ageIdeal:8,series:"",mustWatch:true,description:"A summer, a baseball field, and friendships that last a lifetime.",watchOrder:"Standalone."},
  {id:uid(),title:"Star Wars: A New Hope",year:1977,category:"Epic Sagas",ageMin:5,ageIdeal:6,series:"Star Wars",mustWatch:true,description:"Where it all began. The Hero's Journey in its purest cinematic form.",watchOrder:"Episodes IV, V, VI first — always."},
  {id:uid(),title:"Star Wars: The Empire Strikes Back",year:1980,category:"Epic Sagas",ageMin:6,ageIdeal:7,series:"Star Wars",mustWatch:true,description:"The greatest plot twist in cinema history.",watchOrder:"Episode V — second in the saga."},
  {id:uid(),title:"Star Wars: Return of the Jedi",year:1983,category:"Epic Sagas",ageMin:6,ageIdeal:7,series:"Star Wars",mustWatch:true,description:"The conclusion of the original trilogy.",watchOrder:"Episode VI — third."},
  {id:uid(),title:"Harry Potter and the Sorcerer's Stone",year:2001,category:"Epic Sagas",ageMin:7,ageIdeal:8,series:"Harry Potter",mustWatch:true,description:"The beginning of one of cinema's greatest coming-of-age sagas.",watchOrder:"1 through 8 in order. All required."},
  {id:uid(),title:"Harry Potter and the Prisoner of Azkaban",year:2004,category:"Epic Sagas",ageMin:8,ageIdeal:9,series:"Harry Potter",mustWatch:true,description:"The series transforms here. Best directed of the eight.",watchOrder:"3rd — Alfonso Cuarón directs."},
  {id:uid(),title:"Spirited Away",year:2001,category:"Animated",ageMin:8,ageIdeal:9,series:"Studio Ghibli",mustWatch:true,description:"Miyazaki's masterpiece. A girl navigates a world of spirits.",watchOrder:"Watch the subtitled Japanese version."},
  {id:uid(),title:"Back to the Future",year:1985,category:"Sci-Fi",ageMin:8,ageIdeal:9,series:"Back to the Future",mustWatch:true,description:"The perfect time travel movie. Funny, tight, inventive.",watchOrder:"All three in order. Part I is flawless."},
  {id:uid(),title:"Indiana Jones: Raiders of the Lost Ark",year:1981,category:"Adventure",ageMin:8,ageIdeal:10,series:"Indiana Jones",mustWatch:true,description:"The gold standard of adventure films. Pure cinematic joy.",watchOrder:"Start here. This is the one."},
  {id:uid(),title:"Indiana Jones: The Last Crusade",year:1989,category:"Adventure",ageMin:8,ageIdeal:10,series:"Indiana Jones",mustWatch:true,description:"Sean Connery as Indy's dad. The emotional heart of the series.",watchOrder:"3rd in series."},
  {id:uid(),title:"Jurassic Park",year:1993,category:"Sci-Fi",ageMin:8,ageIdeal:9,series:"",mustWatch:true,description:"The film that made dinosaurs real. Still holds up 30 years later.",watchOrder:"Standalone."},
  {id:uid(),title:"Apollo 13",year:1995,category:"Biographical",ageMin:9,ageIdeal:10,series:"",mustWatch:true,description:"Three astronauts try to come home alive. Pure suspense from a true story.",watchOrder:"Standalone."},
  {id:uid(),title:"Hoosiers",year:1986,category:"Sports",ageMin:9,ageIdeal:10,series:"",mustWatch:true,description:"Small Indiana high school basketball team goes to the state championship.",watchOrder:"Indiana pride. Standalone."},
  {id:uid(),title:"Miracle",year:2004,category:"Sports",ageMin:9,ageIdeal:10,series:"",mustWatch:true,description:"The 1980 US hockey team beating the Soviet Union at the Olympics.",watchOrder:"Standalone."},
  {id:uid(),title:"The Lord of the Rings: Fellowship of the Ring",year:2001,category:"Epic Sagas",ageMin:9,ageIdeal:11,series:"Lord of the Rings",mustWatch:true,description:"The greatest fantasy epic ever put to film.",watchOrder:"Extended edition. All three required."},
  {id:uid(),title:"The Lord of the Rings: The Two Towers",year:2002,category:"Epic Sagas",ageMin:9,ageIdeal:11,series:"Lord of the Rings",mustWatch:true,description:"The Battle of Helm's Deep. Gollum brought to life.",watchOrder:"2nd in trilogy."},
  {id:uid(),title:"The Lord of the Rings: Return of the King",year:2003,category:"Epic Sagas",ageMin:9,ageIdeal:11,series:"Lord of the Rings",mustWatch:true,description:"11 Academy Awards. The most satisfying conclusion to any trilogy.",watchOrder:"Extended edition finale."},
  {id:uid(),title:"The Hobbit: An Unexpected Journey",year:2012,category:"Epic Sagas",ageMin:8,ageIdeal:10,series:"The Hobbit",mustWatch:false,description:"A lighter journey into Middle-earth.",watchOrder:"After or before LOTR — either works."},
  {id:uid(),title:"Rudy",year:1993,category:"Sports",ageMin:10,ageIdeal:11,series:"",mustWatch:true,description:"A kid with no talent who refuses to stop trying.",watchOrder:"Standalone."},
  {id:uid(),title:"Rocky",year:1976,category:"Sports",ageMin:10,ageIdeal:11,series:"Rocky",mustWatch:true,description:"The ultimate film about heart over talent.",watchOrder:"Just the first one is essential."},
  {id:uid(),title:"Top Gun",year:1986,category:"Action",ageMin:10,ageIdeal:12,series:"Top Gun",mustWatch:true,description:"Fighter pilots, competition, loss, and redemption.",watchOrder:"Watch before Maverick."},
  {id:uid(),title:"Top Gun: Maverick",year:2022,category:"Action",ageMin:10,ageIdeal:13,series:"Top Gun",mustWatch:true,description:"A masterclass in legacy sequels. Better than the original.",watchOrder:"After the original."},
  {id:uid(),title:"Groundhog Day",year:1993,category:"Comedy",ageMin:10,ageIdeal:12,series:"",mustWatch:true,description:"Secretly a profound film about self-improvement.",watchOrder:"Standalone."},
  {id:uid(),title:"National Lampoon's Christmas Vacation",year:1989,category:"Comedy",ageMin:10,ageIdeal:11,series:"",mustWatch:true,description:"Clark Griswold's quest for the perfect Christmas.",watchOrder:"Annual Christmas tradition."},
  {id:uid(),title:"It's a Wonderful Life",year:1946,category:"Drama",ageMin:8,ageIdeal:10,series:"",mustWatch:true,description:"The ultimate film about legacy and meaning.",watchOrder:"Every Christmas, forever."},
  {id:uid(),title:"Field of Dreams",year:1989,category:"Sports",ageMin:11,ageIdeal:12,series:"",mustWatch:true,description:"If you build it, he will come. A film about fathers and sons.",watchOrder:"Watch this one together."},
  {id:uid(),title:"Forrest Gump",year:1994,category:"Drama",ageMin:11,ageIdeal:12,series:"",mustWatch:true,description:"A simple man walks through American history.",watchOrder:"Standalone."},
  {id:uid(),title:"Jaws",year:1975,category:"Thriller",ageMin:11,ageIdeal:12,series:"",mustWatch:true,description:"The film that invented the summer blockbuster.",watchOrder:"Standalone."},
  {id:uid(),title:"Interstellar",year:2014,category:"Sci-Fi",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"A father's love tested across space and time.",watchOrder:"Standalone. Watch in the dark."},
  {id:uid(),title:"To Kill a Mockingbird",year:1962,category:"Drama",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"Gregory Peck as Atticus Finch. Justice, innocence, and moral courage.",watchOrder:"Read the book alongside."},
  {id:uid(),title:"Tombstone",year:1993,category:"Western",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"I'm your Huckleberry. The Western for people who aren't sure they like Westerns.",watchOrder:"Standalone."},
  {id:uid(),title:"Ferris Bueller's Day Off",year:1986,category:"Comedy",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"Life moves pretty fast. A love letter to living in the moment.",watchOrder:"Standalone."},
  {id:uid(),title:"North by Northwest",year:1959,category:"Thriller",ageMin:12,ageIdeal:13,series:"Hitchcock",mustWatch:true,description:"Hitchcock's adventure thriller. The crop duster sequence alone.",watchOrder:"Best Hitchcock entry point."},
  {id:uid(),title:"Chariots of Fire",year:1981,category:"Biographical",ageMin:12,ageIdeal:13,series:"",mustWatch:true,description:"Two runners at the 1924 Olympics. One runs for pride, one for God.",watchOrder:"Standalone."},
  {id:uid(),title:"Mission: Impossible – Fallout",year:2018,category:"Action",ageMin:12,ageIdeal:14,series:"Mission: Impossible",mustWatch:true,description:"The pinnacle of practical action filmmaking.",watchOrder:"Best entry point, or start from the beginning."},
  {id:uid(),title:"The Dark Knight",year:2008,category:"Action",ageMin:13,ageIdeal:14,series:"Nolan Batman",mustWatch:true,description:"A crime epic. Heath Ledger's Joker is one of cinema's all-time performances.",watchOrder:"Watch Batman Begins first."},
  {id:uid(),title:"Casino Royale",year:2006,category:"Spy",ageMin:13,ageIdeal:14,series:"James Bond",mustWatch:true,description:"Bond as a flawed human being. The best Bond film ever made.",watchOrder:"Start of the Daniel Craig era."},
  {id:uid(),title:"Skyfall",year:2012,category:"Spy",ageMin:13,ageIdeal:14,series:"James Bond",mustWatch:true,description:"The most cinematic Bond film. Roger Deakins shot it.",watchOrder:"3rd in Craig era."},
  {id:uid(),title:"The Matrix",year:1999,category:"Sci-Fi",ageMin:13,ageIdeal:14,series:"The Matrix",mustWatch:true,description:"Reality is a simulation. Mind-bending action wrapped around genuine philosophy.",watchOrder:"Just the first film is essential."},
  {id:uid(),title:"Dead Poets Society",year:1989,category:"Drama",ageMin:13,ageIdeal:14,series:"",mustWatch:true,description:"O Captain, My Captain. A teacher who changes lives.",watchOrder:"Standalone."},
  {id:uid(),title:"Dunkirk",year:2017,category:"War",ageMin:13,ageIdeal:14,series:"",mustWatch:true,description:"Nolan's non-linear war film. Three timelines on one beach.",watchOrder:"Standalone."},
  {id:uid(),title:"Dune",year:2021,category:"Epic Sagas",ageMin:13,ageIdeal:14,series:"Dune",mustWatch:true,description:"The most ambitious sci-fi epic in decades.",watchOrder:"Part One, then Part Two (2024)."},
  {id:uid(),title:"Dune: Part Two",year:2024,category:"Epic Sagas",ageMin:13,ageIdeal:15,series:"Dune",mustWatch:true,description:"Extraordinary filmmaking. A morally complex conclusion.",watchOrder:"Immediately after Part One."},
  {id:uid(),title:"The Good, the Bad and the Ugly",year:1966,category:"Western",ageMin:13,ageIdeal:15,series:"",mustWatch:true,description:"Ennio Morricone's score. The greatest Western ever made.",watchOrder:"Standalone."},
  {id:uid(),title:"Schindler's List",year:1993,category:"Drama",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"Spielberg's account of the Holocaust. A film that changes you.",watchOrder:"Watch with a parent. Discussion required."},
  {id:uid(),title:"Saving Private Ryan",year:1998,category:"War",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"The most realistic war film ever made.",watchOrder:"Opening 20 minutes are extremely intense."},
  {id:uid(),title:"Hacksaw Ridge",year:2016,category:"War",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"A conscientious objector saved 75 men without a weapon. True story.",watchOrder:"Standalone."},
  {id:uid(),title:"Good Will Hunting",year:1997,category:"Drama",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"A genius afraid of his own gifts. Robin Williams is extraordinary.",watchOrder:"Standalone."},
  {id:uid(),title:"The Shawshank Redemption",year:1994,category:"Drama",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"Hope, friendship, and perseverance. Consistently voted the greatest film ever.",watchOrder:"Standalone."},
  {id:uid(),title:"Arrival",year:2016,category:"Sci-Fi",ageMin:14,ageIdeal:15,series:"",mustWatch:true,description:"The most quietly devastating sci-fi film in decades.",watchOrder:"Don't look anything up first."},
  {id:uid(),title:"2001: A Space Odyssey",year:1968,category:"Sci-Fi",ageMin:14,ageIdeal:16,series:"",mustWatch:true,description:"Kubrick's monolith. Slow, strange, and visionary.",watchOrder:"Standalone. Patience required."},
  {id:uid(),title:"Oppenheimer",year:2023,category:"Biographical",ageMin:15,ageIdeal:16,series:"",mustWatch:true,description:"Three hours on the man who built the bomb.",watchOrder:"Some WWII history helps."},
];

const SEED_KIDS = [
  {id:uid(),name:"Jed",dob:"2016-06-01",color:C.burntOrange},
  {id:uid(),name:"Sage",dob:"2018-06-01",color:C.slateBlue},
  {id:uid(),name:"Bella",dob:"2020-06-01",color:C.olive},
];

const STORAGE_KEY = "cinema-wwl-v4";

async function loadData() {
  try {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : null;
  } catch(_){ return null; }
}
async function saveData(d) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch(_){}
}
async function loadOmdbKey() {
  try {
    if (typeof window === "undefined") return process.env.NEXT_PUBLIC_OMDB_KEY || "";
    return localStorage.getItem("omdb-key") || process.env.NEXT_PUBLIC_OMDB_KEY || "";
  } catch(_){ return ""; }
}
async function saveOmdbKey(key) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem("omdb-key", key);
  } catch(_){}
}

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

async function fetchOmdb(title, year, apiKey) {
  if (!apiKey) return null;
  try {
    const q = encodeURIComponent(title);
    const url = `https://www.omdbapi.com/?t=${q}&y=${year}&plot=short&apikey=${apiKey}`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.Response === "False") {
      const r2 = await fetch(`https://www.omdbapi.com/?t=${q}&plot=short&apikey=${apiKey}`);
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
    const q = encodeURIComponent(title);
    const url = `https://itunes.apple.com/search?term=${q}&media=movie&entity=movie&limit=10&country=us`;
    const r = await fetch(url);
    const d = await r.json();
    if (!d.results?.length) { posterCache[key] = null; return null; }
    const results = d.results.filter(m => m.artworkUrl100);
    let best = results.find(m => {
      const titleOk = m.trackName?.toLowerCase() === title.toLowerCase();
      const yr = m.releaseDate ? new Date(m.releaseDate).getFullYear() : null;
      return titleOk && yr === year;
    });
    if (!best) best = results.find(m => m.trackName?.toLowerCase() === title.toLowerCase());
    if (!best) best = results[0];
    if (!best) { posterCache[key] = null; return null; }
    const art = best.artworkUrl100
      .replace(/\/\d+x\d+bb\./, "/400x600bb.")
      .replace(/\/\d+x\d+\./, "/400x600.");
    posterCache[key] = art;
    return art;
  } catch(e) { posterCache[key] = null; return null; }
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

function AddFilmModal({onSave, onClose, existingTitles, omdbKey}) {
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
        fetchOmdb(t.title, t.year, omdbKey)
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

function FilmModal({movie: initialMovie, kids, watches, onSave, onDelete, onClose}) {
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
            {!editing&&(
              <button onClick={()=>setEditing(true)}
                style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,
                  padding:"5px 11px",fontSize:12,color:C.muted,cursor:"pointer",
                  fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderDark}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                ✎ Edit
              </button>
            )}
            <button onClick={onDelete}
              style={{background:"#fff",border:"1px solid #fecaca",borderRadius:6,
                padding:"5px 11px",fontSize:12,color:"#ef4444",cursor:"pointer",
                fontFamily:"inherit"}}
              onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
              🗑
            </button>
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

export default function App() {
  const [movies,setMovies]=useState([]);
  const [kids,setKids]=useState([]);
  const [watches,setWatches]=useState({});
  const [loaded,setLoaded]=useState(false);
  const [omdbKey,setOmdbKey]=useState("");
  const [showSettings,setShowSettings]=useState(false);

  const [filterCat,setFilterCat]=useState("All");
  const [filterAge,setFilterAge]=useState("All");
  const [filterKid,setFilterKid]=useState("All");
  const [filterStatus,setFilterStatus]=useState("All");
  const [filterMust,setFilterMust]=useState(false);
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState("ageIdeal");

  const [addModal,setAddModal]=useState(false);
  const [filmModal,setFilmModal]=useState(null);
  const [kidModal,setKidModal]=useState(null);
  const [kidDetail,setKidDetail]=useState(null);
  const [deleteConfirm,setDeleteConfirm]=useState(null);
  const [tab,setTab]=useState("list");

  useEffect(()=>{
    Promise.all([loadData(), loadOmdbKey()]).then(([d, key])=>{
      if(d){setMovies(d.movies||[]);setKids(d.kids||[]);setWatches(d.watches||{});}
      else{setMovies(SEED_MOVIES);setKids(SEED_KIDS);}
      if(key) setOmdbKey(key);
      setLoaded(true);
    });
  },[]);
  useEffect(()=>{if(!loaded)return;saveData({movies,kids,watches});},[movies,kids,watches,loaded]);

  const addMovie=(f)=>{setMovies(p=>[...p,{...f,id:uid()}]);setAddModal(false);};

  const saveFromFilmModal=(movieId, kidData, updatedFilm)=>{
    if(kidData) {
      setWatches(p=>{const n={...p};Object.entries(kidData).forEach(([kId,v])=>{n[`${movieId}:${kId}`]=v;});return n;});
    }
    if(updatedFilm) {
      setMovies(p=>p.map(m=>m.id===updatedFilm.id?updatedFilm:m));
    }
    setFilmModal(null);
  };

  const deleteMovie=(id)=>{
    setMovies(p=>p.filter(m=>m.id!==id));
    setWatches(p=>{const n={...p};Object.keys(n).filter(k=>k.startsWith(id+":")).forEach(k=>delete n[k]);return n;});
    setFilmModal(null);
    setDeleteConfirm(null);
  };
  const addKid=(f)=>{setKids(p=>[...p,{...f,id:uid()}]);setKidModal(null);};
  const editKid=(f)=>{setKids(p=>p.map(k=>k.id===f.id?f:k));setKidModal(null);};
  const deleteKid=(id)=>{
    setKids(p=>p.filter(k=>k.id!==id));
    setWatches(p=>{const n={...p};Object.keys(n).filter(k=>k.endsWith(":"+id)).forEach(k=>delete n[k]);return n;});
  };

  const jumpToList=(kidName,status)=>{
    setTab("list");setFilterKid(kidName);setFilterStatus(status);
    setFilterCat("All");setFilterAge("All");setFilterMust(false);setSearch("");
  };

  const kidStats=(kid)=>{
    const kidAge=calcAge(kid.dob);
    const total=movies.length;
    const w=movies.filter(m=>watches[`${m.id}:${kid.id}`]?.watched).length;
    const r=movies.filter(m=>kidAge!==null&&kidAge>=m.ageMin&&!watches[`${m.id}:${kid.id}`]?.watched).length;
    return{total,watched:w,ready:r,coming:total-w-r,pct:total?Math.round((w/total)*100):0};
  };

  const filtered=movies.filter(m=>{
    if(filterCat!=="All"&&m.category!==filterCat)return false;
    const[lo,hi]=AGE_GROUPS[filterAge]||[0,99];
    if(m.ageIdeal<lo||m.ageIdeal>hi)return false;
    if(filterMust&&!m.mustWatch)return false;
    if(search&&!m.title.toLowerCase().includes(search.toLowerCase())&&
       !m.description?.toLowerCase().includes(search.toLowerCase()))return false;
    if(filterKid!=="All"&&filterStatus!=="All"){
      const kid=kids.find(k=>k.name===filterKid);
      if(kid){
        const w=watches[`${m.id}:${kid.id}`];
        const isW=w?.watched;
        const kidAge=calcAge(kid.dob);
        if(filterStatus==="Watched"&&!isW)return false;
        if(filterStatus==="Unwatched"&&isW)return false;
        if(filterStatus==="Ready"&&(isW||(kidAge!==null&&kidAge<m.ageMin)))return false;
        if(filterStatus==="Not Ready"&&(isW||(kidAge===null||kidAge>=m.ageMin)))return false;
      }
    }
    return true;
  }).sort((a,b)=>{
    if(sort==="ageIdeal")return a.ageIdeal-b.ageIdeal;
    if(sort==="year")return a.year-b.year;
    if(sort==="title")return a.title.localeCompare(b.title);
    if(sort==="category")return a.category.localeCompare(b.category);
    return 0;
  });

  const allCats=["All",...CATEGORIES.filter(c=>movies.some(m=>m.category===c))];
  const totalWatches=Object.values(watches).filter(w=>w.watched).length;
  const activeFilters=filterCat!=="All"||filterAge!=="All"||filterKid!=="All"||filterStatus!=="All"||filterMust||search;

  if(!loaded) return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",
      justifyContent:"center",color:C.muted,fontFamily:"system-ui,sans-serif"}}>Loading…</div>
  );

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"system-ui,-apple-system,sans-serif",fontSize:14}}>

      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"18px 20px 0",
        position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:1080,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:C.burntOrange,marginBottom:2,fontWeight:600}}>What Will Last</div>
              <h1 style={{margin:0,fontSize:20,fontWeight:700,color:C.text,letterSpacing:"0.03em"}}>Family Cinema Canon</h1>
              <div style={{fontSize:11,color:C.muted,marginTop:1}}>{movies.length} films · {totalWatches} watches logged</div>
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

                  <PosterImg title={movie.title} year={movie.year} size={44} radius={5} showPlaceholder/>

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
                          View {kid.name}'s Notes &amp; Watch History →
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
          existingTitles={movies.map(m=>m.title)} omdbKey={omdbKey}/>
      )}
      {filmModal&&(
        <FilmModal
          movie={filmModal} kids={kids} watches={watches}
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
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:6}}>OMDb API Key</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:10}}>
              Enables real IMDb plot summaries, director, runtime, and ratings when you add films.
              Get a free key at <a href="https://omdbapi.com/apikey.aspx" target="_blank"
              style={{color:C.burntOrange}}>omdbapi.com</a> — enter your email, check your inbox.
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={omdbKey} onChange={e=>setOmdbKey(e.target.value)}
                placeholder="e.g. a1b2c3d4"
                style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,
                  padding:"9px 12px",color:C.text,fontSize:13,fontFamily:"system-ui,sans-serif",
                  outline:"none"}}/>
              <Btn onClick={()=>{saveOmdbKey(omdbKey);setShowSettings(false);}}>Save Key</Btn>
            </div>
            {omdbKey&&(
              <div style={{marginTop:8,fontSize:12,color:"#16a34a"}}>
                ✓ Key saved — will be used for all new films you add
              </div>
            )}
          </div>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,fontSize:12,color:C.muted,lineHeight:1.7}}>
            <strong style={{color:C.text}}>Without a key:</strong> Films still get AI-written family notes, age ratings, and watch order guidance. OMDb data (official plot, director, IMDb score) just won't appear.
          </div>
        </Modal>
      )}
    </div>
  );
}
