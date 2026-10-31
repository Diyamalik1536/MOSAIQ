
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import RevealOnScroll from "./RevealOnScroll";
import "./Hero.css";

const pillColors = ["#d0f4d8", "#eadbfa", "#e6f3fe", "#bde6e4"];

export default function Hero() {
  const { t } = useTranslation(["landing", "site"]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const videoFrameRef = useRef(null);
  const phrases = t("hero.headlinePhrases", {
    ns: "site",
    returnObjects: true
  });
  const phraseCount = phrases.length;
  const phrase = phrases[phraseIndex % phraseCount];

  // Respect the user's reduced-motion preference.
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      setMotionAllowed(!mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotionPreference
      );
    };
  }, []);

  // Rotate the highlighted phrase.
  useEffect(() => {
    if (!motionAllowed) return;

    const intervalId = window.setInterval(() => {
      setPhraseIndex((currentIndex) => {
        return (currentIndex + 1) % phraseCount;
      });
    }, 2800);

    return () => window.clearInterval(intervalId);
  }, [motionAllowed, phraseCount]);

  useLayoutEffect(() => {
    const frame = videoFrameRef.current;
    if (!frame) return;

    const updateBorderOffsets = () => {
      const styles = window.getComputedStyle(frame);
      frame.style.setProperty("--tf-video-border-left", styles.borderLeftWidth);
      frame.style.setProperty("--tf-video-border-right", styles.borderRightWidth);
      frame.style.setProperty("--tf-video-border-bottom", styles.borderBottomWidth);
    };

    updateBorderOffsets();
    window.addEventListener("resize", updateBorderOffsets);

    return () => window.removeEventListener("resize", updateBorderOffsets);
  }, []);

  return (
    <section className="tf-hero" id="home">
      {/* Hero heading */}
      <RevealOnScroll className="tf-hero-inner">
        <div className="tf-hero-badge">
          <span aria-hidden="true">⌂</span>
          {t("hero.badge", { ns: "site" })}
        </div>

        <h1
          className="tf-hero-title"
          aria-label={`${t("hero.lineOne", { ns: "site" })} ${t("hero.lineTwo", { ns: "site" })} ${phrase}`}
        >
          <span className="tf-hero-line">
            {t("hero.lineOne", { ns: "site" })}
          </span>

          <span className="tf-hero-line tf-hero-second-line">
            <span>{t("hero.lineTwo", { ns: "site" })}</span>

            <span
              className="tf-hero-pill-slot"
              style={{ "--tf-pill-bg": pillColors[phraseIndex] }}
            >
              <span
                key={phraseIndex}
                className="tf-hero-pill"
                aria-hidden="true"
              >
                {phrase}
              </span>
            </span>
          </span>
        </h1>

        <p className="tf-hero-description">
          {t("hero.description", { ns: "site" })}
        </p>
      </RevealOnScroll>

      {/* Product video and student illustrations */}
      

<RevealOnScroll className="tf-product-film" id="product-film">
  <div className="tf-video-frame" ref={videoFrameRef}>
    <video
      className="tf-product-video"
      controls
      muted
      playsInline
      preload="metadata"
      aria-label={t("hero.videoLabel", { ns: "site" })}
    >
      <source
        src="/videos/talentforge-intro.mp4"
        type="video/mp4"
      />
    </video>
    <img
      className="tf-hero-girl"
      src="/illustrations/talentforge-girl.png"
      alt=""
      aria-hidden="true"
    />
    <img
      className="tf-hero-boy"
      src="/illustrations/talentforge-boy.png"
      alt=""
      aria-hidden="true"
    />
  </div>
</RevealOnScroll>


    </section>
  );
}
