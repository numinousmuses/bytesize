/* eslint-disable */
"use client";
import styles from "./byte.module.css";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as webllm from "@mlc-ai/web-llm";

interface Byte {
    title: string;
    description: string;
    tag: string;
    longdescription: string;
    mainlink: string;
    otherlinks?: string[];
    backgroundColor?: string;
    headerPatternColors?: { [key: string]: string };
    patternClass?: string;
}

interface StoreByteRequest{
  userID: string,
  bytes: Byte[],
  nextByte: boolean
}

const sampleBytes: Byte[] = [
    {
        "title": "Understanding AI",
        "description": "A quick insight into what AI really is and how it's shaping our world.",
        "tag": "Technology",
        "longdescription": "Artificial intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. The term may also be applied to any machine that exhibits traits associated with a human mind such as learning and problem-solving.",
        "mainlink": "https://www.example.com/ai",
        "otherlinks": [
            "https://www.example.com/machinelearning",
            "https://www.example.com/deeplearning"
        ]
    },
    {
        "title": "Future of Renewable Energy",
        "description": "Explore how renewable energy sources are transforming the global energy sector.",
        "tag": "Environment",
        "longdescription": "Renewable energy is energy that is collected from renewable resources, which are naturally replenished on a human timescale...",
        "mainlink": "https://www.example.com/renewable",
        "otherlinks": [
            "https://www.example.com/solar",
            "https://www.example.com/wind"
        ]
    },
    {
        "title": "Basics of Cryptography",
        "description": "Dive into the basics of cryptography, including its history and applications.",
        "tag": "Security",
        "longdescription": "Cryptography involves creating written or generated codes that allow information to be kept secret...",
        "mainlink": "https://www.example.com/cryptography",
        "otherlinks": []
    },
];

