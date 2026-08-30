export default async () => {
    const owner = "VanyaBaou";
    const repo = "DailyCat";
    const branch = "main";
    const file = "cats/cat-0001.jpg";

    const githubURL =
        `https://api.github.com/repos/${owner}/${repo}/contents/${file}?ref=${branch}`;

    const response = await fetch(githubURL, {
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            "Accept": "application/vnd.github.raw+json",
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

    return new Response(response.body, {
        status: 200,
        headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "no-cache"
        }
    });
};

export const config = {
    path: "/cat"
};