import Link from "next/link";

type EventItem = {
  ID: number;
  Name: string;
  City?: string;
  Venue?: string;
  DisplayDate?: string;
  ParentCategoryID?: number;
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ parentId: string }>;
}) {
  const { parentId } = await params; // ✅ important in your Next version
  const parentIdNum = Number(parentId);

  const res = await fetch("http://localhost:3000/api/events", {
    cache: "no-store",
  });
  const data = await res.json();
  const events: EventItem[] = data?.result ?? [];

  const filtered = events.filter(
    (e) => Number(e.ParentCategoryID) === parentIdNum,
  );

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1 style={{ fontSize: 40, marginBottom: 10 }}>Category {parentIdNum}</h1>

      <Link href="/events">← Back to all events</Link>

      <div style={{ marginTop: 20 }}>
        {filtered.length === 0 ? (
          <p>No events in this category.</p>
        ) : (
          filtered.slice(0, 50).map((event) => (
            <div
              key={event.ID}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 16,
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>{event.Name}</div>
              <div style={{ color: "#555" }}>
                {event.City} • {event.Venue}
              </div>
              <div style={{ color: "#777" }}>{event.DisplayDate}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