export default function Bytes() {
    const [session, setSession] = useState<{
      userId: string;
      email: string;
      username: string;
      docks?: any;
    } | null>(null);
    const [bytes, setBytes] = useState<Byte[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null);
    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);
    const [secondRound, setSecondRound] = useState<boolean>(true)
    const [fullTopics, setFullTopics] = useState<string[]>([]);
    


    // Fetch topics for the current user
    const fetchUserTopics = async (userId: string) => {
      try {
          const response = await fetch(`/api/config/topics/${userId}`);
          if (response.ok) {
              const { topics } = await response.json();
              console.log("User topics fetched successfully:", topics);
              setFullTopics(topics); // Set the user's topics
          } else {
              console.error("Failed to fetch user topics, proceeding with blank.");
          }
      } catch (error) {
          console.error("Error fetching user topics:", error);
      }
  };
  
    useEffect(() => {
      const fetchSessionAndBytes = async () => {
        try {
          const response = await fetch("/api/auth/session");
          if (response.ok) {
            const data = await response.json();
            setSession(data);
            fetchBytes(data.userId);
          } else {
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching session:", error);
          router.push("/login");
        }
      };
  
      if (!session) {
        fetchSessionAndBytes();
      }
    }, [router, session]);

    // Random color generator and style logic
    const getRandomColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
  
    const shadeColor = (color: string, percent: number) => {
      let R = parseInt(color.substring(1, 3), 16);
      let G = parseInt(color.substring(3, 5), 16);
      let B = parseInt(color.substring(5, 7), 16);
  
      R = Math.round(R * (1 + percent));
      G = Math.round(G * (1 + percent));
      B = Math.round(B * (1 + percent));
  
      R = R < 255 ? (R < 0 ? 0 : R) : 255;
      G = G < 255 ? (G < 0 ? 0 : G) : 255;
      B = B < 255 ? (B < 0 ? 0 : B) : 255;
  
      const RR = R.toString(16).padStart(2, "0");
      const GG = G.toString(16).padStart(2, "0");
      const BB = B.toString(16).padStart(2, "0");
  
      return "#" + RR + GG + BB;
    };
  
    const patternClasses = ["headerPattern", "agentsPattern", "bytesizePattern"];
  
    const assignRandomStyles = (byteArray: Byte[]) => {
      return byteArray.map((byte) => {
        const headerPatternColor = getRandomColor();
        const patternClass = patternClasses[Math.floor(Math.random() * patternClasses.length)];
        return {
          ...byte,
          backgroundColor: headerPatternColor,
          patternClass: patternClass,
          headerPatternColors: {
            "--c1": shadeColor(headerPatternColor, 0),
            "--c2": shadeColor(headerPatternColor, -0.2),
            "--c3": shadeColor(headerPatternColor, 0.2),
            "--background-color": headerPatternColor,
          },
        };
      });
    };
  
    const fetchBytes = async (userId: string) => {
      try {
        const response = await fetch(`/api/byte/${userId}`);
        if (response.ok) {
          const data: { shouldUpdate: boolean; bytesData: Byte[] } = await response.json();
    
          const byteDataWithStyles = assignRandomStyles(data.bytesData);
          setBytes(byteDataWithStyles);
    
          if (data.shouldUpdate) {
            console.log("Bytes data was updated from USERNEXTBYTES.");
            // Optionally, you can notify the user or perform additional actions here

            await fetchUserTopics(session?.userId!)
            await generateQueriesForTopics(fullTopics);


          } else {
            console.log("Bytes data is up-to-date.");
          }
        } else {
          // const byteDataWithStyles = assignRandomStyles(sampleBytes);
          // setBytes(byteDataWithStyles);
          // router.push("/config")
          console.error("Failed to fetch bytes");
        }
      } catch (error) {
        router.push("/config")

        // const byteDataWithStyles = assignRandomStyles(sampleBytes);
        // setBytes(byteDataWithStyles);
        console.error("Error fetching bytes:", error);
      }
    };
    
    const postQueriesToAPI = async (queries: string[][]) => {
      try {
          const response = await fetch("/api/internet", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ queries }), // Send the queries as the request body
          });
  
          if (response.ok) {
              const urls: string[][][] = await response.json(); // Higher-dimensional array of URLs
              console.log("URLs received from /api/internet:", urls);
  
              // Arrays to store HTML content and generated bytes
              const stringifiedHTMLExtracted: string[][][] = [];
              const generatedBytes: Byte[][] = []; // To store the final bytes per query group
  
              // Loop through the topics
              for (let i = 0; i < urls.length; i++) {
                  const topicUrls: string[][] = urls[i]; // Array of URL arrays for this topic
                  const topicHTML: string[][] = [];
                  const topicBytes: Byte[] = []; // Store the bytes for each query group
  
                  // Loop through the queries for this topic
                  for (let j = 0; j < topicUrls.length; j++) {
                      const queryUrls: string[] = topicUrls[j]; // Array of URLs for this query
                      const queryHTML: string[] = [];
  
                      // Loop through the URLs for this query
                      for (let k = 0; k < queryUrls.length; k++) {
                          const url = queryUrls[k];
                          try {
                              const htmlResponse = await fetch(url);
                              const htmlText = await htmlResponse.text(); // Get the HTML text
                              queryHTML.push(htmlText); // Add the HTML text to the array for this query
  
                              // Define the JSON schema for a `Byte` object
                              const byteSchema = {
                                  type: "object",
                                  properties: {
                                      title: { type: "string" },
                                      description: { type: "string" },
                                      tag: { type: "string" },
                                      longdescription: { type: "string" },
                                      mainlink: { type: "string" },
                                      otherlinks: {
                                          type: "array",
                                          items: { type: "string" },
                                      },
                                  },
                                  required: ["title", "description", "tag", "longdescription", "mainlink"],
                              };
  
                              // Prompt the LLM to generate the `Byte` for the HTML and corresponding query
                              const bytePrompt = `
                                  You are a content creation agent. Your job is to generate a \`Byte\` for the following HTML content based on the query: "${queries[i][j]}". 
                                  The \`Byte\` object must include a title (a heading for the byte), description (must be one paragraph), tag (a tag for the category of topic this is), longdescription (must be 3 paragraphs), mainlink (main reference link for byte), and optionally other reference links. 
                                  Format the response in JSON based on the provided schema.
                                  HTML Content: ${htmlText}
                              `;
  
                              // Call LLM to generate the `Byte`
                              const byteResult = await promptLLMJSONSchema(byteSchema, bytePrompt, "Qwen2.5-1.5B-Instruct-q4f16_1-MLC");
  
                              if (byteResult) {
                                  topicBytes.push(byteResult); // Add the generated `Byte` object to the list
                              } else {
                                  console.error(`Failed to generate Byte for query: "${queries[i][j]}"`);
                              }
  
                          } catch (error) {
                              console.error(`Failed to fetch or generate Byte for HTML from ${url}:`, error);
                              queryHTML.push(`Failed to fetch from ${url}`);
                          }
                      }
  
                      topicHTML.push(queryHTML); // Add the query HTML array to the topic
                  }
  
                  stringifiedHTMLExtracted.push(topicHTML); // Add the topic's HTML arrays to the final array
                  generatedBytes.push(topicBytes); // Add the generated bytes for the topic
              }
  
              console.log("HTML Extracted from URLs:", stringifiedHTMLExtracted);
              console.log("Generated Bytes:", generatedBytes);
              // Now you have `generatedBytes` array containing the generated Byte objects per query group.
              const flattenedGeneratedBytes: Byte[] = generatedBytes.flat();

              const params: StoreByteRequest = {
                  userID: session!.userId,
                  bytes: flattenedGeneratedBytes,
                  nextByte: secondRound,
              }

              const storesponse = await fetch("/api/bytes/store", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify(params), // Send the queries as the request body
              });

              if (storesponse.ok) {

                  if (secondRound){
                      confirm("Your bytes have been generated. Ready to Byte?")
                      router.push("/byte");
                  }

                  // do it all again
                  setSecondRound(true);
                  await generateQueriesForTopics(fullTopics);
                  


                  
              } else {
                  try {
                      const storesponse = await fetch("/api/bytes/store", {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json",
                          },
                          body: JSON.stringify(params), // Send the queries as the request body
                      });

                      if(storesponse.ok){

                          if (secondRound){
                              confirm("Your bytes have been generated. Ready to Byte?")
                              router.push("/byte");
                          }
      
                          // do it all again
                          setSecondRound(true);
                          await generateQueriesForTopics(fullTopics);

                      } else {
                          throw new Error("Error Getting Bytes. Please refresh the page and try again")
                      }
                  } catch (error) {
                      alert("Error Getting Bytes. Please refresh the page and try again.")
                  }
              }


  
          } else {
              console.error("Failed to get URLs from /api/internet");
          }
      } catch (error) {
          console.error("Error posting queries to /api/internet:", error);
      }
  };

    // Function to generate queries for randomly selected topics using the LLM
    const generateQueriesForTopics = async (topics: string[]) => {
        const selectedTopics = topics.length > 10
            ? topics.sort(() => 0.5 - Math.random()).slice(0, 10)  // Randomly select 20 topics
            : topics;  // Use all topics if there are 20 or fewer

        const allGeneratedQueries: string[][] = [];

        // Loop through each topic and prompt LLM individually
        for (const topic of selectedTopics) {
            const schema = {
                type: "object",
                properties: {
                    queries: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["queries"]
            };

            const examplePrompt = `Important: your arraay must always be of length 5 (You should always have 5 queries). You are a news curation agent. Your job is to generate queries for topics to search the internet and provide new and unique information to the user. Generate a list of 5 unique internet queries for each of the the following topic that will provide the user with valuable and diverse knowledge with different perspectives for the topic. Choose a specific theme for each of the 10 queries you generate so that they can provide specific and welll rounded information on the specific idea/subtopic reltaed to the topic. Your queries should be random and specific. If I ask you again with the same prompt to generate queries, your answers should be different from the first time I asked. Topic: ${topic}.`;
            const modelId = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC"; // Example model ID

            const result = await promptLLMJSONSchema(schema, examplePrompt, modelId);

            if (result?.queries && Array.isArray(result.queries)) {
                allGeneratedQueries.push([result.queries]); // Add generated queries to the array
                console.log("added to allgeneratedqueries")
                console.log(allGeneratedQueries)
            }
        }

        // Once all queries are generated, send them to /api/internet
        await postQueriesToAPI(allGeneratedQueries);
    };

    // Adjust scroll logic to detect when the user reaches the bottom
    useEffect(() => {
      const content = contentRef.current;
      if (!content) return;

      const handleScroll = () => {
        const scrollPosition = content.scrollTop;
        const totalHeight = content.scrollHeight;
        const viewportHeight = content.clientHeight;
        const isScrolledToBottom = scrollPosition + viewportHeight >= totalHeight - 10; // Added small buffer for precision

        if (isScrolledToBottom) {
          setCurrentIndex(bytes.length); // This ensures we trigger the "consumedAllBytes" section
        }
      };

      content.addEventListener("scroll", handleScroll);

      return () => {
        content.removeEventListener("scroll", handleScroll);
      };
    }, [bytes.length]);

    // Define the LLM prompting logic
    const promptLLMJSONSchema = async (schema: any, prompt: string, modelId: string): Promise<any> => {
        const schemaString = JSON.stringify(schema);
        const initProgressCallback = (report: webllm.InitProgressReport) => {
            console.log("LLM Initialization:", report.text);
        };

        const engine: webllm.MLCEngineInterface = await webllm.CreateMLCEngine(modelId, { initProgressCallback });

        const request: webllm.ChatCompletionRequest = {
            stream: false,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 8000,
            response_format: {
                type: "json_object",
                schema: schemaString,
            } as webllm.ResponseFormat,
        };

        try {
            console.log("Message about to be sent to chat completion")
            const completion = await engine.chatCompletion(request);
            const output = completion.choices[0]?.message?.content;  // Access the generated content
            console.log("Generated JSON Output:", output);
            return JSON.parse(output!); // Parse the JSON response
        } catch (error) {
            console.error("Error generating JSON based on schema:", error);
            try{
                console.log("Trying to generate schema again")
                const completion = await engine.chatCompletion(request);
                const output = completion.choices[0]?.message?.content;  // Access the generated content
                console.log("Generated JSON Output:", output);
                return JSON.parse(output!); // Parse the JSON response
            } catch {
                console.log("Ultimate Fail")
                return null
            }
        }
    };
  
    const handleLogout = async () => {
      try {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (response.ok) {
          router.push("/login");
        } else {
          console.error("Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    };
  
    const openDetails = (index: number) => setCurrentModalIndex(index);
    const closeDetails = () => setCurrentModalIndex(null);
  
    return (
      <div className={styles.page}>
        <div className={styles.content} ref={contentRef}>
          {bytes.map((byte, index) => (
            <div
              key={index}
              className={styles.byte}
              style={{ backgroundColor: byte.backgroundColor, "--background-color": byte.backgroundColor } as React.CSSProperties}
            >
              <div
                className={`${styles.headerPattern} ${styles[byte.patternClass || ""]}`}
                style={byte.headerPatternColors as React.CSSProperties}
              ></div>
              <div className={styles.byteContent}>
                <a href={byte.mainlink} target="_blank" rel="noopener noreferrer">
                  <h2>{byte.title}</h2>
                </a>
                <p onClick={() => openDetails(index)}>{byte.description}</p>
                <span>{byte.tag}</span>
              </div>
            </div>
          ))}

          {/* This section appears after the user has scrolled through all the bytes */}
          {bytes.length > 0 && currentIndex >= bytes.length && (
            <div className={styles.consumedAllBytes}>
              <p>You've consumed all your bytes for now.</p>
              <p>Please check back in the next hour for your new bytes.</p>
            </div>
          
          )}
        </div>

        {currentModalIndex !== null && (
          <div className={styles.byteModal}>
            <h2>{bytes[currentModalIndex].title}</h2>
            <p>{bytes[currentModalIndex].longdescription}</p>
            {bytes[currentModalIndex].otherlinks?.map((link, index) => (
              <a key={index} href={link} target="_blank" rel="noopener noreferrer">
                {link}
              </a>
            ))}
            <button onClick={closeDetails}>Close</button>
          </div>
        )}

        <div className={styles.footer}></div>
      </div>
    );
}
