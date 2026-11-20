import type { CandidateRecord, CategoryId, QuestionOption } from './types.ts';
import { MATCH_MULTIPLIER, MISMATCH_MULTIPLIER } from './candidateScorer.ts';
import { evaluateDynamicAttribute } from './deterministicPools.ts';

interface AttributeTemplate {
  question: string;
  optionLabels: Record<string, string>;
  allowedCategories?: CategoryId[];
}

const ATTRIBUTE_TEMPLATES: Record<string, AttributeTemplate> = {
  // Media & Movie
  genre: {
    question: 'Which genre feels closest?',
    optionLabels: {
      action: 'Action',
      sci_fi: 'Sci-Fi',
      drama: 'Drama',
      comedy: 'Comedy',
      thriller: 'Thriller',
      romance: 'Romance',
      fantasy: 'Fantasy',
      crime: 'Crime',
      horror: 'Horror',
      animation: 'Animation',
      romantic: 'Romantic',
      pop_dance: 'Pop / Dance',
      rock_anthem: 'Rock / Anthem',
      soulful_sad: 'Soulful / Sad',
      hiphop_rap: 'Hip-Hop / Rap',
      classical_folk: 'Classical / Folk',
      orchestral_theme: 'Theme / Score',
      romantic_melody: 'Romantic / Melody',
      rock_indie: 'Rock / Indie',
      classical_sufi: 'Classical / Sufi',
    },
  },
  tone: {
    question: 'What is the overall tone or mood?',
    optionLabels: {
      dark: 'Dark / Intense',
      emotional: 'Emotional / Heartfelt',
      fun: 'Fun / Lighthearted',
      epic: 'Grand / Epic',
    },
  },
  era: {
    question: 'Which era does it belong to?',
    optionLabels: {
      classic: 'Classic (Pre-1990)',
      '90s': '1990s',
      '2000s': '2000s',
      '2010s': '2010s',
      '2020s': '2020s',
    },
  },
  before_2010: {
    question: 'Was it released before 2010?',
    optionLabels: { yes: 'Yes (Before 2010)', no: 'No (2010 or later)' },
  },
  before_2015: {
    question: 'Was it released before 2015?',
    optionLabels: { yes: 'Yes (Before 2015)', no: 'No (2015 or later)' },
  },
  before_2020: {
    question: 'Was it released before 2020?',
    optionLabels: { yes: 'Yes (Before 2020)', no: 'No (2020 or later)' },
  },
  period_split: {
    question: 'Which release window fits best?',
    optionLabels: {
      pre_2000: 'Before 2000',
      '2000_2009': '2000 – 2009',
      '2010_2016': '2010 – 2016',
      '2017_plus': '2017 onwards',
    },
  },
  theme: {
    question: 'Which central theme drives the story?',
    optionLabels: {
      space_tech: 'Space / Tech',
      family_bond: 'Family Bond',
      revenge_justice: 'Revenge / Justice',
      love_story: 'Love Story',
      heist_crime: 'Heist / Crime',
      survival_war: 'Survival / War',
      superhero_power: 'Superpowers / Hero',
      coming_of_age: 'Coming of Age',
      mystery_twist: 'Mystery / Twist',
      historical_royal: 'History / Royalty',
      sports_underdog: 'Sports / Underdog',
      friendship_journey: 'Friendship / Journey',
    },
  },
  franchise: {
    question: 'Is it part of a franchise, sequel, or multi-part universe?',
    optionLabels: { yes: 'Yes', no: 'No (Standalone)' },
  },
  true_story: {
    question: 'Is it based on a true story or real-life person?',
    optionLabels: { yes: 'Yes', no: 'No (Fictional)' },
  },
  blockbuster: {
    question: 'Was it a massive mainstream blockbuster hit?',
    optionLabels: { yes: 'Yes, huge hit', no: 'Cult / Critical favourite' },
  },
  award_winner: {
    question: 'Did it win major critical awards (Oscar, National, Emmy, or Cannes)?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  lead_gender: {
    question: 'Who leads the main story?',
    optionLabels: { male: 'Male Lead', female: 'Female Lead', ensemble: 'Ensemble / Duo' },
  },
  mind_bending: {
    question: 'Is it famous for mind-bending twists or psychological puzzles?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  setting: {
    question: 'What kind of world or setting is it primarily placed in?',
    optionLabels: {
      urban_modern: 'Modern City',
      rural_smalltown: 'Small Town / Rural',
      historical_period: 'Historical Period',
      futuristic_fantasy: 'Sci-Fi / Fantasy World',
      city: 'Modern Metropolis',
      nature: 'Natural Landscape',
      historical: 'Historic Heritage',
      island: 'Island Getaway',
    },
  },
  music_iconic: {
    question: 'Is it widely famous for an iconic soundtrack or hit songs?',
    optionLabels: { yes: 'Yes', no: 'Not primarily' },
  },
  star_tag: {
    question: 'Which signature circle, star, or style fits best?',
    optionLabels: {
      shah_rukh: 'Shah Rukh Khan',
      aamir_hirani: 'Aamir / Hirani',
      salman: 'Salman Khan',
      ranbir: 'Ranbir Kapoor',
      hrithik_farhan: 'Hrithik / Farhan',
      classic_legend: 'Classic 60s–80s',
      new_wave: 'Modern Content Cinema',
      other_star: 'Other Star Cast',
      nolan: 'Christopher Nolan',
      marvel_dc: 'Marvel / DC',
      dicaprio: 'DiCaprio / Scorsese',
      spielberg_cameron: 'Spielberg / Cameron',
      classic_hollywood: 'Classic Hollywood',
      other_hollywood: 'Other Hollywood',
      rajamouli: 'S. S. Rajamouli',
      prabhas: 'Prabhas',
      allu_arjun: 'Allu Arjun',
      mahesh_ntr: 'Mahesh / Jr. NTR',
      other_tollywood: 'Other Tollywood',
      vijay: 'Vijay',
      rajinikanth: 'Rajinikanth',
      kamal_lokesh: 'Kamal / Mani / Lokesh',
      suriya_dhanush: 'Suriya / Dhanush / VJS',
      other_kollywood: 'Other Kollywood',
      mohanlal_mammootty: 'Mohanlal / Mammootty',
      fahadh: 'Fahadh Faasil',
      yash_rishab: 'Yash / Shetty Trio',
      other_ms: 'Other Malayalam / Kannada',
      bong_park: 'Bong / Park Auteur',
      kdrama_rom: 'K-Drama / Romance',
      zombie_survival: 'Survival / Thriller',
      other_korean: 'Other Korean',
      netflix_orig: 'Netflix Original',
      hbo_prestige: 'HBO Prestige',
      indian_ott: 'Indian Web Series',
      prestige_us: 'US / UK Hit Series',
      shonen_battle: 'Shonen Battle',
      seinen_psych: 'Dark / Psychological',
      ghibli_film: 'Anime Movie / Ghibli',
      other_anime: 'Comedy / Adventure',
    },
  },

  // Song
  mood: {
    question: 'What mood does this track evoke?',
    optionLabels: {
      uplifting: 'Happy / Uplifting',
      heartbreak: 'Emotional / Heartbreak',
      energetic: 'High-Energy / Hype',
      chill: 'Calm / Chill',
    },
  },
  tempo: {
    question: 'How fast is the tempo or beat?',
    optionLabels: { slow: 'Slow', medium: 'Mid-Tempo', fast: 'Fast / Upbeat' },
  },
  vocals: {
    question: 'Who performs the vocals?',
    optionLabels: {
      solo_male: 'Solo Male',
      solo_female: 'Solo Female',
      duet: 'Duet / Collab',
      group_band: 'Band / Group / Instrumental',
    },
  },
  origin: {
    question: 'Is it from a movie/series soundtrack or an independent release?',
    optionLabels: { film: 'Movie / Series OST', independent: 'Independent / Album' },
  },
  iconic_hook: {
    question: 'Is it known for a viral dance step, hook, or iconic melody?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },

  // Actor & Singer
  gender: {
    question: 'Are you thinking of a male, female, or group?',
    optionLabels: { male: 'Male', female: 'Female', group: 'Band / Group' },
  },
  primary_genre: {
    question: 'Which genre are they most famous for?',
    optionLabels: {
      action: 'Action / Mass',
      romance_drama: 'Romance / Drama',
      comedy: 'Comedy / Feel-Good',
      versatile_thriller: 'Thriller / Versatile',
    },
  },
  debut_before_2000: {
    question: 'Did their career debut before the year 2000?',
    optionLabels: { yes: 'Yes (Pre-2000)', no: 'No (2000 or later)' },
  },
  debut_before_2010: {
    question: 'Did they debut before 2010?',
    optionLabels: { yes: 'Yes (Before 2010)', no: 'No (2010 or later)' },
  },
  still_active: {
    question: 'Are they still actively releasing work today?',
    optionLabels: { yes: 'Yes, active', no: 'Retired / Late Legend' },
  },
  global_fame: {
    question: 'Are they widely recognized internationally beyond their home industry?',
    optionLabels: { yes: 'Yes, global name', no: 'Mainly regional star' },
  },
  directed_or_produced: {
    question: 'Have they also directed or produced major projects?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  franchise_star: {
    question: 'Are they strongly linked to a famous franchise or cinematic universe?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  singer_type: {
    question: 'Are they mainly a film playback singer or an independent artist?',
    optionLabels: { playback: 'Film / Playback', independent: 'Independent / Pop' },
  },
  format: {
    question: 'Is it a solo artist or a band/group?',
    optionLabels: { solo: 'Solo Artist', band: 'Band / Group' },
  },
  voice_type: {
    question: 'Which vocal style describes them best?',
    optionLabels: {
      soulful: 'Soulful / Soft',
      energetic: 'Powerhouse / High-Energy',
      classical: 'Classical / Trained',
      pop_smooth: 'Smooth Pop',
      rap_rhythmic: 'Rap / Rhythmic',
    },
  },
  multi_lingual: {
    question: 'Are they known for singing across multiple languages?',
    optionLabels: { yes: 'Yes', no: 'Mainly one language' },
  },

  // Sports Person
  country_group: {
    question: 'Which region do they represent?',
    optionLabels: {
      india: 'India',
      europe: 'Europe',
      americas: 'Americas',
      rest_of_world: 'Asia-Pacific / Africa',
    },
  },
  role: {
    question: 'What is their main playing role or style?',
    optionLabels: {
      attacker_batter: 'Batter / Forward / Scorer',
      defender_bowler: 'Bowler / Defender / Keeper',
      allrounder_midfield: 'All-Rounder / Midfielder',
      individual_solo: 'Individual Competitor',
    },
  },
  status: {
    question: 'Are they still actively competing or retired?',
    optionLabels: { active: 'Active', retired: 'Retired / Legend' },
  },
  world_champion: {
    question: 'Have they won a World Cup, World Championship, or Grand Slam title?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  peak_before_2015: {
    question: 'Was their career peak before 2015?',
    optionLabels: { yes: 'Yes (Before 2015)', no: 'No (2015 or later)' },
  },
  captain: {
    question: 'Are they widely famous for captaining their team?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  olympic_medalist: {
    question: 'Have they won an Olympic medal?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },

  // Number
  parity: {
    question: 'Is your number even or odd?',
    optionLabels: { even: 'Even', odd: 'Odd' },
  },
  is_prime: {
    question: 'Is your number a prime number?',
    optionLabels: { yes: 'Yes (Prime)', no: 'No' },
  },
  is_square: {
    question: 'Is it a perfect square (like 4, 9, 16, 25...)?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  mult_3: {
    question: 'Is your number divisible by 3?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  mult_5: {
    question: 'Is your number a multiple of 5?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  mult_7: {
    question: 'Is your number divisible by 7?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  digit_sum_even: {
    question: 'If you add its digits together, is the sum even?',
    optionLabels: { yes: 'Yes (Even sum)', no: 'No (Odd sum)' },
  },
  digit_sum_gt_9: {
    question: 'Is the sum of its digits greater than 9?',
    optionLabels: { yes: 'Yes (> 9)', no: 'No (9 or less)' },
  },

  // DOB
  half_of_year: {
    question: 'Does the birthday fall in the first half or second half of the year?',
    optionLabels: { jan_jun: 'Jan – Jun', jul_dec: 'Jul – Dec' },
  },
  quarter: {
    question: 'Which quarter of the year is the birthday in?',
    optionLabels: {
      Q1_Jan_Mar: 'Jan – Mar',
      Q2_Apr_Jun: 'Apr – Jun',
      Q3_Jul_Sep: 'Jul – Sep',
      Q4_Oct_Dec: 'Oct – Dec',
    },
  },
  month_in_quarter: {
    question: 'Within its 3-month quarter, is it the 1st, 2nd, or 3rd month?',
    optionLabels: {
      first_month: '1st (Jan/Apr/Jul/Oct)',
      second_month: '2nd (Feb/May/Aug/Nov)',
      third_month: '3rd (Mar/Jun/Sep/Dec)',
    },
  },
  season: {
    question: 'Which calendar season best matches this date?',
    optionLabels: {
      winter: 'Winter (Dec–Feb)',
      spring: 'Spring (Mar–May)',
      summer: 'Summer (Jun–Aug)',
      autumn: 'Autumn (Sep–Nov)',
      monsoon: 'Monsoon / Rainy',
      any_season: 'Year-Round',
    },
  },
  day_half: {
    question: 'Is the day of the month between 1–15 or 16–31?',
    optionLabels: { first_15: '1st – 15th', after_15: '16th – 31st' },
  },
  day_quarter: {
    question: 'Which date range holds the day of the month?',
    optionLabels: { '1_8': '1st – 8th', '9_15': '9th – 15th', '16_23': '16th – 23rd', '24_31': '24th – 31st' },
  },
  day_parity: {
    question: 'Is the day number even or odd?',
    optionLabels: { even: 'Even day', odd: 'Odd day' },
  },
  day_mod4: {
    question: 'What remainder does the day leave when divided by 4?',
    optionLabels: { r0: 'Divisible by 4', r1: 'Remainder 1', r2: 'Remainder 2', r3: 'Remainder 3' },
  },

  // Food
  cuisine: {
    question: 'Which cuisine style fits this dish best?',
    optionLabels: {
      indian: 'Indian',
      italian_western: 'Western / Italian',
      asian: 'Asian / Middle Eastern',
      global_dessert: 'Bakery / Dessert',
    },
  },
  diet: {
    question: 'Is it typically vegetarian or non-vegetarian?',
    optionLabels: { veg: 'Vegetarian', non_veg: 'Non-Vegetarian' },
  },
  taste: {
    question: 'What is its primary flavour profile?',
    optionLabels: { spicy: 'Spicy', sweet: 'Sweet', savoury: 'Savoury / Rich', tangy: 'Tangy / Zesty' },
  },
  meal_type: {
    question: 'When is it most commonly eaten?',
    optionLabels: { breakfast: 'Breakfast', main_course: 'Main Meal', snack: 'Snack / Chaat', dessert: 'Dessert' },
  },
  venue: {
    question: 'Where is it most famously enjoyed?',
    optionLabels: { street_food: 'Street Food', restaurant: 'Restaurant / Cafe', home_classic: 'Home Comfort' },
  },
  temp: {
    question: 'Is it usually served hot or cold?',
    optionLabels: { hot: 'Hot / Warm', cold: 'Cold / Chilled' },
  },
  handheld: {
    question: 'Can you easily eat it by hand without cutlery?',
    optionLabels: { yes: 'Yes', no: 'Needs spoon / fork' },
  },
  crispy: {
    question: 'Is crispiness or crunch a key part of its texture?',
    optionLabels: { yes: 'Yes, crispy', no: 'Soft / Creamy' },
  },

  // Place
  continent: {
    question: 'Which region of the world is it located in?',
    optionLabels: {
      asia_india: 'India',
      asia_other: 'Rest of Asia',
      europe: 'Europe',
      americas: 'Americas',
      africa_oceania: 'Africa / Oceania',
    },
  },
  terrain: {
    question: 'What landscape defines this destination?',
    optionLabels: {
      beach: 'Beach / Coast',
      mountain: 'Mountains / Hills',
      plains_urban: 'Urban / Plains',
      desert: 'Desert / Canyon',
    },
  },
  climate: {
    question: 'What climate is it best known for?',
    optionLabels: {
      tropical_warm: 'Warm / Tropical',
      temperate: 'Mild / Temperate',
      cold_alpine: 'Cold / Snowy',
      arid: 'Dry / Arid',
    },
  },
  budget: {
    question: 'What travel budget tier is it typically associated with?',
    optionLabels: { budget: 'Budget-Friendly', mid_range: 'Mid-Range', luxury: 'Luxury / High-Cost' },
  },
  coastal: {
    question: 'Does it sit directly along an ocean or sea coast?',
    optionLabels: { yes: 'Yes, coastal', no: 'No, inland' },
  },
  capital: {
    question: 'Is it a national capital city?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },

  // Colour
  temperature: {
    question: 'Does this colour feel warm, cool, or neutral?',
    optionLabels: { warm: 'Warm', cool: 'Cool', neutral: 'Neutral' },
  },
  brightness: {
    question: 'How light or dark is this shade?',
    optionLabels: { light: 'Light / Bright', medium: 'Medium', dark: 'Dark / Deep' },
  },
  family: {
    question: 'Which colour family does it belong to?',
    optionLabels: {
      red_pink: 'Red / Pink',
      orange_yellow: 'Orange / Yellow',
      green: 'Green',
      blue_cyan: 'Blue / Cyan',
      purple_violet: 'Purple / Violet',
      brown_mono: 'Brown / Monochrome',
    },
  },
  in_rainbow: {
    question: 'Is it one of the 7 classic rainbow colours (VIBGYOR)?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  primary_secondary: {
    question: 'Is it a primary, secondary, or nuanced shade?',
    optionLabels: {
      primary: 'Primary (R/Y/B)',
      secondary: 'Secondary (O/G/P)',
      tertiary_neutral: 'Nuanced / Neutral',
    },
  },
  nature_linked: {
    question: 'Is it strongly associated with everyday nature (sky, leaves, fire, sand)?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  vivid_or_muted: {
    question: 'Is it vivid and bold, or soft/pastel/muted?',
    optionLabels: { vivid: 'Vivid / Bold', pastel_muted: 'Soft / Muted' },
  },

  // Animal
  domestication: {
    question: 'Is it commonly domesticated or primarily a wild animal?',
    optionLabels: { domestic: 'Domestic / Farm', wild: 'Wild' },
  },
  habitat: {
    question: 'Where does it spend most of its life?',
    optionLabels: { land: 'Land', water: 'Water / Ocean', air: 'Air / Sky', land_water: 'Both Land & Water' },
  },
  diet_animal: {
    question: 'What is its natural diet?',
    optionLabels: { herbivore: 'Herbivore', carnivore: 'Carnivore', omnivore: 'Omnivore' },
  },
  size: {
    question: 'How large is it compared to a human?',
    optionLabels: { small: 'Smaller than a human', medium: 'Roughly human-sized', large: 'Much larger' },
  },
  flies: {
    question: 'Can this animal fly?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  swims: {
    question: 'Is it a natural swimmer?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  legs: {
    question: 'How many legs does it have?',
    optionLabels: { none: '0 (Fins/Slithers)', two: '2 Legs', four: '4 Legs', many: '6+ Legs/Arms' },
  },
  mammal: {
    question: 'Is it a mammal?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  dangerous: {
    question: 'Is it generally considered dangerous to humans in the wild?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },

  // Weather
  sky: {
    question: 'What does the sky look like during this weather?',
    optionLabels: {
      sunny_clear: 'Sunny / Clear',
      rainy: 'Rainy',
      cloudy_fog: 'Cloudy / Foggy',
      snowy_icy: 'Snowy / Icy',
      stormy: 'Stormy / Intense',
    },
  },
  precipitation: {
    question: 'Does rain, snow, or hail fall from the sky?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  windy: {
    question: 'Are strong winds or gusts a defining feature?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  dramatic: {
    question: 'Is it dramatic or extreme rather than calm?',
    optionLabels: { yes: 'Yes, intense', no: 'No, mild' },
  },
  time_of_day: {
    question: 'Is it linked to a specific time of day?',
    optionLabels: { daytime: 'Daytime', morning_night: 'Dawn / Evening', any_time: 'Any Time' },
  },

  // Alphabet
  half: {
    question: 'Is the letter in the first half (A–M) or second half (N–Z)?',
    optionLabels: { first_half: 'A – M (First Half)', second_half: 'N – Z (Second Half)' },
  },
  quarter_alphabet: {
    question: 'Which section of the alphabet contains your letter?',
    optionLabels: { A_F: 'A – F', G_M: 'G – M', N_S: 'N – S', T_Z: 'T – Z' },
  },
  sub_half: {
    question: 'Within its half of the alphabet, does it come earlier or later?',
    optionLabels: { early: 'Earlier (A–G / N–T)', late: 'Later (H–M / U–Z)' },
  },
  letter_type: {
    question: 'Is it a vowel or a consonant?',
    optionLabels: { vowel: 'Vowel (A, E, I, O, U)', consonant: 'Consonant' },
  },
  shape: {
    question: 'In uppercase, what strokes form the letter?',
    optionLabels: { curved: 'Curved Only (C,O,S,U)', straight: 'Straight Lines Only', mixed: 'Both Curved & Straight' },
  },
  symmetric_vertical: {
    question: 'Is the uppercase letter left-right mirror symmetric (like A, H, M, O)?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  symmetric_horizontal: {
    question: 'Is the uppercase letter top-bottom symmetric (like B, C, E, H)?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  position_parity: {
    question: 'Is its alphabetical position (A=1, B=2...) even or odd?',
    optionLabels: { even: 'Even (B, D, F...)', odd: 'Odd (A, C, E...)' },
  },
  mod3: {
    question: 'Check its position number (A=1, B=2, C=3...): what remainder when divided by 3?',
    optionLabels: { div3: 'Multiple of 3 (C,F,I...)', rem1: 'Remainder 1 (A,D,G...)', rem2: 'Remainder 2 (B,E,H...)' },
  },
  common_english: {
    question: 'Is it one of the 12 most frequent English letters (E,T,A,O,I,N,S,H,R,D,L,C)?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  name_alpha_half: {
    question: 'Does the name or title start with a letter from A–M or N–Z?',
    optionLabels: { a_m: 'A – M', n_z: 'N – Z' },
  },
  name_alpha_quarter: {
    question: 'Which letter range does the name or title begin with?',
    optionLabels: { a_f: 'A – F', g_m: 'G – M', n_s: 'N – S', t_z: 'T – Z' },
  },
  name_word_count: {
    question: 'Is the name or title a single word or multiple words?',
    optionLabels: { single: 'Single Word', multi: 'Multiple Words' },
  },

  // Word
  length_group: {
    question: 'How long is the word you are thinking of?',
    optionLabels: { short_4: 'Short (3–4 letters)', medium_5_6: 'Medium (5–6 letters)', long_7_plus: 'Long (7+ letters)' },
  },
  start_half: {
    question: 'Does the word start with a letter from A–M or N–Z?',
    optionLabels: { A_M: 'Starts with A – M', N_Z: 'Starts with N – Z' },
  },
  starts_vowel: {
    question: 'Does the word begin with a vowel?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
  semantic: {
    question: 'Which concept group does this word belong to?',
    optionLabels: { emotion: 'Emotion / Feeling', object: 'Physical Object', nature: 'Nature', abstract: 'Abstract Idea' },
  },
  part_of_speech: {
    question: 'What part of speech is it primarily?',
    optionLabels: { noun: 'Noun', verb: 'Verb (Action)', adjective: 'Adjective (Describing)' },
  },
  sentiment: {
    question: 'Does the word carry a positive, negative, or neutral feeling?',
    optionLabels: { positive: 'Positive', negative: 'Negative', neutral: 'Neutral' },
  },
  tangible: {
    question: 'Can you physically touch or hold what it represents?',
    optionLabels: { yes: 'Yes, tangible', no: 'No, intangible' },
  },
  has_double_letter: {
    question: 'Does the word contain any double consecutive letters (like ee, oo, tt)?',
    optionLabels: { yes: 'Yes', no: 'No' },
  },
};

function entropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p > 1e-12) h -= p * Math.log2(p);
  }
  return h;
}

export interface SelectedAttributeQuestion {
  attributeKey: string;
  fallbackQuestion: string;
  options: QuestionOption[];
  infoGain: number;
}

function getDynamicQuestionSpec(attributeKey: string): { question: string; options: QuestionOption[] } | null {
  if (attributeKey.startsWith('num_gt_')) {
    const threshold = Number(attributeKey.slice('num_gt_'.length));
    return {
      question: `Is your number greater than ${threshold}?`,
      options: [
        { value: 'yes', label: `Yes (${threshold + 1}+)` },
        { value: 'no', label: `No (${threshold} or less)` },
      ],
    };
  }
  if (attributeKey.startsWith('dob_day_gt_')) {
    const threshold = Number(attributeKey.slice('dob_day_gt_'.length));
    return {
      question: `Is the birthday after the ${threshold}${ordinalSuffix(threshold)} of the month?`,
      options: [
        { value: 'yes', label: `Yes (${threshold + 1}–31)` },
        { value: 'no', label: `No (1–${threshold})` },
      ],
    };
  }
  if (attributeKey.startsWith('dob_month_gt_')) {
    const threshold = Number(attributeKey.slice('dob_month_gt_'.length));
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return {
      question: `Is the birthday after ${monthNames[threshold] || `month ${threshold}`}?`,
      options: [
        { value: 'yes', label: `Yes (After ${monthNames[threshold]})` },
        { value: 'no', label: `No (${monthNames[threshold]} or earlier)` },
      ],
    };
  }
  if (attributeKey.startsWith('year_gt_')) {
    const threshold = Number(attributeKey.slice('year_gt_'.length));
    return {
      question: `Was the release or breakthrough year after ${threshold}?`,
      options: [
        { value: 'yes', label: `After ${threshold}` },
        { value: 'no', label: `${threshold} or earlier` },
      ],
    };
  }
  return null;
}

function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  if (n % 10 === 1) return 'st';
  if (n % 10 === 2) return 'nd';
  if (n % 10 === 3) return 'rd';
  return 'th';
}

function computeExpectedInfoGain(
  candidates: CandidateRecord[],
  scores: Record<string, number>,
  attributeKey: string,
  allowedValues: string[]
): number {
  const baseProbs = candidates.map((c) => scores[c.id] ?? 0);
  const currentH = entropy(baseProbs);

  // Compute mass for each allowed option
  const valueMass: Record<string, number> = {};
  for (const v of allowedValues) valueMass[v] = 0;

  for (const c of candidates) {
    const val = evaluateDynamicAttribute(c, attributeKey);
    const p = scores[c.id] ?? 0;
    if (val !== null && valueMass[val] !== undefined) {
      valueMass[val] += p;
    }
  }

  let expectedPosteriorH = 0;
  let totalOptionMass = 0;
  for (const v of allowedValues) totalOptionMass += valueMass[v];
  if (totalOptionMass <= 1e-9) return 0;

  for (const v of allowedValues) {
    const pv = valueMass[v] / totalOptionMass;
    if (pv <= 1e-9) continue;
    const posterior: number[] = [];
    let sum = 0;
    for (const c of candidates) {
      const p = scores[c.id] ?? 0;
      const val = evaluateDynamicAttribute(c, attributeKey);
      const mult = val === v ? MATCH_MULTIPLIER : MISMATCH_MULTIPLIER;
      const np = p * mult;
      posterior.push(np);
      sum += np;
    }
    if (sum > 0) {
      for (let i = 0; i < posterior.length; i++) posterior[i] /= sum;
      expectedPosteriorH += pv * entropy(posterior);
    }
  }

  // Slight penalty for 4+ options compared to crisp binary/3-way splits when IG is close
  const complexityPenalty = allowedValues.length > 4 ? 0.82 : 1.0;
  return Math.max(0, (currentH - expectedPosteriorH) * complexityPenalty);
}

export function selectNextBestQuestion(params: {
  category: CategoryId;
  candidates: CandidateRecord[];
  scores: Record<string, number>;
  askedAttributes: string[];
  questionIndex: number;
}): SelectedAttributeQuestion | null {
  const { category, candidates, scores, askedAttributes } = params;
  const askedSet = new Set(askedAttributes);

  // Find active plausible candidates to ensure we never ask something all remaining candidates answer identically
  let topScore = 0;
  for (const c of candidates) {
    const s = scores[c.id] ?? 0;
    if (s > topScore) topScore = s;
  }
  const activePool = candidates.filter((c) => (scores[c.id] ?? 0) >= topScore * 0.06);
  if (activePool.length <= 1) {
    // Even if 1 strong leader, we might still be below 7 questions — check wider pool
  }
  const checkPool = activePool.length >= 2 ? activePool : candidates;

  // Gather candidate attribute keys
  const attributeKeys = new Set<string>();
  const skipMetaKeys = new Set(['keywords', 'hex', 'num_value', 'month_num', 'day_num', 'doy']);

  for (const c of candidates) {
    for (const k of Object.keys(c.attributes)) {
      if (!skipMetaKeys.has(k) && !askedSet.has(k)) {
        attributeKeys.add(k);
      }
    }
  }

  // Add dynamic binary-halving split for Number category!
  if (category === 'number') {
    const sorted = [...candidates]
      .map((c) => ({ num: Number(c.attributes.num_value), score: scores[c.id] ?? 0 }))
      .sort((a, b) => a.num - b.num);
    let cum = 0;
    let medianNum = sorted[Math.floor(sorted.length / 2)]?.num ?? 50;
    for (const item of sorted) {
      cum += item.score;
      if (cum >= 0.5) {
        medianNum = item.num;
        break;
      }
    }
    const candidatesMid = [medianNum, medianNum - 1, Math.floor(medianNum / 2)];
    for (const mid of candidatesMid) {
      if (mid >= 1) {
        const key = `num_gt_${mid}`;
        if (!askedSet.has(key)) attributeKeys.add(key);
      }
    }
  }

  // Add dynamic binary-halving splits for Date of Birth!
  if (category === 'dob') {
    const activeMonths = new Set(checkPool.map((c) => Number(c.attributes.month_num)));
    const activeDays = new Set(checkPool.map((c) => Number(c.attributes.day_num)));

    if (activeMonths.size > 1) {
      const sortedM = Array.from(activeMonths).sort((a, b) => a - b);
      const midM = sortedM[Math.floor((sortedM.length - 1) / 2)];
      const mKey = `dob_month_gt_${midM}`;
      if (!askedSet.has(mKey)) attributeKeys.add(mKey);
    }
    if (activeDays.size > 1) {
      const sortedD = Array.from(activeDays).sort((a, b) => a - b);
      const midD = sortedD[Math.floor((sortedD.length - 1) / 2)];
      const dKey = `dob_day_gt_${midD}`;
      if (!askedSet.has(dKey)) attributeKeys.add(dKey);
    }
  }

  // Dynamic release/debut year narrowing for media & sports pools
  if (category === 'movie' || category === 'song' || category === 'actor' || category === 'singer' || category === 'sports_person') {
    const activeYears = Array.from(
      new Set(checkPool.map((c) => c.releaseYear).filter((y): y is number => typeof y === 'number'))
    ).sort((a, b) => a - b);
    if (activeYears.length >= 2) {
      const midYear = activeYears[Math.floor((activeYears.length - 1) / 2)];
      const yKey = `year_gt_${midYear}`;
      if (!askedSet.has(yKey)) attributeKeys.add(yKey);
    }
  }

  // Universal name-based tie-breakers for non-numeric/non-calendar/non-letter pools
  if (category !== 'number' && category !== 'dob' && category !== 'alphabet') {
    for (const key of ['name_alpha_half', 'name_alpha_quarter', 'name_word_count']) {
      if (key === 'name_word_count' && category === 'word') continue;
      if (!askedSet.has(key)) attributeKeys.add(key);
    }
  }

  let best: SelectedAttributeQuestion | null = null;

  for (const attrKey of attributeKeys) {
    // Collect distinct values in active pool
    const activeValueMass: Record<string, number> = {};
    for (const c of checkPool) {
      const val = evaluateDynamicAttribute(c, attrKey);
      if (val !== null) {
        activeValueMass[val] = (activeValueMass[val] ?? 0) + (scores[c.id] ?? 0);
      }
    }

    const distinctActiveVals = Object.keys(activeValueMass);
    if (distinctActiveVals.length < 2) continue; // Never ask something all remaining candidates answer identically

    // Pick top 2-4 option values by probability mass (never overwhelm user with >4 buttons)
    const sortedVals = distinctActiveVals.sort((a, b) => (activeValueMass[b] ?? 0) - (activeValueMass[a] ?? 0));
    const chosenVals = sortedVals.slice(0, 4);

    // Ensure those 2-4 options cover at least 75% of current probability mass; otherwise skip overly fragmented attribute
    const coveredMass = chosenVals.reduce((acc, v) => acc + (activeValueMass[v] ?? 0), 0);
    const totalActiveMass = distinctActiveVals.reduce((acc, v) => acc + (activeValueMass[v] ?? 0), 0);
    if (totalActiveMass > 0 && coveredMass / totalActiveMass < 0.72) continue;

    let ig = computeExpectedInfoGain(candidates, scores, attrKey, chosenVals);

    // Keep fun domain questions first in early turns; save name-initial tie-breakers for mid/late narrowing
    if (
      params.questionIndex <= 4 &&
      (attrKey === 'name_alpha_half' || attrKey === 'name_alpha_quarter' || attrKey === 'name_word_count')
    ) {
      ig *= 0.65;
    }

    // Slight priority boost for timeline questions early in media categories (as specified in prompt!)
    if (
      params.questionIndex <= 4 &&
      (attrKey === 'before_2010' || attrKey === 'period_split' || attrKey === 'era' || attrKey === 'before_2015' || attrKey === 'debut_before_2010')
    ) {
      ig *= 1.12;
    }

    // For Number, prioritize clean range halving early while weaving in fun properties
    if (category === 'number' && attrKey.startsWith('num_gt_')) {
      ig *= 1.08;
    }

    if (!best || ig > best.infoGain) {
      const dynamicSpec = getDynamicQuestionSpec(attrKey);
      if (dynamicSpec) {
        best = {
          attributeKey: attrKey,
          fallbackQuestion: dynamicSpec.question,
          options: dynamicSpec.options,
          infoGain: ig,
        };
      } else {
        const lookupKey =
          attrKey === 'diet' && category === 'animal'
            ? 'diet_animal'
            : attrKey === 'quarter' && category === 'alphabet'
              ? 'quarter_alphabet'
              : attrKey;
        const tpl = ATTRIBUTE_TEMPLATES[lookupKey];
        const question = tpl?.question ?? `Which ${attrKey.replace(/_/g, ' ')} matches best?`;
        const options: QuestionOption[] = chosenVals.map((v) => ({
          value: v,
          label: tpl?.optionLabels[v] ?? v.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
        }));
        best = {
          attributeKey: attrKey,
          fallbackQuestion: question,
          options,
          infoGain: ig,
        };
      }
    }
  }

  return best;
}

