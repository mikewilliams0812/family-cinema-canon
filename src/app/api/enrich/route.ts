import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") || "";
  const year = req.nextUrl.searchParams.get("year") || "";
  const apiKey = req.nextUrl.searchParams.get("key") || "";

  if (!apiKey) return NextResponse.json({ error: "no key" }, { status: 400 });

  try {
    const q = encodeURIComponent(title);
    let url = `https://www.omdbapi.com/?t=${q}&y=${year}&plot=short&apikey=${apiKey}`;
    let r = await fetch(url);
    let d = await r.json();

    if (d.Response === "False") {
      r = await fetch(`https://www.omdbapi.com/?t=${q}&plot=short&apikey=${apiKey}`);
      d = await r.json();
    }

    if (d.Response === "False") return NextResponse.json({ found: false });

    return NextResponse.json({
      found: true,
      omdbPlot: d.Plot !== "N/A" ? d.Plot : null,
      omdbDirector: d.Director !== "N/A" ? d.Director : null,
      omdbRuntime: d.Runtime !== "N/A" ? d.Runtime : null,
      omdbRating: d.Rated !== "N/A" ? d.Rated : null,
      omdbImdbRating: d.imdbRating !== "N/A" ? d.imdbRating : null,
      omdbPoster: d.Poster && d.Poster !== "N/A" ? d.Poster : null,
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
