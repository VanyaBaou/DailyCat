export default async () => {
    const owner = "VanyaBaou";
    const repo = "DailyCat";
    const branch = "main";
    const folder = "cats";

    // Get all files in the cats/ folder.
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
        return new Response(
            `GitHub returned ${response.status}`,
            {
                status: 502,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8"
                }
            }
        );
    }

    const files = await response.json();

    const images = files
        .filter(file => file.type === "file")
        .filter(file =>
            /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name)
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    if (images.length === 0) {
        return new Response(
            "No images found in the cats folder.",
            {
                status: 404,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8"
                }
            }
        );
    }

    // Use the current Eastern Time date to deterministically select an image.
    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

    let hash = 0;

    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0;
    }

    const index = Math.abs(hash) % images.length;
    const selected = images[index];

    // Fetch the selected image through GitHub's authenticated API.
    const imageURL =
        `https://api.github.com/repos/${owner}/${repo}/contents/${folder}/${encodeURIComponent(selected.name)}?ref=${branch}`;

    const imageResponse = await fetch(imageURL, {
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            "Accept": "application/vnd.github.raw+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "DailyCat-Netlify"
        }
    });

    if (!imageResponse.ok) {
        return new Response(
            `Could not fetch selected image: ${imageResponse.status}`,
            {
                status: 502,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8"
                }
            }
        );
    }

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
            "Content-Disposition": "inline",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate"
        }
    });
};

// Function URL: /cat
export const config = {
    path: "/cat"
};