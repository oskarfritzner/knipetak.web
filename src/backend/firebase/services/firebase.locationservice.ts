import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import app from "../firebase";
import { Location, LocationFormData } from "../../interfaces/Location";

const db = getFirestore(app);
const LOCATIONS_COLLECTION = "locations";

/**
 * Get all locations
 */
export async function getLocations(): Promise<Location[]> {
  try {
    const querySnapshot = await getDocs(collection(db, LOCATIONS_COLLECTION));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Location[];
  } catch (error) {
    console.error("Error getting locations:", error);
    throw error;
  }
}

/**
 * Create a new location
 */
export async function createLocation(
  locationData: LocationFormData,
): Promise<string> {
  try {
    const docRef = await addDoc(
      collection(db, LOCATIONS_COLLECTION),
      locationData,
    );
    return docRef.id;
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
}

/**
 * Update an existing location
 */
export async function updateLocation(
  id: string,
  locationData: Partial<LocationFormData>,
): Promise<void> {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, id);
    await updateDoc(locationRef, locationData);
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
}

/**
 * Delete a location
 */
export async function deleteLocation(id: string): Promise<void> {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, id);
    await deleteDoc(locationRef);
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
}

/**
 * Get a single location by ID
 */
export async function getLocationById(id: string): Promise<Location | null> {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, id);
    const locationDoc = await getDoc(locationRef);

    if (!locationDoc.exists()) {
      return null;
    }

    return {
      id: locationDoc.id,
      ...locationDoc.data(),
    } as Location;
  } catch (error) {
    console.error("Error getting location:", error);
    throw error;
  }
}
