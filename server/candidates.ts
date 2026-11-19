import { PredictionCategoryId } from '../src/types.ts';

export interface CandidateSeed {
  name: string;
  traits: string;
}

export const CATEGORY_STRATEGIES: Record<PredictionCategoryId, string> = {
  movie:
    'Ask strategically across: (1) Film industry (Bollywood, Hollywood, South Indian, World cinema), (2) Primary genre (Action, Romance, Sci-Fi, Thriller, Comedy, Drama), (3) Release period (before 2010, 2010–2019, 2020+), (4) Famous lead actor/director, (5) Based on true story vs pure fiction, (6) Emotional/inspirational vs adrenaline/suspense tone, (7) Standalone vs franchise/sequel, (8) Blockbuster popularity, (9) A specific storyline or setting clue.',
  number:
    'Narrow down the user’s integer mathematically within the target range: ask about upper/lower half of remaining range, odd vs even, single/double/triple digits, divisibility (3, 5, 10), prime vs composite, repeating/lucky cultural significance (like 7, 11, 42, 69, 99), and final digit clues.',
  song:
    'Ask strategically across: (1) Language (Hindi/Bollywood, English, Punjabi, K-Pop/Korean, Spanish, Instrumental), (2) Genre (Pop, Romantic Ballad, Hip-Hop/Rap, Rock, Indie, EDM), (3) Release era (pre-2000s, 2000s, 2010s, 2020s), (4) Mood (upbeat/party, soulful/sad, motivational, chill), (5) Solo artist vs duet/band, (6) Specific singer/band clue or chorus theme.',
  actor:
    'Ask strategically across: (1) Primary film industry (Bollywood, Hollywood, South Indian, British/Global), (2) Generation/era (veteran legend, 90s/2000s star, modern generation), (3) Signature genres (action, drama, comedy, sci-fi/superhero), (4) Known for dramatic transformations/method acting vs mass charisma, (5) Major awards (Oscar, National Award) or iconic franchise role, (6) Distinctive trait or co-star.',
  sports_person:
    'Ask strategically across: (1) Sport (Cricket, Football/Soccer, Tennis, Basketball, Athletics, Badminton, F1, Chess), (2) Nationality/continent, (3) Currently active vs retired legend, (4) Playing role/position (e.g., batsman/bowler, forward/goalkeeper), (5) World Cup/Olympic/Grand Slam/Ballon d’Or achievements, (6) Jersey number or iconic nickname clue.',
  singer:
    'Ask strategically across: (1) Language/region (Hindi/Bollywood playback, English Western, Punjabi, Korean/Global), (2) Genre (Romantic/Soulful, Pop, Rap/Hip-Hop, Rock, Classical/Sufi), (3) Male vs Female vs Band/Duo, (4) Voice texture (deep/raspy, high/melodic, powerhouse belter, soft/whispery), (5) Era of peak fame, (6) Signature hit or award.',
  dob:
    'Ask strategically across: (1) Birth season (Spring, Summer, Autumn, Winter) or quarter of year, (2) Specific month elimination (group of 3 months then exact month), (3) Half of month (1st–15th vs 16th–31st), (4) Odd vs even day number, (5) Generation/decade or zodiac element, (6) Single-digit vs two-digit day. IMPORTANT: Explicitly acknowledge in honestyNote if the exact day/year cannot be uniquely known from broad clues alone.',
  food:
    'Ask strategically across: (1) Cuisine (Indian, Italian, Chinese/East Asian, Mexican, American, Middle Eastern, Dessert/Bakery), (2) Dietary category (Vegetarian, Non-Vegetarian, Vegan/Eggless), (3) Flavour profile (Spicy/Savory, Creamy/Cheesy, Sweet, Tangy), (4) Meal format (Street food/snack, Main course, Rice/Noodle dish, Bread/Pizza/Burger, Sweet dessert), (5) Served hot vs cold, (6) Key signature ingredient.',
  place:
    'Ask strategically across: (1) Geographic scope (India vs International), (2) Environment (Coastal beach, High mountains, Bustling metropolis, Historic heritage city, Quiet countryside/island), (3) Climate (Tropical warm, Cool/snowy, Temperate), (4) Famous for food/nightlife, nature/trekking, spirituality, or iconic monument, (5) Specific continent/region, (6) One distinguishing landmark or experience.',
  colour:
    'Ask strategically across: (1) Temperature (Warm: red/orange/yellow vs Cool: blue/green/violet vs Neutral: black/white/grey/beige), (2) Brightness/Depth (Deep dark/rich, Vivid bright, Soft pastel, Metallic), (3) Natural association (Ocean/sky, Fire/sunset, Forest/earth, Flowers/royalty), (4) Emotional mood (Calm/peaceful, Bold/energetic, Mysterious/elegant, Cheerful), (5) Primary vs secondary/blend shade.',
  animal:
    'Ask strategically across: (1) Wild vs Domestic/Pet, (2) Habitat (Land forest/savanna, Ocean/water, Sky/aerial, Home/farm), (3) Size (Small, Medium, Large/giant), (4) Diet (Carnivore, Herbivore, Omnivore), (5) Defining trait (Speed, Intelligence, Loyalty, Flight, Venom/camouflage), (6) Specific continent or taxonomic group (feline, canine, bird, marine mammal, reptile).',
  weather:
    'Ask strategically across: (1) Temperature preference (Cold/chilly, Cool/breezy, Warm, Hot), (2) Precipitation (Dry clear sky, Light drizzle, Heavy rain/thunderstorm, Snowfall, Fog/mist), (3) Time of day pairing (Crisp morning, Golden afternoon, Cozy evening/night), (4) Season association (Monsoon, Winter, Spring, Autumn, Summer), (5) Preferred indoor vs outdoor activity in this weather.',
  alphabet:
    'Eliminate A–Z systematically: (1) First half A–M vs second half N–Z, (2) Vowel (A, E, I, O, U) vs Consonant, (3) Quadrant split (A–F, G–M, N–S, T–Z), (4) Visual geometry (straight lines only like A/E/F/H/I/K/L/M/N/T/V/W/X/Y/Z vs curved lines like B/C/D/G/J/O/P/Q/R/S/U), (5) Symmetric vs asymmetric shape, (6) Frequency in common words or initials.',
  word:
    'Ask strategically across: (1) Word length (short 1–4 letters, medium 5–7, long 8+), (2) Emotional tone (Romantic/warm, Philosophical/deep, Energetic/bold, Peaceful/calm, Aesthetic/poetic), (3) Part of speech (Noun/concept, Verb/action, Adjective), (4) Starting letter zone (A–H, I–P, Q–Z), (5) Concrete object/nature vs abstract feeling/virtue, (6) Language origin or everyday vs rare vocabulary.',
};

