export default async (req) => {
    const cats = [
        "cat-0001.jpg",
        "cat-0002.jpg",
        "cat-0003.jpg",
        "cat-0004.jpg",
        "cat-0005.jpg",
        "cat-0006.jpg",
        "cat-0007.jpg",
        "cat-0008.jpg",
        "cat-0009.jpg",
        "cat-0010.jpg",
        "cat-0011.jpg",
        "cat-0012.jpg",
        "cat-0013.jpg",
        "cat-rain.gif",
        "cat-swim.gif"
    ];

    if (cats.length === 0) {
        return new Response("No images configured.", {
            status: 404
        });
    }

    // Same image for everyone on the same UTC date.
    const today = new Date().toISOString().slice(0, 10);

    // Deterministic hash from today's date.
    let hash = 0;

    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0;
    }

    const index = Math.abs(hash) % cats.length;
    const filename = cats[index];

    const imageURL =
		`https://raw.githubusercontent.com/VanyaBaou/DailyCat/main/cats/${encodeURIComponent(filename)}`;

    const response = await fetch(imageURL);

    if (!response.ok) {
        return new Response("Image not found.", {
            status: 404
        });
    }

    // Preserve the source image's MIME type.
    const contentType =
        response.headers.get("Content-Type") || "application/octet-stream";

    return new Response(response.body, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600"
        }
    });
};

export const config = {
    path: "/cat"
};