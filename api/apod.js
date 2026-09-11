export default async function handler(req, res) {
    const API_KEY = process.env.NASA_API_KEY;

    try {
        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
        );

        const data = await response.json();

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch NASA APOD"
        });
    }
}