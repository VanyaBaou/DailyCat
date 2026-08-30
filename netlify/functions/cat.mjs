export default async () => {
    const owner = "VanyaBaou";
    const repo = "DailyCat";
    const branch = "main";
    const folder = "cats";

    // Ask GitHub for the contents of the cats/ folder.
    const githubURL =
        `https://api.github.com/repos/${owner}/${repo}/contents/${folder}?ref=${branch}`;

    const response = await fetch(githubURL, {
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "DailyCat-Netlify"
        }
    });

    if (!response.ok) {
        const error = await response.text();

        return new Response(
            `GitHub returned ${response.status}: ${error}`,
            { status: 502 }
        );
    }

    const files = await response.json();

    // Only allow actual image files.
    const images = files
        .filter(file => file.type === "file")
        .filter(file =>
            /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name)
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    if (images.length === 0) {
        return new Response(
            "No images found in the cats folder.",
            { status: 404 }
        );
    }

    // Use today's date as a deterministic seed.
    const today = new Date().toISOString().slice(0, 10);

    let hash = 0;

    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0;
    }

    const index = Math.abs(hash) % images.length;
    const selected = images[index];

    // Fetch the actual image using its GitHub API download URL.
    const imageResponse = await fetch(selected.download_url, {
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "DailyCat-Netlify"
        }
    });

    if (!imageResponse.ok) {
        return new Response(
            `Could not fetch selected image: ${imageResponse.status}`,
            { status: 502 }
        );
    }

    // Determine the MIME type from the filename.
    const extension = selected.name
        .split(".")
        .pop()
        .toLowerCase();

    const mimeTypes = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
        avif: "image/avif"
    };

    const contentType =
        mimeTypes[extension] || "application/octet-stream";

    return new Response(imageResponse.body, {
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