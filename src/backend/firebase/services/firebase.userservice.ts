import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import app from "../firebase.ts";
import { UserData, UserType } from "../../interfaces/UserData";

// Firestore instance
const db = getFirestore(app);

export const createUserDocument = async (
  userId: string,
  userData: UserData,
) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...userData,
      uid: userId,
      userType: userData.userType || UserType.CUSTOMER,
      createdAt: new Date(),
    });
    console.log("User document created successfully");
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}

export async function updateUserProfile(
  uid: string,
  userData: Partial<UserData>,
): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...userData,
      // Ensure updatedAt is set whenever we update the profile
      updatedAt: new Date(),
    });
    console.log("Brukerprofil oppdatert vellykket");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export const updateUserData = async (
  userId: string,
  updates: Partial<UserData>,
) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

// Function to fetch users collection from Firestore
export const fetchUsers = async (): Promise<UserData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...(doc.data() as Omit<UserData, "uid">),
    }));
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    throw error;
  }
};
