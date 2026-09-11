export default async function handler(req, res) {
    try {
        const API_KEY = process.env.NASA_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: "NASA_API_KEY is missing"
            });
        }

        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
        );

        if (!response.ok) {
            const errorText = await response.text();

            return res.status(response.status).json({
                error: "NASA API error",
                details: errorText
            });
        }

        const data = await response.json();

        return res.status(200).json(data);

    } catch (error) {
        console.error("APOD Error:", error);

        return res.status(500).json({
            error: "Failed to fetch NASA APOD",
            details: error.message
        });
    }
}