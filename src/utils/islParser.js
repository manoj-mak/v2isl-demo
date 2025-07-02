// ISL Text Parser Utility
// Converts English text to Indian Sign Language (ISL) word sequence

/**
 * Word stemming and normalization mappings
 * Maps inflected forms to their base forms used in ISL
 */
const WORD_STEM_MAP = {
  // Verb forms to base form
  decided: "decide",
  deciding: "decide",
  decides: "decide",
  running: "run",
  runs: "run",
  ran: "run",
  walking: "walk",
  walks: "walk",
  walked: "walk",
  eating: "eat",
  eats: "eat",
  ate: "eat",
  drinking: "drink",
  drinks: "drink",
  drank: "drink",
  sleeping: "sleep",
  sleeps: "sleep",
  slept: "sleep",
  working: "work",
  works: "work",
  worked: "work",
  playing: "play",
  plays: "play",
  played: "play",
  reading: "read",
  reads: "read",
  writing: "write",
  writes: "write",
  wrote: "write",
  written: "write",
  studying: "study",
  studies: "study",
  studied: "study",
  teaching: "teach",
  teaches: "teach",
  taught: "teach",
  learning: "learn",
  learns: "learn",
  learned: "learn",
  coming: "come",
  comes: "come",
  came: "come",
  going: "go",
  goes: "go",
  went: "go",
  seeing: "see",
  sees: "see",
  saw: "see",
  looking: "look",
  looks: "look",
  looked: "look",
  talking: "talk",
  talks: "talk",
  talked: "talk",
  speaking: "speak",
  speaks: "speak",
  spoke: "speak",
  thinking: "think",
  thinks: "think",
  thought: "think",
  feeling: "feel",
  feels: "feel",
  felt: "feel",
  helping: "help",
  helps: "help",
  helped: "help",
  buying: "buy",
  buys: "buy",
  bought: "buy",
  selling: "sell",
  sells: "sell",
  sold: "sell",
  giving: "give",
  gives: "give",
  gave: "give",
  taking: "take",
  takes: "take",
  took: "take",
  making: "make",
  makes: "make",
  made: "make",
  doing: "do",
  does: "do",
  did: "do",
  having: "have",
  has: "have",
  had: "have",
  being: "be",
  been: "be",
  getting: "get",
  gets: "get",
  got: "get",
  wanting: "want",
  wants: "want",
  wanted: "want",
  needing: "need",
  needs: "need",
  needed: "need",
  loving: "love",
  loves: "love",
  loved: "love",
  liking: "like",
  likes: "like",
  liked: "like",
  hating: "hate",
  hates: "hate",
  hated: "hate",
  trying: "try",
  tries: "try",
  tried: "try",
  starting: "start",
  starts: "start",
  started: "start",
  stopping: "stop",
  stops: "stop",
  stopped: "stop",
  finishing: "finish",
  finishes: "finish",
  finished: "finish",
  visited: "visit",

  // Plural to singular
  books: "book",
  cars: "car",
  dogs: "dog",
  cats: "cat",
  houses: "house",
  people: "person",
  children: "child",
  men: "man",
  women: "woman",
  friends: "friend",
  students: "student",
  teachers: "teacher",
  parents: "parent",
  families: "family",
  countries: "country",
  cities: "city",
  schools: "school",
  hospitals: "hospital",
  restaurants: "restaurant",
  movies: "movie",
  games: "game",
  questions: "question",
  answers: "answer",
  problems: "problem",
  solutions: "solution",

  // Pronouns - ISL specific forms
  myself: "me",
  yourself: "you",
  himself: "he",
  herself: "she",
  ourselves: "we",
  yourselves: "you",
  themselves: "they",

  // Contractions
  "i'm": "i",
  "you're": "you",
  "he's": "he",
  "she's": "she",
  "we're": "we",
  "they're": "they",
  "isn't": "not",
  "aren't": "not",
  "wasn't": "not",
  "weren't": "not",
  "don't": "not",
  "doesn't": "not",
  "didn't": "not",
  "won't": "not will",
  "wouldn't": "not will",
  "can't": "not can",
  "couldn't": "not can",
  "shouldn't": "not should",
  "mustn't": "not must",

  // Adverbs to adjectives or base forms
  quickly: "quick",
  slowly: "slow",
  carefully: "careful",
  easily: "easy",
  clearly: "clear",
  loudly: "loud",
  quietly: "quiet",
  happily: "happy",
  sadly: "sad",
  angrily: "angry",
  beautifully: "beautiful",
  strongly: "strong",
  weakly: "weak",
};

