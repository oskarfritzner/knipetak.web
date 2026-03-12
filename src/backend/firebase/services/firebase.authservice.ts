import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from "firebase/auth";
import app from "../firebase.ts";
import { createUserDocument } from "./firebase.userservice";
import { UserType, UserData } from "../../interfaces/UserData";

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if the user already exists in Firestore, if not, create a new document
    const userCredential = result as UserCredential & {
      additionalUserInfo?: { isNewUser?: boolean };
    };
    if (userCredential.additionalUserInfo?.isNewUser) {
      const newUserData: UserData = {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email || "",
        userType: UserType.CUSTOMER,
        createdAt: new Date(),
        // Optional fields with default values
        birthYear: 0,
        healthIssues: "",
        location: {
          id: "",
          name: "",
          address: "",
          city: "",
          postalCode: 0,
        },
        phoneNumber: "",
      };
      await createUserDocument(user.uid, newUserData);
    }

    console.log("User signed in with Google: ", user);
    return user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

// Export onAuthStateChanged for components to use
export { onAuthStateChanged };

// Function to sign up a user
export const signUp = async (
  email: string,
  password: string,
  username: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(user, { displayName: username });

    // Create user document in Firestore with all UserData fields
    const newUserData: UserData = {
      uid: user.uid,
      displayName: username,
      email: email,
      userType: UserType.CUSTOMER,
      createdAt: new Date(),
      birthYear: 0,
      healthIssues: "",
      location: {
        id: "",
        name: "",
        address: "",
        city: "",
        postalCode: 0,
      },
      phoneNumber: "",
    };
    await createUserDocument(user.uid, newUserData);

    console.log("User signed up: ", user);
    return user;
  } catch (error) {
    console.error("Error signing up: ", error);
    throw error;
  }
};

// Function to sign in a user
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    console.log("User signed in: ", user);
    return user;
  } catch (error) {
    console.error("Error signing in: ", error);
    throw error;
  }
};

// Function to log out the current user
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};
