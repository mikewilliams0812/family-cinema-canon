import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") || "";
  const year = req.nextUrl.searchParams.get("year") || "";

  try {
    const q = encodeURIComponent(title);
    const url = `https://itunes.apple.com/search?term=${q}&media=movie&entity=movie&limit=10&country=us`;
    const r = await fetch(url, { next: { revalidate: 86400 } });
    const d = await r.json();

    if (!d.results?.length) return NextResponse.json({ url: null });

    const results = d.results.filter((m: any) => m.artworkUrl100);
    const yearNum = parseInt(year);

    let best = results.find((m: any) => {
      const titleOk = m.trackName?.toLowerCase() === title.toLowerCase();
      const yr = m.releaseDate ? new Date(m.releaseDate).getFullYear() : null;
      return titleOk && yr === yearNum;
    });
    if (!best) best = results.find((m: any) => m.trackName?.toLowerCase() === title.toLowerCase());
    if (!best) best = results[0];
    if (!best) return NextResponse.json({ url: null });

    const art = best.artworkUrl100
      .replace(/\/\d+x\d+bb\./, "/400x600bb.")
      .replace(/\/\d+x\d+\./, "/400x600.");

    return NextResponse.json({ url: art });
  } catch {
    return NextResponse.json({ url: null });
  }
}