/**
 * Common English phrases to ISL equivalents
 * These handle idiomatic expressions and common phrases
 */
const PHRASE_TRANSFORMATIONS = {
  // Greetings and common phrases
  "how are you": "how you",
  "how do you do": "how you",
  "nice to meet you": "nice meet you",
  "pleased to meet you": "happy meet you",
  "good morning": "morning good",
  "good afternoon": "afternoon good",
  "good evening": "evening good",
  "good night": "night good",
  "see you later": "see you later",
  "see you soon": "see you soon",
  "take care": "careful",
  "excuse me": "excuse",
  "i am sorry": "sorry",
  "thank you": "thank",
  thanks: "thank",
  "you are welcome": "welcome",
  "no problem": "no problem",

  // Questions
  "what are you doing": "what you do",
  "what do you do": "what work you",
  "where are you going": "where you go",
  "where do you live": "where you live",
  "where do you work": "where you work",
  "why are you": "why you",
  "why do you": "why you",
  "when are you": "when you",
  "when do you": "when you",
  "how old are you": "age you how much",
  "what time is it": "time what",
  "what is your name": "name you what",
  "what is this": "this what",
  "what is that": "that what",
  "who is this": "this who",
  "who is that": "that who",
  "how much does this cost": "this price how much",
  "how much is this": "this price how much",
  "can you help me": "you help me can",
  "do you understand": "you understand",
  "do you know": "you know",

  // Common expressions
  "i need help": "help need me",
  "i want to go": "go want me",
  "i like this": "this like me",
  "i love you": "love you me",
  "i miss you": "miss you me",
  "i am hungry": "hungry me",
  "i am thirsty": "thirsty me",
  "i am tired": "tired me",
  "i am happy": "happy me",
  "i am sad": "sad me",
  "i am angry": "angry me",
  "i am fine": "fine me",
  "i am busy": "busy me",
  "i am ready": "ready me",
  "i feel good": "feel good me",
  "i feel bad": "feel bad me",

  // Time expressions
  "right now": "now",
  "at the moment": "now",
  "in the morning": "morning",
  "in the afternoon": "afternoon",
  "in the evening": "evening",
  "at night": "night",
  "last night": "night past",
  "last week": "week past",
  "last month": "month past",
  "last year": "year past",
  "next week": "week future",
  "next month": "month future",
  "next year": "year future",
  "this week": "week this",
  "this month": "month this",
  "this year": "year this",

  // Location expressions
  "at home": "home",
  "at school": "school",
  "at work": "work",
  "in the house": "house inside",
  "outside the house": "house outside",
  "on the table": "table on",
  "under the table": "table under",
  "next to": "near",
  "close to": "near",
  "far from": "far",

  // Weather
  "it is raining": "rain",
  "it is sunny": "sun",
  "it is cloudy": "cloud",
  "it is hot": "hot",
  "it is cold": "cold",
  "it is windy": "wind",

  // Food and drink
  "i am eating": "eat me",
  "i am drinking": "drink me",
  "i want to eat": "eat want me",
  "i want to drink": "drink want me",

  // Family
  "my family": "family my",
  "my mother": "mother my",
  "my father": "father my",
  "my brother": "brother my",
  "my sister": "sister my",
  "my friend": "friend my",
};

/**
 * Words to be removed from ISL translation
 * These include articles, auxiliary verbs, and function words not used in ISL
 */
const WORDS_TO_REMOVE = new Set([
  // Articles
  "a",
  "an",
  "the",

  // Auxiliary verbs (be, have, do)
  "is",
  "am",
  "are",
  "was",
  "were",
  "be",
  "being",
  "been",
  "has",
  "have",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",

  // Modal auxiliaries - keep some, remove others
  // Keep: can, will, should, must, may, might, could, would
  // Remove: (none - modals are important for meaning)

  // Excessive prepositions (keep important ones like 'from', 'with')
  "of",
  "by",
  "for",
  "at",
  "in",
  "on",
  "up",
  "out",
  "off",
  "over",
  "under",
  "to",

  // Some conjunctions (keep 'and', 'but', 'or')
  "so",
  "because",
  "since",
  "as",
  "while",
  "when",
  "if",
  "unless",
  "until",

  // Excessive adverbs
  "very",
  "really",
  "quite",
  "rather",
  "pretty",
  "fairly",
  "somewhat",
  "just",
  "only",
  "even",
  "still",
  "yet",
  "already",
  "also",
  "too",
  "again",
  "back",
  "away",
  "down",
  "here",
  "there",
  "where",

  // Question words that get transformed
  "how",
  "what",
  "when",
  "where",
  "why",
  "who",
  "which",
  "whose",
  // Note: These are removed here but handled in phrase transformations
]);

