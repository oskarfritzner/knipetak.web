import { motion, AnimatePresence } from "framer-motion";
import type { TreatmentSection } from "@/interfaces/treatment.interface";

type Props = {
  content: TreatmentSection | null;
  contentRef?: React.RefObject<HTMLDivElement | null>;
};

export function TreatmentContent({ content, contentRef }: Props) {
  return (
    <AnimatePresence initial={false}>
      {content ? (
        <motion.div
          className="treatments__grid-container"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div ref={contentRef}>
            <div className="treatments__grid">
              {content.content.map((item, index) => (
                <article key={index} className="treatments__card">
                  <div className="treatments__card-content">
                    <h3 className="treatments__card-title">{item.heading}</h3>
                    <p className="treatments__card-text">{item.description}</p>
                  </div>
                  <div className="treatments__card-decoration" />
                </article>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
