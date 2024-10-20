/* eslint-disable */
"use client";
import styles from "./byte.module.css";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

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

const sampleBytes: Byte[] = [
    {
        "title": "Understanding AI",
        "description": "A quick insight into what AI really is and how it's shaping our world.",
        "tag": "Technology",
        "longdescription": "Artificial intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. The term may also be applied to any machine that exhibits traits associated with a human mind such as learning and problem-solving. The ideal characteristic of artificial intelligence is its ability to rationalize and take actions that have the best chance of achieving a specific goal.",
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
    // ... (rest of your bytes)
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
          const byteData: Byte[] = await response.json();
          const byteDataWithStyles = assignRandomStyles(byteData);
          setBytes(byteDataWithStyles);
        } else {
          const byteDataWithStyles = assignRandomStyles(sampleBytes);
          setBytes(byteDataWithStyles);
          console.error("Failed to fetch bytes");
        }
      } catch (error) {
        const byteDataWithStyles = assignRandomStyles(sampleBytes);
        setBytes(byteDataWithStyles);
        console.error("Error fetching bytes:", error);
      }
    };
  
    useEffect(() => {
      const content = contentRef.current;
      if (!content) return;
  
      const handleScroll = () => {
        const scrollPosition = content.scrollTop;
        const viewportHeight = window.innerHeight;
        const newIndex = Math.round(scrollPosition / viewportHeight);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      };
  
      content.addEventListener("scroll", handleScroll);
  
      return () => {
        content.removeEventListener("scroll", handleScroll);
      };
    }, [currentIndex]);
  
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
          {bytes.length > 0 && currentIndex === bytes.length && <div>You've consumed all the bytes</div>}
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