/**
 * Time markers and their ISL equivalents
 */
const TIME_MARKERS = {
  yesterday: "yesterday",
  today: "today",
  tomorrow: "tomorrow",
  now: "now",
  later: "later",
  before: "before",
  after: "after",
  past: "past",
  future: "future",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night",
};

/**
 * Clean and normalize a word
 * @param {string} word - Input word
 * @returns {string} - Cleaned word
 */
function cleanWord(word) {
  return word
    .toLowerCase()
    .replace(/[^\w]/g, "") // Remove punctuation
    .trim();
}

/**
 * Apply word stemming and normalization
 * @param {string} word - Input word
 * @returns {string} - Normalized word
 */
function normalizeWord(word) {
  const cleaned = cleanWord(word);
  return WORD_STEM_MAP[cleaned] || cleaned;
}

/**
 * Convert Subject-Verb-Object to Subject-Object-Verb order
 * This is a simplified approach - full parsing would require NLP
 * @param {string[]} words - Array of words
 * @returns {string[]} - Reordered words
 */
function applySVOtoSOV(words) {
  // Simple pattern matching for basic sentences
  // This is not comprehensive but handles common cases

  // Pattern: I/You/He/She/We/They + verb + object
  const pronouns = ["i", "you", "he", "she", "we", "they"];
  const commonVerbs = [
    "eat",
    "drink",
    "see",
    "watch",
    "read",
    "write",
    "buy",
    "sell",
    "give",
    "take",
    "make",
    "do",
    "have",
    "want",
    "need",
    "like",
    "love",
    "hate",
    "help",
    "teach",
    "learn",
    "go",
    "come",
    "run",
    "walk",
    "play",
    "work",
    "study",
  ];

  if (words.length >= 3) {
    const subject = words[0];
    const verb = words[1];

    if (pronouns.includes(subject) && commonVerbs.includes(verb)) {
      // Find the object (everything after the verb, excluding time markers)
      const objectWords = [];
      const timeWords = [];

      for (let i = 2; i < words.length; i++) {
        if (TIME_MARKERS[words[i]]) {
          timeWords.push(words[i]);
        } else {
          objectWords.push(words[i]);
        }
      }

      // Reorder: Subject + Object + Verb + Time
      if (objectWords.length > 0) {
        return [subject, ...objectWords, verb, ...timeWords];
      }
    }
  }

  return words; // Return original if no pattern matches
}

/**
 * Main function to convert English text to ISL word sequence
 * @param {string} englishText - Input English text
 * @returns {string[]} - Array of ISL words
 */
export function parseToISL(englishText) {
  if (!englishText || typeof englishText !== "string") {
    return [];
  }

  let text = englishText.toLowerCase().trim();

  // Step 1: Apply phrase transformations first (before word-level processing)
  Object.entries(PHRASE_TRANSFORMATIONS).forEach(([english, isl]) => {
    const regex = new RegExp(`\\b${english}\\b`, "gi");
    text = text.replace(regex, ` ${isl} `);
  });

  // Step 2: Clean punctuation and split into words
  text = text.replace(/[^\w\s]/g, " ");
  let words = text.split(/\s+/).filter((word) => word.length > 0);

  // Step 3: Normalize words (handle contractions, stemming, etc.)
  words = words.map(normalizeWord);

  // Step 4: Handle contractions that result in multiple words
  const expandedWords = [];
  words.forEach((word) => {
    if (word.includes(" ")) {
      expandedWords.push(...word.split(" "));
    } else {
      expandedWords.push(word);
    }
  });
  words = expandedWords;

  // Step 5: Remove unnecessary words
  words = words.filter((word) => !WORDS_TO_REMOVE.has(word) && word.length > 0);

  // Step 6: Apply SOV reordering (simplified)
  words = applySVOtoSOV(words);

  // Step 7: Final cleanup - remove duplicates and empty strings
  words = words.filter(
    (word, index, arr) => word.length > 0 && arr.indexOf(word) === index
  );

  return words;
}

/**
 * Get available animations/signs
 * This should be updated based on your actual animation library
 * @returns {string[]} - Array of available sign words
 */
