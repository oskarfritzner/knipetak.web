import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../firebase";
import { Treatment } from "../../interfaces/Treatment";

const db = getFirestore(app);

/**
 * Retrieves a list of treatments from Firestore.
 * Expects treatment documents to be stored in a "treatments" collection.
 */
export const getTreatments = async (): Promise<Treatment[]> => {
  try {
    const treatmentsRef = collection(db, "treatments");
    const snapshot = await getDocs(treatmentsRef);
    const treatments: Treatment[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<Treatment, "id">;
      treatments.push({ id: doc.id, ...data });
    });
    return treatments;
  } catch (error) {
    console.error("Error fetching treatments:", error);
    throw error;
  }
};
