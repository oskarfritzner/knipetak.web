// List of prohibited words
const prohibitedWords = [
  "faen",
  "helvete",
  "jævel",
  "satan",
  "neger",
  "nigger",
  "nigga",
  "nig",
  "homo",
  "faggot",
  "fitta",
  "kuk",
  "homse",
  "jøde",
  "nazi",
  "hitler",
  "sieg heil",
  "palestina",
  "cyka blyat",
  "shit",
  "cunt",
];

// Check if text contains prohibited words
export function containsProhibitedWords(text: string): {
  valid: boolean;
  reason?: string;
} {
  const normalisertTekst = text.toLowerCase();

  for (const word of prohibitedWords) {
    if (normalisertTekst.includes(word)) {
      return {
        valid: false,
        reason: "Navn eller passord inneholder upassende ord.",
      };
    }
  }

  // Check for repeated special characters that may indicate offensive content
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{5,}/.test(text)) {
    return {
      valid: false,
      reason: "Navn eller passord inneholder for mange spesialtegn.",
    };
  }

  return { valid: true };
}

// Validate username
export function validateUsername(username: string): {
  valid: boolean;
  reason?: string;
} {
  if (username.length < 3) {
    return {
      valid: false,
      reason: "Brukernavn må være minst 3 tegn langt.",
    };
  }

  if (username.length > 20) {
    return {
      valid: false,
      reason: "Brukernavn kan ikke være lenger enn 20 tegn.",
    };
  }

  // Check for prohibited words
  const contentCheck = containsProhibitedWords(username);
  if (!contentCheck.valid) {
    return contentCheck;
  }

  // Check for valid characters (allow letters, numbers, spaces and certain special characters)
  if (!/^[a-zA-ZæøåÆØÅ0-9\s._-]+$/.test(username)) {
    return {
      valid: false,
      reason:
        "Ugyldig tegn i brukernavn. Kun bokstaver, tall, mellomrom og tegnene . _ - er tillatt.",
    };
  }

  return { valid: true };
}

// Validate password
export function validatePassword(password: string): {
  valid: boolean;
  reason?: string;
} {
  // Check for prohibited words
  const contentCheck = containsProhibitedWords(password);
  if (!contentCheck.valid) {
    return contentCheck;
  }

  return { valid: true };
}

// Calculate password strength
export function calculatePasswordStrength(password: string): {
  strength: number;
  message: string;
} {
  let strength = 0;
  const messages = [
    "Veldig svakt",
    "Svakt",
    "Middels",
    "Sterkt",
    "Veldig sterkt",
  ];

  // Add points for length
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Add point for uppercase letters
  if (/[A-Z]/.test(password)) strength += 1;

  // Add point for lowercase letters
  if (/[a-z]/.test(password)) strength += 1;

  // Add point for numbers
  if (/\d/.test(password)) strength += 1;

  // Add point for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

  // Add point for combination of numbers and letters
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) strength += 1;

  // Normalize strength from 0-7to 0-4 range
  strength = Math.min(Math.floor(strength * (4 / 7)), 4);

  return {
    strength,
    message: messages[strength],
  };
}
