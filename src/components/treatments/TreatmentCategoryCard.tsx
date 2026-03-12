import { TreatmentSection, TreatmentType } from "@/interfaces/treatment.interface";

type Props = {
  type: TreatmentType;
  section: TreatmentSection;
  isActive: boolean;
  onClick: () => void;
};

export function TreatmentCategoryCard({ section, isActive, onClick }: Props) {
  return (
    <div
      className={`treatments__category ${
        isActive ? "treatments__category--active" : ""
      }`}
    >
      <button
        type="button"
        className={`treatments__toggle-button ${
          isActive ? "treatments__toggle-button--active" : ""
        }`}
        onClick={onClick}
        aria-expanded={isActive}
      >
        <span className="treatments__button-icon">{isActive ? "▼" : "▶"}</span>
        <span className="treatments__button-text">{section.title}</span>
      </button>
    </div>
  );
}
