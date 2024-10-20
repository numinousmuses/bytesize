"use client"
import styles from "./page.module.css";
import { useEffect, useState } from "react";

// homepage
// hero
// copy
// demos
// pricing
// contact
// agents | genesiss | bytesize

export default function Home() {

  const [currentPattern, setCurrentPattern] = useState(1);
  const [nextPattern, setNextPattern] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPattern(nextPattern); // Update to the new pattern after the animation completes
        setNextPattern((prevPattern) => (prevPattern % 4) + 1); // Cycle through 4 patterns
        setIsAnimating(false); // Reset animation state
      }, 1250); // Duration of slide animation
    }, 2500); // Interval for switching slides

    return () => clearInterval(interval);
  }, [nextPattern]);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
      <div className={styles.heroImage}>
          {/* Current pattern div */}
          <div
            className={`${styles.heroPattern} ${styles[`heroPattern${currentPattern}`]} ${
              isAnimating ? styles.slideOut : ""
            }`}
          ></div>
          {/* Next pattern div */}
          <div
            className={`${styles.heroPattern} ${styles[`heroPattern${nextPattern}`]} ${
              isAnimating ? styles.slideIn : styles.hidden
            }`}
          ></div>
        </div>
        
        <div className={styles.heroText}>
            {/* <h1>GENESISS <span className={styles.herospan}>SEARCH</span></h1> */}
            <h1>BYTESIZE</h1>
            <p>Where Knowledge Meets Brevity</p>
        </div>
      </div>
      <div className={styles.copy}></div>
      <div className={styles.demos}></div>
      <div className={styles.pricing}></div>
      <div className={styles.contact}></div>
      <div className={styles.bottomCardsTitle}>Learn more about our other products:</div>
      <div className={styles.bottomCards}>
        <div className={styles.agents}>
          <a href="https://agents.genesiss.tech">
            <div className={styles.agentsPattern}></div>
            <div className={styles.gCardText}>
              Genesiss Agents
            </div>
          </a>
        </div>
        <div className={styles.genesiss}>
         <a href="https://www.genesiss.tech"> 
          <div className={styles.genesissPattern}></div>
          <div className={styles.gCardText}>
            Genesiss AI API
          </div>
        </a>
        </div>
        <div className={styles.bytesize}>
          <a href="https://bytesize.world">
            <div className={styles.bytesizePattern}></div>
            <div className={styles.gCardText}>
              Bytesize
            </div>
          </a>
        </div>
      </div>
      <footer className={styles.footer}></footer>
    </div>
  );
}