export function getAvailableSigns() {
  // This is a sample list - update based on your actual 3D model animations
  return [
    // Basic words
    "hello",
    "hi",
    "goodbye",
    "bye",
    "thank",
    "please",
    "sorry",
    "excuse",
    "yes",
    "no",
    "good",
    "bad",
    "big",
    "small",
    "hot",
    "cold",
    "new",
    "old",

    // Pronouns
    "i",
    "me",
    "you",
    "he",
    "she",
    "we",
    "they",
    "my",
    "your",
    "his",
    "her",
    "our",
    "their",

    // Family
    "family",
    "mother",
    "father",
    "brother",
    "sister",
    "child",
    "baby",
    "friend",

    // Actions
    "eat",
    "drink",
    "sleep",
    "work",
    "play",
    "study",
    "read",
    "write",
    "walk",
    "run",
    "sit",
    "stand",
    "go",
    "come",
    "see",
    "look",
    "hear",
    "talk",
    "help",
    "give",
    "take",
    "buy",
    "sell",
    "make",
    "do",
    "have",
    "want",
    "need",
    "like",
    "love",
    "think",
    "know",
    "understand",
    "learn",
    "teach",
    "show",
    "tell",
    "ask",

    // Time
    "time",
    "today",
    "yesterday",
    "tomorrow",
    "now",
    "morning",
    "afternoon",
    "evening",
    "night",
    "week",
    "month",
    "year",
    "past",
    "future",
    "before",
    "after",

    // Places
    "home",
    "school",
    "work",
    "hospital",
    "restaurant",
    "shop",
    "park",
    "city",

    // Food
    "food",
    "water",
    "milk",
    "bread",
    "rice",
    "fruit",
    "vegetable",

    // Colors
    "red",
    "blue",
    "green",
    "yellow",
    "black",
    "white",
    "brown",
    "pink",

    // Numbers
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",

    // Question words (in ISL context)
    "what",
    "when",
    "where",
    "why",
    "who",
    "how",
    "which",

    // Common adjectives
    "happy",
    "sad",
    "angry",
    "tired",
    "hungry",
    "thirsty",
    "sick",
    "healthy",
    "easy",
    "difficult",
    "fast",
    "slow",
    "loud",
    "quiet",
    "clean",
    "dirty",

    // Modal verbs
    "can",
    "will",
    "should",
    "must",
    "may",
    "might",
    "could",
    "would",

    // Common nouns
    "book",
    "car",
    "house",
    "phone",
    "computer",
    "money",
    "clothes",
    "medicine",
    "dog",
    "cat",
    "person",
    "man",
    "woman",
    "boy",
    "girl",

    // Actions specific
    "decide",
    "finish",
    "start",
    "stop",
    "try",
    "remember",
    "forget",
    "wait",
    "feel",
    "touch",
    "smell",
    "taste",
    "watch",
    "listen",
  ];
}

/**
 * Check if a word has an available sign animation
 * @param {string} word - Word to check
 * @returns {boolean} - True if sign is available
 */
export function hasSignAnimation(word) {
  const availableSigns = getAvailableSigns();
  return availableSigns.includes(word.toLowerCase());
}

/**
 * Filter ISL words to only include those with available animations
 * @param {string[]} islWords - Array of ISL words
 * @returns {string[]} - Filtered array with only available signs
 */
export function filterAvailableWords(islWords) {
  const availableSigns = getAvailableSigns();
  return islWords.filter((word) => availableSigns.includes(word.toLowerCase()));
}

/**
 * Get suggestions for words that don't have animations
 * @param {string} word - Word without animation
 * @returns {string[]} - Array of suggested alternative words
 */
export function getSuggestedAlternatives(word) {
  const availableSigns = getAvailableSigns();
  const suggestions = [];

  // Simple similarity check - find words that start with same letter
  // or contain similar patterns
  const firstLetter = word.charAt(0);
  const similarWords = availableSigns.filter(
    (sign) =>
      sign.charAt(0) === firstLetter ||
      sign.includes(word.substring(0, 2)) ||
      word.includes(sign.substring(0, 2))
  );

  suggestions.push(...similarWords.slice(0, 3));

  return suggestions;
}

// Example usage and testing
if (typeof window === "undefined") {
  // Node.js environment - for testing
  console.log("ISL Parser Examples:");
  console.log('Input: "I decided to go home"');
  console.log("Output:", parseToISL("I decided to go home"));

  console.log('\nInput: "How are you doing today?"');
  console.log("Output:", parseToISL("How are you doing today?"));

  console.log('\nInput: "The children are playing in the park"');
  console.log("Output:", parseToISL("The children are playing in the park"));

  console.log('\nInput: "I want to eat some food"');
  console.log("Output:", parseToISL("I want to eat some food"));
}
