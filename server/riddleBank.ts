import { RiddleCategoryId } from '../src/types.ts';
import { VERIFIED_SEED_RIDDLES } from './riddlesSeed.ts';

/**
 * Hand-checked offline riddles. Used whenever the AI engine is unavailable
 * (no key, quota hit, network down at the venue) so the Brain Arena never
 * shows an error screen to a visitor.
 */
export interface BankRiddle {
  subtopic: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export const RIDDLE_BANK: Record<RiddleCategoryId, BankRiddle[]> = {
  technology: [
    {
      subtopic: 'Computers',
      question: 'I have keys but open no locks, space but no room, and you can enter but never go inside. What am I?',
      options: ['A piano', 'A keyboard', 'A map', 'A server'],
      correctIndex: 1,
      hint: 'You are probably touching one right now.',
      explanation: 'A computer keyboard has keys, a space bar and an Enter key.',
    },
    {
      subtopic: 'Computers',
      question: 'How many different values can a single byte (8 bits) represent?',
      options: ['8', '128', '255', '256'],
      correctIndex: 3,
      hint: 'Two choices per bit, eight bits.',
      explanation: 'Each bit has 2 states, so 8 bits give 2⁸ = 256 values (0 to 255).',
    },
    {
      subtopic: 'Artificial Intelligence',
      question: 'Who proposed the “Imitation Game” in 1950 to ask whether machines can think?',
      options: ['Alan Turing', 'Ada Lovelace', 'John von Neumann', 'Charles Babbage'],
      correctIndex: 0,
      hint: 'The famous test is named after him.',
      explanation: 'Alan Turing described the Imitation Game, now called the Turing Test, in his 1950 paper “Computing Machinery and Intelligence”.',
    },
    {
      subtopic: 'Internet',
      question: 'What does the “S” in HTTPS stand for?',
      options: ['Speed', 'Secure', 'Server', 'Standard'],
      correctIndex: 1,
      hint: 'Look for the padlock in your browser.',
      explanation: 'HTTPS is HTTP Secure — HTTP carried over an encrypted TLS connection.',
    },
    {
      subtopic: 'Cybersecurity',
      question: 'An email pretending to be your bank, asking you to “verify your password”, is an example of…',
      options: ['Phishing', 'Firewalling', 'Caching', 'Encryption'],
      correctIndex: 0,
      hint: 'It sounds like a sport involving bait.',
      explanation: 'Phishing tricks people into revealing credentials by impersonating a trusted sender.',
    },
    {
      subtopic: 'Digital Innovation',
      question: 'In binary, what is 1 + 1?',
      options: ['2', '11', '10', '0'],
      correctIndex: 2,
      hint: 'Binary only has the digits 0 and 1.',
      explanation: 'In base 2, one plus one is written 10 (one two and zero ones).',
    },
  ],
  science: [
    {
      subtopic: 'Space Exploration',
      question: 'Which planet in our solar system has the shortest day?',
      options: ['Mercury', 'Earth', 'Jupiter', 'Mars'],
      correctIndex: 2,
      hint: 'The biggest one spins the fastest.',
      explanation: 'Jupiter rotates once in about 10 hours, the shortest day of any planet.',
    },
    {
      subtopic: 'Scientific Discoveries',
      question: 'What gets wetter the more it dries?',
      options: ['A sponge', 'A towel', 'Rain', 'Soap'],
      correctIndex: 1,
      hint: 'You use it after a shower.',
      explanation: 'A towel absorbs water as it dries you, so it gets wetter.',
    },
    {
      subtopic: 'Inventions',
      question: 'Which scientist is credited with discovering penicillin in 1928?',
      options: ['Louis Pasteur', 'Alexander Fleming', 'Marie Curie', 'Edward Jenner'],
      correctIndex: 1,
      hint: 'He noticed mould killing bacteria in a petri dish.',
      explanation: 'Alexander Fleming observed in 1928 that Penicillium mould stopped bacterial growth.',
    },
    {
      subtopic: 'Space Exploration',
      question: 'What was the name of India’s mission that landed near the Moon’s south pole in 2023?',
      options: ['Mangalyaan', 'Chandrayaan-3', 'Aditya-L1', 'Gaganyaan'],
      correctIndex: 1,
      hint: '“Chandra” means moon.',
      explanation: 'Chandrayaan-3’s Vikram lander touched down near the lunar south pole on 23 August 2023.',
    },
    {
      subtopic: 'Scientific Discoveries',
      question: 'What is the most abundant gas in Earth’s atmosphere?',
      options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Argon'],
      correctIndex: 2,
      hint: 'It is not the one we breathe for energy.',
      explanation: 'Nitrogen makes up about 78% of the air; oxygen is about 21%.',
    },
    {
      subtopic: 'Future Tech',
      question: 'The more you take, the more you leave behind. What are they?',
      options: ['Photos', 'Footsteps', 'Breaths', 'Notes'],
      correctIndex: 1,
      hint: 'Think about walking on a beach.',
      explanation: 'Every step you take leaves another footstep behind you.',
    },
  ],
  general: [
    {
      subtopic: 'Geography',
      question: 'Which is the longest river in India?',
      options: ['Yamuna', 'Godavari', 'Ganga', 'Brahmaputra'],
      correctIndex: 2,
      hint: 'It flows past Varanasi.',
      explanation: 'The Ganga, about 2,500 km long, is the longest river flowing within India.',
    },
    {
      subtopic: 'World Records',
      question: 'What is the tallest building in the world (as of 2025)?',
      options: ['Shanghai Tower', 'Burj Khalifa', 'Merdeka 118', 'One World Trade Center'],
      correctIndex: 1,
      hint: 'It stands in Dubai.',
      explanation: 'The Burj Khalifa in Dubai is 828 m tall, the tallest building completed so far.',
    },
    {
      subtopic: 'History',
      question: 'What has a neck but no head, and wears a cap?',
      options: ['A bottle', 'A giraffe', 'A guitar', 'A pen'],
      correctIndex: 0,
      hint: 'You twist the cap off to drink.',
      explanation: 'A bottle has a narrow neck and a cap, but no head.',
    },
    {
      subtopic: 'Sports',
      question: 'How many players does a cricket team have on the field?',
      options: ['9', '10', '11', '12'],
      correctIndex: 2,
      hint: 'Same as a football team.',
      explanation: 'Each cricket side fields eleven players.',
    },
    {
      subtopic: 'Geography',
      question: 'Which ocean is the largest on Earth?',
      options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      correctIndex: 3,
      hint: 'Its name means “peaceful”.',
      explanation: 'The Pacific covers roughly a third of Earth’s surface.',
    },
    {
      subtopic: 'Famous Personalities',
      question: 'Who painted the Mona Lisa?',
      options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Vincent van Gogh'],
      correctIndex: 1,
      hint: 'He also sketched flying machines.',
      explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 1500s.',
    },
  ],
  society: [
    {
      subtopic: 'Human Behaviour',
      question: 'What can you break without ever touching it?',
      options: ['A record', 'A promise', 'The silence', 'All of these'],
      correctIndex: 3,
      hint: 'More than one answer fits.',
      explanation: 'You can break a promise, the silence, or a record without touching anything.',
    },
    {
      subtopic: 'Human Behaviour',
      question: 'The tendency to search for information that confirms what we already believe is called…',
      options: ['Confirmation bias', 'The placebo effect', 'Groupthink', 'Déjà vu'],
      correctIndex: 0,
      hint: 'It “confirms” your bias.',
      explanation: 'Confirmation bias is favouring information that supports existing beliefs.',
    },
    {
      subtopic: 'Culture',
      question: 'What belongs to you, but other people use it more than you do?',
      options: ['Your phone', 'Your name', 'Your money', 'Your time'],
      correctIndex: 1,
      hint: 'People call you by it.',
      explanation: 'Others say your name far more often than you do.',
    },
    {
      subtopic: 'Social Awareness',
      question: 'Which UN goal number is “Quality Education” among the 17 Sustainable Development Goals?',
      options: ['SDG 1', 'SDG 4', 'SDG 10', 'SDG 17'],
      correctIndex: 1,
      hint: 'It comes right after Good Health (SDG 3).',
      explanation: 'SDG 4 is Quality Education.',
    },
    {
      subtopic: 'Ethical Dilemmas',
      question: 'I am always in front of you but can never be seen. What am I?',
      options: ['The air', 'The future', 'Your nose', 'A shadow'],
      correctIndex: 1,
      hint: 'It hasn’t happened yet.',
      explanation: 'The future is always ahead of you, but you can never see it.',
    },
  ],
  politics: [
    {
      subtopic: 'Constitution',
      question: 'On which date did the Constitution of India come into effect?',
      options: ['15 August 1947', '26 November 1949', '26 January 1950', '2 October 1950'],
      correctIndex: 2,
      hint: 'It is celebrated as Republic Day.',
      explanation: 'The Constitution came into force on 26 January 1950, now Republic Day.',
    },
    {
      subtopic: 'Constitution',
      question: 'Who chaired the Drafting Committee of the Indian Constitution?',
      options: ['Jawaharlal Nehru', 'Dr B. R. Ambedkar', 'Sardar Patel', 'Dr Rajendra Prasad'],
      correctIndex: 1,
      hint: 'He is often called the architect of the Constitution.',
      explanation: 'Dr B. R. Ambedkar chaired the Drafting Committee.',
    },
    {
      subtopic: 'Elections',
      question: 'What is the minimum voting age in Indian national elections?',
      options: ['16', '18', '21', '25'],
      correctIndex: 1,
      hint: 'It was lowered from 21 in 1989.',
      explanation: 'The 61st Amendment (effective 1989) lowered the voting age from 21 to 18.',
    },
    {
      subtopic: 'International Relations',
      question: 'How many permanent members does the UN Security Council have?',
      options: ['3', '5', '10', '15'],
      correctIndex: 1,
      hint: 'They hold veto power.',
      explanation: 'China, France, Russia, the UK and the US are the five permanent members.',
    },
    {
      subtopic: 'Political Systems',
      question: 'How many houses does India’s Parliament have?',
      options: ['One', 'Two', 'Three', 'Four'],
      correctIndex: 1,
      hint: 'Lok Sabha and…?',
      explanation: 'Parliament has two houses: the Lok Sabha and the Rajya Sabha (plus the President).',
    },
  ],
};

// Merge the verified riddles from the MIND-MYSTERY sibling project (with sources), de-duplicated.
const SIBLING_CATEGORY: Record<string, RiddleCategoryId> = {
  'Politics and Governance': 'politics',
  Society: 'society',
  Technology: 'technology',
  'Innovation and Science': 'science',
  'General Knowledge': 'general',
};
for (const r of VERIFIED_SEED_RIDDLES) {
  const cat = SIBLING_CATEGORY[r.category];
  if (!cat || RIDDLE_BANK[cat].some((b) => b.question === r.question)) continue;
  RIDDLE_BANK[cat].push({
    subtopic: r.difficulty === 'Hard' ? 'Expert' : 'Verified',
    question: r.question,
    options: r.options,
    correctIndex: r.correctIndex,
    hint: r.hint,
    explanation: r.explanation,
  });
}