export const CANDIDATE_SEEDS: Record<PredictionCategoryId, CandidateSeed[]> = {
  movie: [
    { name: '3 Idiots', traits: 'Bollywood, comedy-drama, 2009, Aamir Khan, emotional, inspirational, standalone' },
    { name: 'Interstellar', traits: 'Hollywood, sci-fi drama, 2014, Christopher Nolan, Matthew McConaughey, emotional, space' },
    { name: 'Inception', traits: 'Hollywood, sci-fi thriller, 2010, Leonardo DiCaprio, Nolan, mind-bending' },
    { name: 'Avengers: Endgame', traits: 'Hollywood, superhero action, 2019, Marvel franchise, blockbuster, ensemble' },
    { name: 'DDLJ (Dilwale Dulhania Le Jayenge)', traits: 'Bollywood, romance, 1995, Shah Rukh Khan, classic, emotional' },
    { name: 'Dangal', traits: 'Bollywood, sports drama, 2016, true story, Aamir Khan, inspirational' },
    { name: 'The Dark Knight', traits: 'Hollywood, action crime thriller, 2008, Batman franchise, Heath Ledger, Nolan' },
    { name: 'RRR', traits: 'South Indian Telugu, action period drama, 2022, blockbuster, friendship, Oscar song' },
    { name: 'Baahubali 2: The Conclusion', traits: 'South Indian, epic action, 2017, franchise, Prabhas, blockbuster' },
    { name: 'Titanic', traits: 'Hollywood, romance tragedy, 1997, true event, Leonardo DiCaprio, emotional' },
    { name: 'Zindagi Na Milegi Dobara', traits: 'Bollywood, drama comedy, 2011, road trip, friendship, Hrithik Roshan' },
    { name: 'Parasite', traits: 'Korean world cinema, dark thriller satire, 2019, Oscar winner, Bong Joon-ho' },
    { name: 'Yeh Jawaani Hai Deewani', traits: 'Bollywood, romance comedy drama, 2013, Ranbir Kapoor, Deepika Padukone' },
    { name: 'Spider-Man: No Way Home', traits: 'Hollywood, superhero action, 2021, Marvel franchise, multiverse' },
    { name: 'Sholay', traits: 'Bollywood, classic action adventure, 1975, Amitabh Bachchan, Dharmendra' },
    { name: 'The Shawshank Redemption', traits: 'Hollywood, prison drama, 1994, hope, Tim Robbins, Morgan Freeman' },
    { name: '12th Fail', traits: 'Bollywood, biographical drama, 2023, true story, Vikrant Massey, inspirational' },
    { name: 'Oppenheimer', traits: 'Hollywood, biographical thriller, 2023, true story, Nolan, Cillian Murphy' },
    { name: 'Avatar', traits: 'Hollywood, sci-fi adventure, 2009, James Cameron, franchise, Pandora' },
    { name: 'Drishyam', traits: 'Bollywood/Malayalam, crime suspense thriller, family, plot twist' },
    { name: 'Harry Potter and the Prisoner of Azkaban', traits: 'Hollywood, fantasy franchise, 2004, magic, Hogwarts' },
    { name: 'Hera Pheri', traits: 'Bollywood, cult comedy, 2000, Akshay Kumar, Paresh Rawal' },
  ],
  number: [],
  song: [
    { name: 'Tum Hi Ho', traits: 'Hindi Bollywood, romantic ballad, 2013, Arijit Singh, soulful, emotional' },
    { name: 'Blinding Lights', traits: 'English, synth-pop, 2019, The Weeknd, upbeat, retro 80s vibe' },
    { name: 'Shape of You', traits: 'English, pop dancehall, 2017, Ed Sheeran, upbeat, global hit' },
    { name: 'Kesariya', traits: 'Hindi Bollywood, romantic pop, 2022, Arijit Singh, Brahmāstra' },
    { name: 'Bohemian Rhapsody', traits: 'English, classic rock, 1975, Queen, dramatic, iconic band' },
    { name: 'Believer', traits: 'English, pop rock, 2017, Imagine Dragons, motivational, energetic' },
    { name: 'Kal Ho Naa Ho', traits: 'Hindi Bollywood, emotional ballad, 2003, Sonu Nigam, Shah Rukh Khan' },
    { name: 'Chaiyya Chaiyya', traits: 'Hindi Bollywood, energetic sufi dance, 1998, Sukhwinder Singh, A.R. Rahman' },
    { name: 'Perfect', traits: 'English, romantic ballad, 2017, Ed Sheeran, slow acoustic' },
    { name: 'Dynamite', traits: 'English/K-Pop, disco-pop, 2020, BTS, upbeat, group' },
    { name: 'Kun Faya Kun', traits: 'Hindi Bollywood, sufi spiritual, 2011, A.R. Rahman, Mohit Chauhan, calming' },
    { name: 'Levitating', traits: 'English, disco-pop, 2020, Dua Lipa, upbeat, dance' },
    { name: 'Apna Bana Le', traits: 'Hindi Bollywood, romantic indie-pop, 2022, Arijit Singh' },
    { name: 'Despacito', traits: 'Spanish, Latin pop reggaeton, 2017, Luis Fonsi, upbeat' },
    { name: 'Hotel California', traits: 'English, classic rock, 1976, Eagles, guitar solo' },
    { name: 'Pasoori', traits: 'Punjabi/Urdu, Coke Studio fusion, 2022, Ali Sethi, Shae Gill, duet' },
  ],
  actor: [
    { name: 'Shah Rukh Khan', traits: 'Bollywood, 90s-present, romance & drama, King of Bollywood, charisma' },
    { name: 'Leonardo DiCaprio', traits: 'Hollywood, 90s-present, drama/thriller, Oscar winner, Titanic/Inception' },
    { name: 'Robert Downey Jr.', traits: 'Hollywood, superhero & drama, Iron Man, Oscar winner Oppenheimer' },
    { name: 'Aamir Khan', traits: 'Bollywood, perfectionist, social drama/comedy, 3 Idiots/Dangal' },
    { name: 'Tom Cruise', traits: 'Hollywood, action stunts, Mission Impossible/Top Gun, blockbuster' },
    { name: 'Amitabh Bachchan', traits: 'Bollywood, veteran legend, 70s-present, deep voice, Sholay/Piku' },
    { name: 'Keanu Reeves', traits: 'Hollywood, action sci-fi, John Wick/Matrix, humble persona' },
    { name: 'Allu Arjun', traits: 'South Indian Telugu, stylish action dance, Pushpa, National Award' },
    { name: 'Prabhas', traits: 'South Indian pan-India, Baahubali, Kalki, action epic' },
    { name: 'Ranbir Kapoor', traits: 'Bollywood, modern generation, Rockstar/Barfi/Animal, versatile' },
    { name: 'Cillian Murphy', traits: 'Hollywood/Irish, intense drama, Peaky Blinders, Oppenheimer Oscar' },
    { name: 'Hrithik Roshan', traits: 'Bollywood, action/dance, ZNMD/War/Krrish' },
    { name: 'Deepika Padukone', traits: 'Bollywood female lead, Padmaavat/Piku/Pathaan' },
    { name: 'Scarlett Johansson', traits: 'Hollywood female lead, Black Widow/Marriage Story' },
    { name: 'Rajinikanth', traits: 'South Indian Tamil legend, mass action, iconic style' },
    { name: 'Irrfan Khan', traits: 'Bollywood/Hollywood, critically acclaimed natural acting, Lunchbox/Life of Pi' },
  ],
  sports_person: [
    { name: 'Virat Kohli', traits: 'Cricket, India, active, batsman, former captain, #18, chase master' },
    { name: 'MS Dhoni', traits: 'Cricket, India, retired international, wicketkeeper-captain, #7, calm finisher' },
    { name: 'Sachin Tendulkar', traits: 'Cricket, India, retired legend, 100 centuries, God of Cricket, #10' },
    { name: 'Lionel Messi', traits: 'Football, Argentina, active, forward, 2022 World Cup, 8 Ballon d’Or, #10' },
    { name: 'Cristiano Ronaldo', traits: 'Football, Portugal, active, forward, #7, SIUUU, 5 Ballon d’Or' },
    { name: 'Rohit Sharma', traits: 'Cricket, India, captain, Hitman, opener, #45' },
    { name: 'Neeraj Chopra', traits: 'Athletics javelin throw, India, Olympic gold & silver medalist' },
    { name: 'Roger Federer', traits: 'Tennis, Switzerland, retired legend, 20 Grand Slams, graceful' },
    { name: 'Novak Djokovic', traits: 'Tennis, Serbia, active, 24 Grand Slams, Olympic gold' },
    { name: 'LeBron James', traits: 'Basketball, USA, active NBA legend, 4 titles, all-time top scorer' },
    { name: 'Michael Jordan', traits: 'Basketball, USA, retired icon, Chicago Bulls #23, 6 NBA rings' },
    { name: 'Usain Bolt', traits: 'Athletics sprinting, Jamaica, retired, 100m/200m world record, 8 Olympic golds' },
    { name: 'PV Sindhu', traits: 'Badminton, India, active, dual Olympic medalist' },
    { name: 'Max Verstappen', traits: 'Formula 1 racing, Netherlands, active multi-time world champion, Red Bull' },
    { name: 'Magnus Carlsen', traits: 'Chess, Norway, active, 5-time World Chess Champion' },
    { name: 'Jasprit Bumrah', traits: 'Cricket, India, active fast bowler, yorkers, T20 World Cup' },
  ],
  singer: [
    { name: 'Arijit Singh', traits: 'Hindi Bollywood playback, male, soulful romantic, modern era' },
    { name: 'Shreya Ghoshal', traits: 'Hindi & regional Indian, female, classical melodic, multiple National Awards' },
    { name: 'Taylor Swift', traits: 'English, female, pop/country songwriter, Eras Tour, global icon' },
    { name: 'The Weeknd', traits: 'English, male, R&B synth-pop, falsetto, Blinding Lights' },
    { name: 'Lata Mangeshkar', traits: 'Hindi Bollywood, female veteran legend, Nightingale of India' },
    { name: 'Kishore Kumar', traits: 'Hindi Bollywood, male classic legend, versatile, yodeling' },
    { name: 'Sonu Nigam', traits: 'Hindi Bollywood, male, melodic high range, 90s-present' },
    { name: 'A.R. Rahman', traits: 'Indian composer-singer, Oscar/Grammy winner, Sufi & fusion' },
    { name: 'Ed Sheeran', traits: 'English British, male, acoustic pop, singer-songwriter' },
    { name: 'Billie Eilish', traits: 'English, female, alt-pop, soft whispery vocals, Grammy/Oscar' },
    { name: 'Diljit Dosanjh', traits: 'Punjabi & Hindi, male, upbeat pop/bhangra, Coachella' },
    { name: 'Freddie Mercury', traits: 'English, male rock legend, Queen frontman, 4-octave powerhouse' },
    { name: 'Atif Aslam', traits: 'Hindi/Urdu, male, rock-romantic, distinct raspy high notes' },
    { name: 'Sunidhi Chauhan', traits: 'Hindi Bollywood, female, powerhouse energetic & versatile' },
    { name: 'Jungkook', traits: 'Korean/English, male, K-Pop BTS vocalist, pop' },
    { name: 'Adele', traits: 'English British, female, deep soulful ballad powerhouse' },
  ],
  dob: [],
  food: [
    { name: 'Pizza', traits: 'Italian, baked bread with cheese & toppings, veg or non-veg, savory hot' },
    { name: 'Biryani', traits: 'Indian, spiced aromatic rice dish, veg or chicken/mutton, main course' },
    { name: 'Butter Chicken & Naan', traits: 'North Indian, rich creamy tomato curry, non-veg, main course' },
    { name: 'Masala Dosa', traits: 'South Indian, crispy fermented crepe, vegetarian, breakfast/snack' },
    { name: 'Pani Puri / Golgappa', traits: 'Indian street food, crispy hollow shell, spicy tangy water, veg snack' },
    { name: 'Pasta (Alfredo / Arrabbiata)', traits: 'Italian, noodles in creamy or tomato sauce, main course' },
    { name: 'Sushi', traits: 'Japanese, vinegared rice with seafood or veg, served cold/room temp' },
    { name: 'Burger & Fries', traits: 'American fast food, patty bun, savory handheld' },
    { name: 'Momos / Dumplings', traits: 'Himalayan/Asian street food, steamed/fried stuffed dough, spicy chutney' },
    { name: 'Chole Bhature', traits: 'North Indian, spicy chickpea curry with fried bread, vegetarian' },
    { name: 'Tacos', traits: 'Mexican, folded tortilla with savoury fillings, tangy salsa' },
    { name: 'Chocolate Ice Cream / Brownie', traits: 'Dessert, sweet, chocolate, cold or warm indulgence' },
    { name: 'Gulab Jamun', traits: 'Indian dessert, sweet fried milk dumplings in rose syrup, warm' },
    { name: 'Ramen', traits: 'Japanese, rich broth noodle soup, savory hot bowl' },
    { name: 'Paneer Tikka', traits: 'North Indian, grilled spiced cottage cheese, vegetarian appetizer' },
    { name: 'Pav Bhaji', traits: 'Mumbai street food, spiced mashed vegetable curry with buttered buns' },
  ],
  place: [
    { name: 'Paris', traits: 'France, Europe, romantic capital city, Eiffel Tower, art & cafes' },
    { name: 'Switzerland (Swiss Alps)', traits: 'Europe, snowy mountains, lakes, scenic trains, cool climate' },
    { name: 'Tokyo', traits: 'Japan, Asia, futuristic metropolis, anime, food, cherry blossoms' },
    { name: 'Goa', traits: 'India, coastal beaches, tropical warm, laid-back nightlife' },
    { name: 'Manali / Ladakh', traits: 'India Himalayas, snow peaks, mountain adventure, road trips' },
    { name: 'New York City', traits: 'USA, North America, iconic skyline, Times Square, urban energy' },
    { name: 'Bali', traits: 'Indonesia, tropical island, beaches, temples, lush greenery' },
    { name: 'Maldives', traits: 'Indian Ocean, luxury coral islands, turquoise ocean, overwater villas' },
    { name: 'London', traits: 'UK, Europe, historic metropolis, Big Ben, Thames, museums' },
    { name: 'Dubai', traits: 'UAE, Middle East, desert luxury, Burj Khalifa, modern skyscrapers' },
    { name: 'Jaipur / Udaipur', traits: 'Rajasthan India, royal palaces, lakes, heritage architecture' },
    { name: 'Santorini', traits: 'Greece, Mediterranean island, whitewashed cliffs, sunsets' },
    { name: 'Varanasi / Rishikesh', traits: 'India, spiritual riverside city, Ganges, heritage & yoga' },
    { name: 'Home / Cozy Bedroom', traits: 'Personal comfort sanctuary, peaceful familiar space' },
  ],
  colour: [
    { name: 'Royal Blue', traits: 'Cool, deep rich primary tone, calm, trustworthy, ocean/sky' },
    { name: 'Sky Blue / Cyan', traits: 'Cool, bright airy light tone, peaceful daytime sky' },
    { name: 'Crimson Red', traits: 'Warm, bold vivid primary, energetic, passion, fire' },
    { name: 'Emerald Green', traits: 'Cool/balanced, rich jewel tone, forest nature, growth' },
    { name: 'Lavender / Violet', traits: 'Cool, soft or royal purple family, creative, dreamy' },
    { name: 'Obsidian Black', traits: 'Neutral dark, sleek mysterious, minimalist, classic' },
    { name: 'Pure White', traits: 'Neutral bright, clean minimalist, peaceful' },
    { name: 'Sunshine Yellow', traits: 'Warm, high brightness, cheerful, energetic' },
    { name: 'Blush Pink / Rose', traits: 'Warm-soft pastel, gentle, romantic, floral' },
    { name: 'Sunset Orange', traits: 'Warm, vibrant, energetic citrus/autumn' },
    { name: 'Teal / Turquoise', traits: 'Cool blue-green blend, tropical water, balanced' },
    { name: 'Gold / Amber', traits: 'Warm metallic/rich, luminous, luxury' },
    { name: 'Sage / Olive Green', traits: 'Muted earthy green, calm organic' },
    { name: 'Maroon / Burgundy', traits: 'Warm deep dark red, refined, intense' },
  ],
  animal: [
    { name: 'Dog', traits: 'Domestic pet, loyal companion, mammal, friendly, playful' },
    { name: 'Cat', traits: 'Domestic pet, independent, agile, feline, cozy' },
    { name: 'Lion', traits: 'Wild savanna, large feline apex predator, mane, King of Jungle' },
    { name: 'Tiger', traits: 'Wild forest, striped large feline predator, powerful, India national animal' },
    { name: 'Elephant', traits: 'Wild herbivore, giant land mammal, trunk, intelligent, gentle' },
    { name: 'Dolphin', traits: 'Marine mammal, ocean, highly intelligent, playful, fast swimmer' },
    { name: 'Eagle', traits: 'Wild bird of prey, sky, sharp vision, high altitude flight' },
    { name: 'Panda', traits: 'Wild bamboo forest, black and white bear, gentle, cute' },
    { name: 'Wolf', traits: 'Wild forest/tundra, pack predator, canine, howling, fierce' },
    { name: 'Horse', traits: 'Domestic/wild, fast herbivore, graceful, riding companion' },
    { name: 'Owl', traits: 'Nocturnal bird, wise symbol, silent flight, big eyes' },
    { name: 'Penguin', traits: 'Antarctic/cold coast, flightless bird, tuxedo look, swimmer' },
    { name: 'Cheetah', traits: 'Wild savanna, fastest land animal, spotted feline' },
    { name: 'Butterfly', traits: 'Small colourful flying insect, garden flowers, transformation' },
    { name: 'Fox', traits: 'Small clever wild canine, bushy tail, forest' },
    { name: 'Whale', traits: 'Giant ocean mammal, deep sea, serene' },
  ],
  weather: [
    { name: 'Rainy / Monsoon', traits: 'Cool wet precipitation, petrichor, cozy indoor chai/coffee mood' },
    { name: 'Snowy / Winter Frost', traits: 'Freezing cold, white snowfall, quiet serene landscape' },
    { name: 'Clear Sunny / Golden Hour', traits: 'Warm bright sunshine, blue sky, outdoor energy' },
    { name: 'Cloudy & Breezy', traits: 'Mild overcast sky, cool wind, comfortable walking weather' },
    { name: 'Thunderstorm / Lightning', traits: 'Dramatic dark clouds, heavy rain, thunder, intense' },
    { name: 'Crisp Autumn Chill', traits: 'Cool dry air, falling leaves, sweaters, mild sun' },
    { name: 'Misty / Foggy Morning', traits: 'Cool humid visibility haze, quiet mysterious dawn' },
    { name: 'Spring Mild Blossom', traits: 'Pleasant moderate temperature, fresh breeze, blooming flowers' },
  ],
  alphabet: [],
  word: [
    { name: 'Serendipity', traits: '11 letters, S, noun, poetic rare, finding good things unexpectedly' },
    { name: 'Hope', traits: '4 letters, H, abstract noun, uplifting warm, universal' },
    { name: 'Love', traits: '4 letters, L, abstract noun/verb, romantic emotional' },
    { name: 'Peace', traits: '5 letters, P, abstract noun, calm serene' },
    { name: 'Freedom', traits: '7 letters, F, abstract noun, bold inspiring' },
    { name: 'Dream', traits: '5 letters, D, noun/verb, imaginative aspirational' },
    { name: 'Euphoria', traits: '8 letters, E, noun, intense joy, poetic' },
    { name: 'Resilience', traits: '10 letters, R, noun, strength, overcoming hardship' },
    { name: 'Aurora', traits: '6 letters, A, noun, nature/dawn, luminous aesthetic' },
    { name: 'Petrichor', traits: '9 letters, P, noun, smell of rain on dry earth' },
    { name: 'Courage', traits: '7 letters, C, noun, brave heroic' },
    { name: 'Harmony', traits: '7 letters, H, noun, musical peaceful balance' },
    { name: 'Solitude', traits: '8 letters, S, noun, peaceful aloneness, reflective' },
    { name: 'Wonder', traits: '6 letters, W, noun/verb, curiosity awe' },
    { name: 'Infinity', traits: '8 letters, I, noun, mathematical cosmic endless' },
    { name: 'Coffee', traits: '6 letters, C, concrete everyday noun, cozy energy' },
  ],
};

