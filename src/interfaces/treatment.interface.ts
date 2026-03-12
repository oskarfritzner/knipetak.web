export interface TreatmentContent {
  heading: string;
  description: string;
}

export interface TreatmentSection {
  title: string;
  content: TreatmentContent[];
}

export type TreatmentType = "smerter" | "helse" | "forebygging";

export type TreatmentSections = Record<TreatmentType, TreatmentSection>;
