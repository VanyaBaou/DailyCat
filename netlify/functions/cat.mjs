export default async () => {
    const imageURL =
        "https://raw.githubusercontent.com/VanyaBaou/DailyCat/main/cats/cat-0001.jpg";

    const response = await fetch(imageURL);

    if (!response.ok) {
        return new Response("Could not fetch cat image.", {
            status: 502
        });
    }

    const contentType =
        response.headers.get("Content-Type") || "application/octet-stream";

    return new Response(response.body, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "no-cache"
        }
    });
};

export const config = {
    path: "/cat"
};