// Deterministic Mathematical Narrowing for Number Mind Reader
export interface NumberEliminationState {
  min: number;
  max: number;
  candidates: number[];
}

export function createNumberPool(min: number, max: number): number[] {
  const safeMin = Math.max(0, Math.floor(min));
  const safeMax = Math.min(10000, Math.max(safeMin + 5, Math.floor(max)));
  const pool: number[] = [];
  for (let i = safeMin; i <= safeMax; i++) {
    pool.push(i);
  }
  return pool;
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function applyDeterministicNumberFilter(
  pool: number[],
  questionTag: string,
  answer: string
): number[] {
  const lower = answer.toLowerCase().trim();
  const [kind, val] = questionTag.split(':');

  if (kind === 'half') {
    const mid = Number(val);
    if (lower.includes('lower') || lower.includes('less') || lower.includes('smaller') || lower === 'yes') {
      const filtered = pool.filter((n) => n <= mid);
      return filtered.length > 0 ? filtered : pool;
    }
    if (lower.includes('higher') || lower.includes('greater') || lower.includes('larger') || lower === 'no') {
      const filtered = pool.filter((n) => n > mid);
      return filtered.length > 0 ? filtered : pool;
    }
  }

  if (kind === 'parity') {
    if (lower.includes('even')) {
      const filtered = pool.filter((n) => n % 2 === 0);
      return filtered.length > 0 ? filtered : pool;
    }
    if (lower.includes('odd')) {
      const filtered = pool.filter((n) => Math.abs(n % 2) === 1);
      return filtered.length > 0 ? filtered : pool;
    }
  }

  if (kind === 'prime') {
    if (lower.startsWith('yes') || lower.includes('prime')) {
      const filtered = pool.filter((n) => isPrime(n));
      return filtered.length > 0 ? filtered : pool;
    }
    if (lower.startsWith('no') || lower.includes('composite')) {
      const filtered = pool.filter((n) => !isPrime(n));
      return filtered.length > 0 ? filtered : pool;
    }
  }

  if (kind === 'div') {
    const divisor = Number(val);
    if (divisor > 0) {
      if (lower.startsWith('yes')) {
        const filtered = pool.filter((n) => n % divisor === 0);
        return filtered.length > 0 ? filtered : pool;
      }
      if (lower.startsWith('no')) {
        const filtered = pool.filter((n) => n % divisor !== 0);
        return filtered.length > 0 ? filtered : pool;
      }
    }
  }

  if (kind === 'digits') {
    if (lower.includes('single') || lower.includes('1 digit')) {
      const filtered = pool.filter((n) => n >= 0 && n <= 9);
      return filtered.length > 0 ? filtered : pool;
    }
    if (lower.includes('two') || lower.includes('2 digit')) {
      const filtered = pool.filter((n) => n >= 10 && n <= 99);
      return filtered.length > 0 ? filtered : pool;
    }
    if (lower.includes('three') || lower.includes('3 digit')) {
      const filtered = pool.filter((n) => n >= 100 && n <= 999);
      return filtered.length > 0 ? filtered : pool;
    }
  }

  return pool;
}

// Deterministic A-Z Narrowing for Alphabet category
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const STRAIGHT_ONLY = new Set(['A', 'E', 'F', 'H', 'I', 'K', 'L', 'M', 'N', 'T', 'V', 'W', 'X', 'Y', 'Z']);
const SYMMETRIC = new Set(['A', 'B', 'C', 'D', 'E', 'H', 'I', 'K', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y']);

export const FULL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function applyDeterministicAlphabetFilter(
  pool: string[],
  questionTag: string,
  answer: string
): string[] {
  const lower = answer.toLowerCase();
  if (questionTag === 'alpha_half') {
    if (lower.includes('a') && lower.includes('m')) {
      const f = pool.filter((c) => c <= 'M');
      return f.length > 0 ? f : pool;
    }
    if (lower.includes('n') && lower.includes('z')) {
      const f = pool.filter((c) => c >= 'N');
      return f.length > 0 ? f : pool;
    }
  }
  if (questionTag === 'alpha_vowel') {
    if (lower.includes('vowel')) {
      const f = pool.filter((c) => VOWELS.has(c));
      return f.length > 0 ? f : pool;
    }
    if (lower.includes('consonant')) {
      const f = pool.filter((c) => !VOWELS.has(c));
      return f.length > 0 ? f : pool;
    }
  }
  if (questionTag === 'alpha_strokes') {
    if (lower.includes('straight')) {
      const f = pool.filter((c) => STRAIGHT_ONLY.has(c));
      return f.length > 0 ? f : pool;
    }
    if (lower.includes('curve')) {
      const f = pool.filter((c) => !STRAIGHT_ONLY.has(c));
      return f.length > 0 ? f : pool;
    }
  }
  if (questionTag === 'alpha_sym') {
    if (lower.startsWith('yes')) {
      const f = pool.filter((c) => SYMMETRIC.has(c));
      return f.length > 0 ? f : pool;
    }
    if (lower.startsWith('no')) {
      const f = pool.filter((c) => !SYMMETRIC.has(c));
      return f.length > 0 ? f : pool;
    }
  }
  if (questionTag.startsWith('alpha_split:')) {
    const pivot = questionTag.split(':')[1];
    if (lower.includes('before') || lower.includes('earlier') || lower.startsWith('yes')) {
      const f = pool.filter((c) => c <= pivot);
      return f.length > 0 ? f : pool;
    }
    if (lower.includes('after') || lower.includes('later') || lower.startsWith('no')) {
      const f = pool.filter((c) => c > pivot);
      return f.length > 0 ? f : pool;
    }
  }
  return pool;
}
