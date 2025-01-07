/* eslint-disable */
// /api/internet

// intakes queries string[][], returns urls in a string[][][] corresponding to the query

import { NextRequest, NextResponse } from "next/server";

// List of SearxNG instances to use (from the provided images)
const searxInstances = [
    'https://search.inetol.net/',
    'https://paulgo.io/',
    'https://searx.tiekoetter.com/',
    'https://search.hbubli.cc/',
    'https://priv.au/',
    'https://search.indst.eu/',
    'https://search.bus-hit.me/',
    'https://searx.work/',
    'https://search.rhscz.eu/',
    'https://opnxng.com/',
    'https://searx.rhscz.eu/',
    'https://search.ononoki.org/',
    'https://baresearch.org/',
    'https://search.im-in.space/',
    'https://sx.thatxtreme.dev/',
    'https://search.leptons.xyz/',
    'https://search.mdosch.de/',
    'https://www.gruble.de/',
    'https://search.sapti.me/',
    'https://ooglester.com/',
    'https://searx.daetalytica.io/',
    'https://search.getcobalt.org/',
];

// Helper function to randomly select an instance
const getRandomInstance = (exclude: string[] = []) => {
    // Filter out instances that have already failed
    const availableInstances = searxInstances.filter((instance) => !exclude.includes(instance));
    return availableInstances[Math.floor(Math.random() * availableInstances.length)];
};

// Function to search using the SearXNG API limited to Google engine with retry logic
const searchSearXNGAPI = async (query: string, retries = 2): Promise<string[]> => {
    let failedInstances: string[] = [];
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        const instance = getRandomInstance(failedInstances); // Select an instance, excluding the failed ones

        try {
            const params = new URLSearchParams({
                q: query,
                format: "json", // Request JSON format
                engines: "google", // Limit to Google engine
            });

            const response = await fetch(`${instance}search?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch from SearXNG instance: ${instance}`);
            }

            const data = await response.json();

            // Extract URLs from the search results and limit to top 5
            const urls = data.results?.map((result: any) => result.url).slice(0, 5) || [];
            return urls;

        } catch (error) {
            console.error(`Error fetching from SearXNG instance ${instance}:`, error);
            failedInstances.push(instance); // Track failed instance
        }
    }

    return []; // Return empty if all attempts fail
};

export async function POST(request: NextRequest) {
    try {
        const { queries }: { queries: string[][] } = await request.json();

        if (!queries || !Array.isArray(queries)) {
            return NextResponse.json({ error: "Invalid query format" }, { status: 400 });
        }

        const allResults: string[][][] = [];

        // Iterate over topics and queries
        for (const queryGroup of queries) {
            const queryGroupResults: string[][] = [];

            // Iterate over each query in the group and get URLs
            for (const query of queryGroup) {
                const urls = await searchSearXNGAPI(query);
                queryGroupResults.push(urls); // Store the URLs for the current query
            }

            allResults.push(queryGroupResults); // Store the results for the current group of queries
        }

        // Return the results as a higher-dimensional array
        return NextResponse.json(allResults, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Failed to process search queries" }, { status: 500 });
    }
}
