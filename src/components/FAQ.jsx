import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./FAQ.css";

export default function FAQ() {
  const { t } = useTranslation("site");
  const [openItem, setOpenItem] = useState(null);
  const items = t("faq.items", { returnObjects: true });

  return (
    <section className="tf-faq" id="faq" aria-labelledby="tf-faq-title">
      <div className="tf-faq-inner">
        <div className="tf-faq-intro">
          <p className="tf-faq-eyebrow">{t("faq.eyebrow")}</p>
          <h2 id="tf-faq-title" className="tf-faq-title">
            {t("faq.title")}
          </h2>
          <p className="tf-faq-description">{t("faq.description")}</p>
        </div>

        <div className="tf-faq-list">
          {items.map((item, index) => {
            const isOpen = openItem === item.id;
            const answerId = `tf-faq-answer-${item.id}`;
            const questionId = `tf-faq-question-${item.id}`;

            return (
              <article
                className={`tf-faq-item${isOpen ? " is-open" : ""}`}
                key={item.id}
              >
                <h3 className="tf-faq-question-heading">
                  <button
                    className="tf-faq-question"
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenItem(isOpen ? null : item.id)}
                  >
                    <span className="tf-faq-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.question}</span>
                    <span className="tf-faq-toggle" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  className="tf-faq-answer"
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                >
                  <div className="tf-faq-answer-inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
