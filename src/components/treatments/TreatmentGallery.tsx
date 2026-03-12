import { motion } from "framer-motion";

type GalleryItem = {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
};

type Props = {
  items: GalleryItem[];
};

export function TreatmentGallery({ items }: Props) {
  return (
    <section className="treatments__gallery">
      {items.map((item, index) => (
        <motion.div
          key={`${item.title}-${index}`}
          className="treatments__gallery-item"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
        >
          <img src={item.src} alt={item.alt} draggable={false} />
          <div className="treatments__gallery-overlay">
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </section>
  );
}
