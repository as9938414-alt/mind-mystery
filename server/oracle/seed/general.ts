import type { CandidateRecord } from '../types.ts';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// ==================== FOOD (48) ====================
interface FoodSeed {
  name: string;
  subtitle: string;
  cuisine: 'indian' | 'italian_western' | 'asian' | 'global_dessert';
  diet: 'veg' | 'non_veg';
  taste: 'spicy' | 'sweet' | 'savoury' | 'tangy';
  mealType: 'breakfast' | 'main_course' | 'snack' | 'dessert';
  venue: 'street_food' | 'restaurant' | 'home_classic';
  temp: 'hot' | 'cold';
  handheld: 'yes' | 'no';
  crispy: 'yes' | 'no';
  keywords: string;
}

const RAW_FOOD: FoodSeed[] = [
  { name: 'Biryani', subtitle: 'Fragrant spiced rice & saffron classic', cuisine: 'indian', diet: 'non_veg', taste: 'spicy', mealType: 'main_course', venue: 'restaurant', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'hyderabad rice dum raita saffron' },
  { name: 'Butter Chicken', subtitle: 'Creamy tomato gravy with tandoori chicken', cuisine: 'indian', diet: 'non_veg', taste: 'savoury', mealType: 'main_course', venue: 'restaurant', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'makhani naan delhi punjabi curry' },
  { name: 'Masala Dosa', subtitle: 'Crisp fermented crepe with spiced potato', cuisine: 'indian', diet: 'veg', taste: 'savoury', mealType: 'breakfast', venue: 'restaurant', temp: 'hot', handheld: 'no', crispy: 'yes', keywords: 'south indian sambar chutney crisp' },
  { name: 'Pani Puri', subtitle: 'Crisp hollow puris with tangy spiced water', cuisine: 'indian', diet: 'veg', taste: 'tangy', mealType: 'snack', venue: 'street_food', temp: 'cold', handheld: 'yes', crispy: 'yes', keywords: 'golgappa puchka chaat street mint' },
  { name: 'Samosa', subtitle: 'Triangular fried pastry stuffed with spiced potatoes', cuisine: 'indian', diet: 'veg', taste: 'spicy', mealType: 'snack', venue: 'street_food', temp: 'hot', handheld: 'yes', crispy: 'yes', keywords: 'tea chai chutney fried triangle' },
  { name: 'Vada Pav', subtitle: 'Mumbai spiced potato fritter inside soft bun', cuisine: 'indian', diet: 'veg', taste: 'spicy', mealType: 'snack', venue: 'street_food', temp: 'hot', handheld: 'yes', crispy: 'no', keywords: 'mumbai burger garlic chutney bun' },
  { name: 'Chole Bhature', subtitle: 'Spiced chickpeas paired with puffed fried bread', cuisine: 'indian', diet: 'veg', taste: 'spicy', mealType: 'breakfast', venue: 'street_food', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'delhi punjabi chickpeas pickle' },
  { name: 'Paneer Tikka', subtitle: 'Char-grilled marinated cottage cheese skewers', cuisine: 'indian', diet: 'veg', taste: 'spicy', mealType: 'snack', venue: 'restaurant', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'tandoor smoky cottage cheese starter' },
  { name: 'Gulab Jamun', subtitle: 'Warm milk-solid dumplings soaked in rose syrup', cuisine: 'indian', diet: 'veg', taste: 'sweet', mealType: 'dessert', venue: 'home_classic', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'sweet syrup festival cardamom' },
  { name: 'Jalebi', subtitle: 'Crisp spiral batter dipped in saffron sugar syrup', cuisine: 'indian', diet: 'veg', taste: 'sweet', mealType: 'dessert', venue: 'street_food', temp: 'hot', handheld: 'yes', crispy: 'yes', keywords: 'spiral orange sweet fafda' },
  { name: 'Idli Sambar', subtitle: 'Steamed rice cakes with lentil vegetable stew', cuisine: 'indian', diet: 'veg', taste: 'savoury', mealType: 'breakfast', venue: 'home_classic', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'steamed light south indian breakfast' },
  { name: 'Pav Bhaji', subtitle: 'Buttery mashed vegetable curry with toasted rolls', cuisine: 'indian', diet: 'veg', taste: 'spicy', mealType: 'snack', venue: 'street_food', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'mumbai butter tawa lemon onion' },
  { name: 'Rajma Chawal', subtitle: 'Comforting red kidney bean curry over steamed rice', cuisine: 'indian', diet: 'veg', taste: 'savoury', mealType: 'main_course', venue: 'home_classic', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'north indian comfort home lunch' },
  { name: 'Rasmalai', subtitle: 'Chilled paneer discs in saffron cardamom milk', cuisine: 'indian', diet: 'veg', taste: 'sweet', mealType: 'dessert', venue: 'restaurant', temp: 'cold', handheld: 'no', crispy: 'no', keywords: 'bengali chilled milk pistachio sweet' },
  { name: 'Aloo Paratha', subtitle: 'Whole-wheat flatbread stuffed with spiced potatoes', cuisine: 'indian', diet: 'veg', taste: 'savoury', mealType: 'breakfast', venue: 'home_classic', temp: 'hot', handheld: 'no', crispy: 'yes', keywords: 'butter curd dhaba breakfast' },
  { name: 'Tandoori Chicken', subtitle: 'Yogurt and spice roasted chicken from clay oven', cuisine: 'indian', diet: 'non_veg', taste: 'spicy', mealType: 'snack', venue: 'restaurant', temp: 'hot', handheld: 'yes', crispy: 'no', keywords: 'clay oven red smoky starter' },
  { name: 'Momos', subtitle: 'Steamed or fried Himalayan dumplings with red chutney', cuisine: 'asian', diet: 'veg', taste: 'spicy', mealType: 'snack', venue: 'street_food', temp: 'hot', handheld: 'yes', crispy: 'no', keywords: 'dumplings tibetan chutney street' },
  { name: 'Pizza', subtitle: 'Wood-fired crust with tomato sauce and melted cheese', cuisine: 'italian_western', diet: 'veg', taste: 'savoury', mealType: 'main_course', venue: 'restaurant', temp: 'hot', handheld: 'yes', crispy: 'yes', keywords: 'italy cheese slice pepperoni margherita' },
  { name: 'Burger', subtitle: 'Grilled patty layered with cheese and greens in a bun', cuisine: 'italian_western', diet: 'non_veg', taste: 'savoury', mealType: 'main_course', venue: 'restaurant', temp: 'hot', handheld: 'yes', crispy: 'no', keywords: 'fast food bun fries patty' },
  { name: 'Pasta', subtitle: 'Italian noodles tossed in creamy or tomato sauce', cuisine: 'italian_western', diet: 'veg', taste: 'savoury', mealType: 'main_course', venue: 'restaurant', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'penne spaghetti alfredo arrabbiata' },
  { name: 'French Fries', subtitle: 'Golden crisp salted potato batons', cuisine: 'italian_western', diet: 'veg', taste: 'savoury', mealType: 'snack', venue: 'street_food', temp: 'hot', handheld: 'yes', crispy: 'yes', keywords: 'potato ketchup crispy fast food' },
  { name: 'Tacos', subtitle: 'Folded corn or flour tortilla with zesty fillings', cuisine: 'italian_western', diet: 'non_veg', taste: 'tangy', mealType: 'snack', venue: 'street_food', temp: 'hot', handheld: 'yes', crispy: 'yes', keywords: 'mexican salsa lime guacamole' },
  { name: 'Sushi', subtitle: 'Vinegared rice rolls with fresh fish and nori', cuisine: 'asian', diet: 'non_veg', taste: 'savoury', mealType: 'main_course', venue: 'restaurant', temp: 'cold', handheld: 'yes', crispy: 'no', keywords: 'japanese wasabi soy sauce salmon roll' },
  { name: 'Ramen', subtitle: 'Rich Japanese noodle soup topped with egg and broth', cuisine: 'asian', diet: 'non_veg', taste: 'savoury', mealType: 'main_course', venue: 'restaurant', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'japanese noodles chopsticks broth naruto' },
  { name: 'Hakka Noodles', subtitle: 'Wok-tossed Indo-Chinese stir-fried noodles', cuisine: 'asian', diet: 'veg', taste: 'spicy', mealType: 'main_course', venue: 'street_food', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'chowmein soy sauce wok street' },
  { name: 'Fried Rice', subtitle: 'High-flame tossed rice with vegetables and soy', cuisine: 'asian', diet: 'veg', taste: 'savoury', mealType: 'main_course', venue: 'restaurant', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'wok chinese scallions manchurian' },
  { name: 'Pad Thai', subtitle: 'Tangy tamarind stir-fried rice noodles with peanuts', cuisine: 'asian', diet: 'non_veg', taste: 'tangy', mealType: 'main_course', venue: 'street_food', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'thailand lime peanuts rice noodles' },
  { name: 'Ice Cream', subtitle: 'Chilled creamy frozen scoop in cones or cups', cuisine: 'global_dessert', diet: 'veg', taste: 'sweet', mealType: 'dessert', venue: 'street_food', temp: 'cold', handheld: 'yes', crispy: 'no', keywords: 'frozen vanilla chocolate cone summer' },
  { name: 'Chocolate Cake', subtitle: 'Rich layered cocoa sponge with fudge frosting', cuisine: 'global_dessert', diet: 'veg', taste: 'sweet', mealType: 'dessert', venue: 'home_classic', temp: 'cold', handheld: 'no', crispy: 'no', keywords: 'birthday bakery cocoa frosting' },
  { name: 'Tiramisu', subtitle: 'Coffee-soaked Italian ladyfingers with mascarpone', cuisine: 'global_dessert', diet: 'veg', taste: 'sweet', mealType: 'dessert', venue: 'restaurant', temp: 'cold', handheld: 'no', crispy: 'no', keywords: 'espresso italian cocoa dessert' },
  { name: 'Pancakes', subtitle: 'Fluffy griddle cakes stacked with maple syrup', cuisine: 'italian_western', diet: 'veg', taste: 'sweet', mealType: 'breakfast', venue: 'home_classic', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'syrup butter breakfast stack' },
  { name: 'Croissant', subtitle: 'Flaky buttery crescent French pastry', cuisine: 'global_dessert', diet: 'veg', taste: 'savoury', mealType: 'breakfast', venue: 'restaurant', temp: 'hot', handheld: 'yes', crispy: 'yes', keywords: 'french bakery coffee flaky' },
  { name: 'Donut', subtitle: 'Glazed ring-shaped fried sweet pastry', cuisine: 'global_dessert', diet: 'veg', taste: 'sweet', mealType: 'snack', venue: 'restaurant', temp: 'cold', handheld: 'yes', crispy: 'no', keywords: 'sprinkles glaze ring coffee' },
  { name: 'Waffles', subtitle: 'Crisp grid-patterned batter topped with berries or syrup', cuisine: 'global_dessert', diet: 'veg', taste: 'sweet', mealType: 'dessert', venue: 'restaurant', temp: 'hot', handheld: 'yes', crispy: 'yes', keywords: 'belgian grid nutella crisp' },
  { name: 'Brownie', subtitle: 'Dense fudgy baked chocolate square', cuisine: 'global_dessert', diet: 'veg', taste: 'sweet', mealType: 'dessert', venue: 'restaurant', temp: 'hot', handheld: 'yes', crispy: 'no', keywords: 'sizzling fudge walnut chocolate' },
  { name: 'Poha', subtitle: 'Light flattened rice tempered with curry leaves and lemon', cuisine: 'indian', diet: 'veg', taste: 'tangy', mealType: 'breakfast', venue: 'home_classic', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'indore sev peanuts morning' },
  { name: 'Maggi Noodles', subtitle: '2-minute masala instant noodles', cuisine: 'indian', diet: 'veg', taste: 'spicy', mealType: 'snack', venue: 'home_classic', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'hostel midnight hills instant' },
  { name: 'Shawarma', subtitle: 'Spit-roasted spiced meat wrapped in pita with garlic sauce', cuisine: 'asian', diet: 'non_veg', taste: 'savoury', mealType: 'snack', venue: 'street_food', temp: 'hot', handheld: 'yes', crispy: 'no', keywords: 'middle east wrap pita toum' },
  { name: 'Dal Makhani', subtitle: 'Slow-cooked black lentils finished with cream and butter', cuisine: 'indian', diet: 'veg', taste: 'savoury', mealType: 'main_course', venue: 'restaurant', temp: 'hot', handheld: 'no', crispy: 'no', keywords: 'punjabi lentils naan rich' },
  { name: 'Kulfi', subtitle: 'Dense traditional Indian frozen milk dessert on a stick', cuisine: 'indian', diet: 'veg', taste: 'sweet', mealType: 'dessert', venue: 'street_food', temp: 'cold', handheld: 'yes', crispy: 'no', keywords: 'matka pistachio falooda stick' },
];

export const FOOD_CANDIDATES: CandidateRecord[] = RAW_FOOD.map((f) => ({
  id: `food_${slugify(f.name)}`,
  category: 'food',
  industry: null,
  name: f.name,
  subtitle: f.subtitle,
  releaseYear: null,
  endYear: null,
  decade: null,
  era: null,
  popularityPrior: 1.1,
  verified: true,
  attributes: {
    cuisine: f.cuisine,
    diet: f.diet,
    taste: f.taste,
    meal_type: f.mealType,
    venue: f.venue,
    temp: f.temp,
    handheld: f.handheld,
    crispy: f.crispy,
    keywords: f.keywords,
  },
}));

// ==================== PLACE (42) ====================
interface PlaceSeed {
  name: string;
  subtitle: string;
  continent: 'asia_india' | 'asia_other' | 'europe' | 'americas' | 'africa_oceania';
  setting: 'city' | 'nature' | 'historical' | 'island';
  terrain: 'beach' | 'mountain' | 'plains_urban' | 'desert';
  climate: 'tropical_warm' | 'temperate' | 'cold_alpine' | 'arid';
  budget: 'budget' | 'mid_range' | 'luxury';
  coastal: 'yes' | 'no';
  capital: 'yes' | 'no';
  keywords: string;
}

const RAW_PLACES: PlaceSeed[] = [
  { name: 'Paris', subtitle: 'France · City of Light & Eiffel Tower', continent: 'europe', setting: 'city', terrain: 'plains_urban', climate: 'temperate', budget: 'luxury', coastal: 'no', capital: 'yes', keywords: 'eiffel louvre seine romance france' },
  { name: 'Tokyo', subtitle: 'Japan · Neon metropolis & ancient shrines', continent: 'asia_other', setting: 'city', terrain: 'plains_urban', climate: 'temperate', budget: 'luxury', coastal: 'yes', capital: 'yes', keywords: 'shibuya anime sushi japan mount fuji' },
  { name: 'New York City', subtitle: 'USA · The City That Never Sleeps', continent: 'americas', setting: 'city', terrain: 'plains_urban', climate: 'temperate', budget: 'luxury', coastal: 'yes', capital: 'no', keywords: 'manhattan statue of liberty times square' },
  { name: 'London', subtitle: 'UK · Big Ben, Thames & royal heritage', continent: 'europe', setting: 'city', terrain: 'plains_urban', climate: 'temperate', budget: 'luxury', coastal: 'no', capital: 'yes', keywords: 'england red bus buckingham bridge' },
  { name: 'Dubai', subtitle: 'UAE · Burj Khalifa & desert luxury', continent: 'asia_other', setting: 'city', terrain: 'desert', climate: 'arid', budget: 'luxury', coastal: 'yes', capital: 'no', keywords: 'burj khalifa mall skyscrapers uae' },
  { name: 'Goa', subtitle: 'India · Golden beaches & Portuguese forts', continent: 'asia_india', setting: 'nature', terrain: 'beach', climate: 'tropical_warm', budget: 'budget', coastal: 'yes', capital: 'no', keywords: 'beaches party forts india sunset' },
  { name: 'Ladakh', subtitle: 'India · High-altitude passes & Pangong Lake', continent: 'asia_india', setting: 'nature', terrain: 'mountain', climate: 'cold_alpine', budget: 'mid_range', coastal: 'no', capital: 'no', keywords: 'leh pangong bike trip himalayas' },
  { name: 'Jaipur', subtitle: 'India · The Pink City of Rajasthan', continent: 'asia_india', setting: 'historical', terrain: 'desert', climate: 'arid', budget: 'budget', coastal: 'no', capital: 'no', keywords: 'hawa mahal amer fort palaces pink' },
  { name: 'Varanasi', subtitle: 'India · Ancient ghats along the Ganges', continent: 'asia_india', setting: 'historical', terrain: 'plains_urban', climate: 'tropical_warm', budget: 'budget', coastal: 'no', capital: 'no', keywords: 'kashi ganga aarti oldest city temples' },
  { name: 'Manali', subtitle: 'India · Snow-capped Himalayan hill station', continent: 'asia_india', setting: 'nature', terrain: 'mountain', climate: 'cold_alpine', budget: 'budget', coastal: 'no', capital: 'no', keywords: 'himachal snow solang rohtang' },
  { name: 'Mumbai', subtitle: 'India · Financial capital & Gateway of India', continent: 'asia_india', setting: 'city', terrain: 'beach', climate: 'tropical_warm', budget: 'mid_range', coastal: 'yes', capital: 'no', keywords: 'bollywood marine drive local train' },
  { name: 'New Delhi', subtitle: 'India · Capital of monuments & street food', continent: 'asia_india', setting: 'city', terrain: 'plains_urban', climate: 'tropical_warm', budget: 'budget', coastal: 'no', capital: 'yes', keywords: 'india gate red fort qutub minar' },
  { name: 'Kerala Backwaters', subtitle: 'India · Houseboats & lush palm lagoons', continent: 'asia_india', setting: 'nature', terrain: 'beach', climate: 'tropical_warm', budget: 'mid_range', coastal: 'yes', capital: 'no', keywords: 'alleppey houseboat munnar gods own country' },
  { name: 'Agra', subtitle: 'India · Home of the Taj Mahal', continent: 'asia_india', setting: 'historical', terrain: 'plains_urban', climate: 'tropical_warm', budget: 'budget', coastal: 'no', capital: 'no', keywords: 'taj mahal marble wonder yamuna' },
  { name: 'Maldives', subtitle: 'Indian Ocean · Overwater villas & turquoise reefs', continent: 'asia_other', setting: 'island', terrain: 'beach', climate: 'tropical_warm', budget: 'luxury', coastal: 'yes', capital: 'no', keywords: 'atolls lagoon honeymoon snorkeling' },
  { name: 'Bali', subtitle: 'Indonesia · Rice terraces, temples & surf', continent: 'asia_other', setting: 'island', terrain: 'beach', climate: 'tropical_warm', budget: 'mid_range', coastal: 'yes', capital: 'no', keywords: 'ubud indonesia surf temples tropical' },
  { name: 'Switzerland (Swiss Alps)', subtitle: 'Europe · Alpine peaks, lakes & scenic trains', continent: 'europe', setting: 'nature', terrain: 'mountain', climate: 'cold_alpine', budget: 'luxury', coastal: 'no', capital: 'no', keywords: 'interlaken jungfrau snow chocolate' },
  { name: 'Rome', subtitle: 'Italy · Colosseum, Vatican & ancient ruins', continent: 'europe', setting: 'historical', terrain: 'plains_urban', climate: 'temperate', budget: 'mid_range', coastal: 'no', capital: 'yes', keywords: 'colosseum trevi fountain italy pasta' },
  { name: 'Santorini', subtitle: 'Greece · Whitewashed cliffside caldera views', continent: 'europe', setting: 'island', terrain: 'beach', climate: 'temperate', budget: 'luxury', coastal: 'yes', capital: 'no', keywords: 'blue domes sunset aegean greece' },
  { name: 'Iceland', subtitle: 'North Atlantic · Northern lights, glaciers & geysers', continent: 'europe', setting: 'island', terrain: 'mountain', climate: 'cold_alpine', budget: 'luxury', coastal: 'yes', capital: 'no', keywords: 'aurora volcanoes waterfalls reykjavik' },
  { name: 'Singapore', subtitle: 'Southeast Asia · Garden city & Marina Bay', continent: 'asia_other', setting: 'city', terrain: 'plains_urban', climate: 'tropical_warm', budget: 'luxury', coastal: 'yes', capital: 'yes', keywords: 'merlion gardens by the bay changi' },
  { name: 'Bangkok', subtitle: 'Thailand · Vibrant street markets & golden temples', continent: 'asia_other', setting: 'city', terrain: 'plains_urban', climate: 'tropical_warm', budget: 'budget', coastal: 'no', capital: 'yes', keywords: 'thailand tuk tuk night markets temples' },
  { name: 'Seoul', subtitle: 'South Korea · K-culture, palaces & tech skyline', continent: 'asia_other', setting: 'city', terrain: 'plains_urban', climate: 'temperate', budget: 'mid_range', coastal: 'no', capital: 'yes', keywords: 'korea gangnam namsan han river' },
  { name: 'Kyoto', subtitle: 'Japan · Bamboo groves & historic wooden temples', continent: 'asia_other', setting: 'historical', terrain: 'mountain', climate: 'temperate', budget: 'mid_range', coastal: 'no', capital: 'no', keywords: 'fushimi inari torii geisha cherry blossoms' },
  { name: 'Cairo & Giza', subtitle: 'Egypt · Great Pyramids & Sphinx', continent: 'africa_oceania', setting: 'historical', terrain: 'desert', climate: 'arid', budget: 'budget', coastal: 'no', capital: 'yes', keywords: 'pyramids nile pharaohs sphinx' },
  { name: 'Sydney', subtitle: 'Australia · Opera House & Harbour beaches', continent: 'africa_oceania', setting: 'city', terrain: 'beach', climate: 'temperate', budget: 'luxury', coastal: 'yes', capital: 'no', keywords: 'opera house bondi harbour australia' },
  { name: 'Cape Town', subtitle: 'South Africa · Table Mountain & coastal capes', continent: 'africa_oceania', setting: 'nature', terrain: 'mountain', climate: 'temperate', budget: 'mid_range', coastal: 'yes', capital: 'no', keywords: 'table mountain penguins africa coast' },
  { name: 'Machu Picchu', subtitle: 'Peru · Incan citadel high in the Andes', continent: 'americas', setting: 'historical', terrain: 'mountain', climate: 'cold_alpine', budget: 'mid_range', coastal: 'no', capital: 'no', keywords: 'peru inca llamas clouds ruins' },
  { name: 'Rio de Janeiro', subtitle: 'Brazil · Christ the Redeemer & Copacabana', continent: 'americas', setting: 'city', terrain: 'beach', climate: 'tropical_warm', budget: 'mid_range', coastal: 'yes', capital: 'no', keywords: 'carnival samba statue beach brazil' },
  { name: 'Grand Canyon', subtitle: 'USA · Mile-deep red rock gorge in Arizona', continent: 'americas', setting: 'nature', terrain: 'desert', climate: 'arid', budget: 'mid_range', coastal: 'no', capital: 'no', keywords: 'arizona canyon colorado river red rock' },
  { name: 'Venice', subtitle: 'Italy · Floating city of canals & gondolas', continent: 'europe', setting: 'historical', terrain: 'beach', climate: 'temperate', budget: 'luxury', coastal: 'yes', capital: 'no', keywords: 'canals gondolas st mark italy' },
  { name: 'Barcelona', subtitle: 'Spain · Gaudi architecture & Mediterranean coast', continent: 'europe', setting: 'city', terrain: 'beach', climate: 'temperate', budget: 'mid_range', coastal: 'yes', capital: 'no', keywords: 'sagrada familia spain football beach' },
  { name: 'Kashmir (Srinagar)', subtitle: 'India · Dal Lake shikaras & snow meadows', continent: 'asia_india', setting: 'nature', terrain: 'mountain', climate: 'cold_alpine', budget: 'mid_range', coastal: 'no', capital: 'no', keywords: 'gulmarg dal lake paradise on earth' },
  { name: 'Andaman Islands', subtitle: 'India · Coral beaches & turquoise waters', continent: 'asia_india', setting: 'island', terrain: 'beach', climate: 'tropical_warm', budget: 'mid_range', coastal: 'yes', capital: 'no', keywords: 'havelock radhanagar scuba islands' },
  { name: 'Queenstown', subtitle: 'New Zealand · Adventure capital of Southern Alps', continent: 'africa_oceania', setting: 'nature', terrain: 'mountain', climate: 'cold_alpine', budget: 'luxury', coastal: 'no', capital: 'no', keywords: 'bungee new zealand fjords mountains' },
  { name: 'Petra', subtitle: 'Jordan · Rose-red city carved in canyon rock', continent: 'asia_other', setting: 'historical', terrain: 'desert', climate: 'arid', budget: 'mid_range', coastal: 'no', capital: 'no', keywords: 'treasury jordan desert wonder' },
];

export const PLACE_CANDIDATES: CandidateRecord[] = RAW_PLACES.map((p) => ({
  id: `place_${slugify(p.name)}`,
  category: 'place',
  industry: null,
  name: p.name,
  subtitle: p.subtitle,
  releaseYear: null,
  endYear: null,
  decade: null,
  era: null,
  popularityPrior: 1.1,
  verified: true,
  attributes: {
    continent: p.continent,
    setting: p.setting,
    terrain: p.terrain,
    climate: p.climate,
    budget: p.budget,
    coastal: p.coastal,
    capital: p.capital,
    keywords: p.keywords,
  },
}));

// ==================== COLOUR (24 — full curated spectrum) ====================
interface ColourSeed {
  name: string;
  subtitle: string;
  hex: string;
  temperature: 'warm' | 'cool' | 'neutral';
  brightness: 'light' | 'medium' | 'dark';
  family: 'red_pink' | 'orange_yellow' | 'green' | 'blue_cyan' | 'purple_violet' | 'brown_mono';
  inRainbow: 'yes' | 'no';
  primarySecondary: 'primary' | 'secondary' | 'tertiary_neutral';
  natureLinked: 'yes' | 'no';
  vividOrMuted: 'vivid' | 'pastel_muted';
}

const RAW_COLOURS: ColourSeed[] = [
  { name: 'Red', subtitle: 'Bold primary crimson spectrum · #EF4444', hex: '#EF4444', temperature: 'warm', brightness: 'medium', family: 'red_pink', inRainbow: 'yes', primarySecondary: 'primary', natureLinked: 'yes', vividOrMuted: 'vivid' },
  { name: 'Crimson', subtitle: 'Deep rich ruby red · #991B1B', hex: '#991B1B', temperature: 'warm', brightness: 'dark', family: 'red_pink', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'no', vividOrMuted: 'vivid' },
  { name: 'Pink', subtitle: 'Soft rose & blossom tone · #F472B6', hex: '#F472B6', temperature: 'warm', brightness: 'light', family: 'red_pink', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'pastel_muted' },
  { name: 'Magenta', subtitle: 'Electric fuchsia-pink hue · #E879F9', hex: '#E879F9', temperature: 'warm', brightness: 'medium', family: 'red_pink', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'no', vividOrMuted: 'vivid' },
  { name: 'Coral', subtitle: 'Warm reef orange-pink · #FB7185', hex: '#FB7185', temperature: 'warm', brightness: 'light', family: 'red_pink', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'vivid' },
  { name: 'Orange', subtitle: 'Vibrant sunset citrus hue · #F97316', hex: '#F97316', temperature: 'warm', brightness: 'medium', family: 'orange_yellow', inRainbow: 'yes', primarySecondary: 'secondary', natureLinked: 'yes', vividOrMuted: 'vivid' },
  { name: 'Yellow', subtitle: 'Bright sunlit primary tone · #EAB308', hex: '#EAB308', temperature: 'warm', brightness: 'light', family: 'orange_yellow', inRainbow: 'yes', primarySecondary: 'primary', natureLinked: 'yes', vividOrMuted: 'vivid' },
  { name: 'Gold', subtitle: 'Metallic warm amber sheen · #CA8A04', hex: '#CA8A04', temperature: 'warm', brightness: 'medium', family: 'orange_yellow', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'no', vividOrMuted: 'vivid' },
  { name: 'Peach', subtitle: 'Gentle pastel apricot tint · #FDBA74', hex: '#FDBA74', temperature: 'warm', brightness: 'light', family: 'orange_yellow', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'pastel_muted' },
  { name: 'Green', subtitle: 'Lush forest & leaf spectrum · #22C55E', hex: '#22C55E', temperature: 'cool', brightness: 'medium', family: 'green', inRainbow: 'yes', primarySecondary: 'secondary', natureLinked: 'yes', vividOrMuted: 'vivid' },
  { name: 'Mint', subtitle: 'Fresh pastel seafoam green · #6EE7B7', hex: '#6EE7B7', temperature: 'cool', brightness: 'light', family: 'green', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'pastel_muted' },
  { name: 'Olive', subtitle: 'Earthy dark moss green · #4D7C0F', hex: '#4D7C0F', temperature: 'warm', brightness: 'dark', family: 'green', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'pastel_muted' },
  { name: 'Blue', subtitle: 'Classic sky & ocean primary · #3B82F6', hex: '#3B82F6', temperature: 'cool', brightness: 'medium', family: 'blue_cyan', inRainbow: 'yes', primarySecondary: 'primary', natureLinked: 'yes', vividOrMuted: 'vivid' },
  { name: 'Cyan / Sky Blue', subtitle: 'Bright electric horizon blue · #38BDF8', hex: '#38BDF8', temperature: 'cool', brightness: 'light', family: 'blue_cyan', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'vivid' },
  { name: 'Navy Blue', subtitle: 'Deep midnight ocean shade · #1E3A8A', hex: '#1E3A8A', temperature: 'cool', brightness: 'dark', family: 'blue_cyan', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'pastel_muted' },
  { name: 'Teal', subtitle: 'Rich blue-green jewel tone · #0D9488', hex: '#0D9488', temperature: 'cool', brightness: 'medium', family: 'blue_cyan', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'pastel_muted' },
  { name: 'Indigo', subtitle: 'Deep twilight blue-violet · #4F46E5', hex: '#4F46E5', temperature: 'cool', brightness: 'dark', family: 'purple_violet', inRainbow: 'yes', primarySecondary: 'tertiary_neutral', natureLinked: 'no', vividOrMuted: 'vivid' },
  { name: 'Violet', subtitle: 'Luminous spectral violet · #7C3AED', hex: '#7C3AED', temperature: 'cool', brightness: 'medium', family: 'purple_violet', inRainbow: 'yes', primarySecondary: 'secondary', natureLinked: 'no', vividOrMuted: 'vivid' },
  { name: 'Purple', subtitle: 'Royal amethyst shade · #9333EA', hex: '#9333EA', temperature: 'cool', brightness: 'dark', family: 'purple_violet', inRainbow: 'no', primarySecondary: 'secondary', natureLinked: 'no', vividOrMuted: 'vivid' },
  { name: 'Lavender', subtitle: 'Calming pastel lilac bloom · #C4B5FD', hex: '#C4B5FD', temperature: 'cool', brightness: 'light', family: 'purple_violet', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'pastel_muted' },
  { name: 'Black', subtitle: 'Absolute obsidian dark · #0F172A', hex: '#0F172A', temperature: 'neutral', brightness: 'dark', family: 'brown_mono', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'no', vividOrMuted: 'vivid' },
  { name: 'White', subtitle: 'Pure snow & light neutral · #F8FAFC', hex: '#F8FAFC', temperature: 'neutral', brightness: 'light', family: 'brown_mono', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'pastel_muted' },
  { name: 'Grey / Silver', subtitle: 'Balanced slate monochrome · #94A3B8', hex: '#94A3B8', temperature: 'neutral', brightness: 'medium', family: 'brown_mono', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'no', vividOrMuted: 'pastel_muted' },
  { name: 'Brown', subtitle: 'Warm earth, wood & coffee tone · #92400E', hex: '#92400E', temperature: 'warm', brightness: 'dark', family: 'brown_mono', inRainbow: 'no', primarySecondary: 'tertiary_neutral', natureLinked: 'yes', vividOrMuted: 'pastel_muted' },
];

export const COLOUR_CANDIDATES: CandidateRecord[] = RAW_COLOURS.map((c) => ({
  id: `colour_${slugify(c.name)}`,
  category: 'colour',
  industry: null,
  name: c.name,
  subtitle: c.subtitle,
  releaseYear: null,
  endYear: null,
  decade: null,
  era: null,
  popularityPrior: 1.0,
  verified: true,
  attributes: {
    temperature: c.temperature,
    brightness: c.brightness,
    family: c.family,
    in_rainbow: c.inRainbow,
    primary_secondary: c.primarySecondary,
    nature_linked: c.natureLinked,
    vivid_or_muted: c.vividOrMuted,
    hex: c.hex,
    keywords: c.name.toLowerCase(),
  },
}));

// ==================== ANIMAL (40) ====================
interface AnimalSeed {
  name: string;
  subtitle: string;
  domestication: 'domestic' | 'wild';
  habitat: 'land' | 'water' | 'air' | 'land_water';
  diet: 'herbivore' | 'carnivore' | 'omnivore';
  size: 'small' | 'medium' | 'large';
  flies: 'yes' | 'no';
  swims: 'yes' | 'no';
  legs: 'none' | 'two' | 'four' | 'many';
  mammal: 'yes' | 'no';
  dangerous: 'yes' | 'no';
  keywords: string;
}

const RAW_ANIMALS: AnimalSeed[] = [
  { name: 'Dog', subtitle: 'Loyal domesticated canine companion', domestication: 'domestic', habitat: 'land', diet: 'omnivore', size: 'medium', flies: 'no', swims: 'yes', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'puppy pet bark loyal' },
  { name: 'Cat', subtitle: 'Agile independent feline pet', domestication: 'domestic', habitat: 'land', diet: 'carnivore', size: 'small', flies: 'no', swims: 'no', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'kitten meow purr pet' },
  { name: 'Lion', subtitle: 'Apex savanna big cat known as King of Beasts', domestication: 'wild', habitat: 'land', diet: 'carnivore', size: 'large', flies: 'no', swims: 'no', legs: 'four', mammal: 'yes', dangerous: 'yes', keywords: 'mane pride africa roar' },
  { name: 'Tiger', subtitle: 'Striped apex predator & India\'s national animal', domestication: 'wild', habitat: 'land', diet: 'carnivore', size: 'large', flies: 'no', swims: 'yes', legs: 'four', mammal: 'yes', dangerous: 'yes', keywords: 'stripes bengal jungle big cat' },
  { name: 'Elephant', subtitle: 'Largest land mammal with trunk and tusks', domestication: 'wild', habitat: 'land', diet: 'herbivore', size: 'large', flies: 'no', swims: 'yes', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'trunk ivory ears herd' },
  { name: 'Dolphin', subtitle: 'Highly intelligent echolocating marine mammal', domestication: 'wild', habitat: 'water', diet: 'carnivore', size: 'medium', flies: 'no', swims: 'yes', legs: 'none', mammal: 'yes', dangerous: 'no', keywords: 'ocean smart flip jump friendly' },
  { name: 'Blue Whale', subtitle: 'Largest animal to ever live on Earth', domestication: 'wild', habitat: 'water', diet: 'carnivore', size: 'large', flies: 'no', swims: 'yes', legs: 'none', mammal: 'yes', dangerous: 'no', keywords: 'giant ocean krill blowhole' },
  { name: 'Great White Shark', subtitle: 'Apex oceanic cartilaginous predator', domestication: 'wild', habitat: 'water', diet: 'carnivore', size: 'large', flies: 'no', swims: 'yes', legs: 'none', mammal: 'no', dangerous: 'yes', keywords: 'fin teeth jaws ocean' },
  { name: 'Eagle', subtitle: 'Soaring raptor with razor-sharp vision', domestication: 'wild', habitat: 'air', diet: 'carnivore', size: 'medium', flies: 'yes', swims: 'no', legs: 'two', mammal: 'no', dangerous: 'no', keywords: 'bird talons wings sky' },
  { name: 'Owl', subtitle: 'Silent nocturnal hunter with rotating head', domestication: 'wild', habitat: 'air', diet: 'carnivore', size: 'small', flies: 'yes', swims: 'no', legs: 'two', mammal: 'no', dangerous: 'no', keywords: 'night hoot wise feathers' },
  { name: 'Penguin', subtitle: 'Flightless tuxedo-patterned Antarctic swimmer', domestication: 'wild', habitat: 'land_water', diet: 'carnivore', size: 'small', flies: 'no', swims: 'yes', legs: 'two', mammal: 'no', dangerous: 'no', keywords: 'ice antarctica waddle bird' },
  { name: 'Peacock', subtitle: 'Iridescent plumed bird famed for fan displays', domestication: 'wild', habitat: 'land', diet: 'omnivore', size: 'medium', flies: 'yes', swims: 'no', legs: 'two', mammal: 'no', dangerous: 'no', keywords: 'feathers dance india national bird' },
  { name: 'Horse', subtitle: 'Swift domesticated equine built for riding', domestication: 'domestic', habitat: 'land', diet: 'herbivore', size: 'large', flies: 'no', swims: 'yes', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'gallop saddle stallion race' },
  { name: 'Cow', subtitle: 'Gentle dairy farm bovine', domestication: 'domestic', habitat: 'land', diet: 'herbivore', size: 'large', flies: 'no', swims: 'no', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'milk farm moo pasture' },
  { name: 'Rabbit', subtitle: 'Long-eared hopping small mammal', domestication: 'domestic', habitat: 'land', diet: 'herbivore', size: 'small', flies: 'no', swims: 'no', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'bunny carrot ears burrow' },
  { name: 'Panda', subtitle: 'Black-and-white bamboo-eating bear of China', domestication: 'wild', habitat: 'land', diet: 'herbivore', size: 'large', flies: 'no', swims: 'no', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'bamboo cute china bear' },
  { name: 'Cheetah', subtitle: 'Fastest land animal capable of 110 km/h bursts', domestication: 'wild', habitat: 'land', diet: 'carnivore', size: 'medium', flies: 'no', swims: 'no', legs: 'four', mammal: 'yes', dangerous: 'yes', keywords: 'spots speed sprint africa' },
  { name: 'Giraffe', subtitle: 'Tallest land mammal with long patterned neck', domestication: 'wild', habitat: 'land', diet: 'herbivore', size: 'large', flies: 'no', swims: 'no', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'tall neck spots acacia' },
  { name: 'Kangaroo', subtitle: 'Australian hopping marsupial with a pouch', domestication: 'wild', habitat: 'land', diet: 'herbivore', size: 'medium', flies: 'no', swims: 'yes', legs: 'two', mammal: 'yes', dangerous: 'no', keywords: 'australia pouch joey jump' },
  { name: 'Wolf', subtitle: 'Pack-hunting wild ancestor of dogs', domestication: 'wild', habitat: 'land', diet: 'carnivore', size: 'medium', flies: 'no', swims: 'yes', legs: 'four', mammal: 'yes', dangerous: 'yes', keywords: 'howl moon pack forest' },
  { name: 'Fox', subtitle: 'Clever bushy-tailed omnivorous canid', domestication: 'wild', habitat: 'land', diet: 'omnivore', size: 'small', flies: 'no', swims: 'no', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'orange clever bushy tail' },
  { name: 'Monkey', subtitle: 'Agile tree-dwelling primate', domestication: 'wild', habitat: 'land', diet: 'omnivore', size: 'small', flies: 'no', swims: 'yes', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'trees banana tail playful' },
  { name: 'Crocodile', subtitle: 'Armored amphibious ambush reptile', domestication: 'wild', habitat: 'land_water', diet: 'carnivore', size: 'large', flies: 'no', swims: 'yes', legs: 'four', mammal: 'no', dangerous: 'yes', keywords: 'river jaws scales reptile' },
  { name: 'Frog', subtitle: 'Leaping amphibian living between ponds and land', domestication: 'wild', habitat: 'land_water', diet: 'carnivore', size: 'small', flies: 'no', swims: 'yes', legs: 'four', mammal: 'no', dangerous: 'no', keywords: 'ribbit pond green tadpole' },
  { name: 'King Cobra', subtitle: 'World\'s longest venomous hooded snake', domestication: 'wild', habitat: 'land', diet: 'carnivore', size: 'medium', flies: 'no', swims: 'yes', legs: 'none', mammal: 'no', dangerous: 'yes', keywords: 'snake venom hood hiss' },
  { name: 'Octopus', subtitle: 'Eight-armed master of ocean camouflage', domestication: 'wild', habitat: 'water', diet: 'carnivore', size: 'small', flies: 'no', swims: 'yes', legs: 'many', mammal: 'no', dangerous: 'no', keywords: 'tentacles ink smart three hearts' },
  { name: 'Sea Turtle', subtitle: 'Shelled ocean navigator migrating thousands of miles', domestication: 'wild', habitat: 'land_water', diet: 'herbivore', size: 'medium', flies: 'no', swims: 'yes', legs: 'four', mammal: 'no', dangerous: 'no', keywords: 'shell ocean beach slow' },
  { name: 'Butterfly', subtitle: 'Colourful winged insect born from metamorphosis', domestication: 'wild', habitat: 'air', diet: 'herbivore', size: 'small', flies: 'yes', swims: 'no', legs: 'many', mammal: 'no', dangerous: 'no', keywords: 'caterpillar cocoon wings nectar' },
  { name: 'Honeybee', subtitle: 'Hive-building pollinator producing golden honey', domestication: 'domestic', habitat: 'air', diet: 'herbivore', size: 'small', flies: 'yes', swims: 'no', legs: 'many', mammal: 'no', dangerous: 'no', keywords: 'hive sting yellow stripes honey' },
  { name: 'Spider', subtitle: 'Eight-legged silk-spinning arachnid', domestication: 'wild', habitat: 'land', diet: 'carnivore', size: 'small', flies: 'no', swims: 'no', legs: 'many', mammal: 'no', dangerous: 'yes', keywords: 'web eight legs silk' },
  { name: 'Polar Bear', subtitle: 'Arctic apex predator adapted to sea ice', domestication: 'wild', habitat: 'land_water', diet: 'carnivore', size: 'large', flies: 'no', swims: 'yes', legs: 'four', mammal: 'yes', dangerous: 'yes', keywords: 'white snow arctic ice' },
  { name: 'Bat', subtitle: 'Only mammal capable of sustained true flight', domestication: 'wild', habitat: 'air', diet: 'omnivore', size: 'small', flies: 'yes', swims: 'no', legs: 'two', mammal: 'yes', dangerous: 'no', keywords: 'cave night echolocation upside down' },
  { name: 'Parrot', subtitle: 'Vibrant talking tropical bird', domestication: 'domestic', habitat: 'air', diet: 'herbivore', size: 'small', flies: 'yes', swims: 'no', legs: 'two', mammal: 'no', dangerous: 'no', keywords: 'mimic talk green feathers pet' },
  { name: 'Camel', subtitle: 'Desert-adapted mammal with energy-storing humps', domestication: 'domestic', habitat: 'land', diet: 'herbivore', size: 'large', flies: 'no', swims: 'no', legs: 'four', mammal: 'yes', dangerous: 'no', keywords: 'desert hump ship rajasthan' },
];

export const ANIMAL_CANDIDATES: CandidateRecord[] = RAW_ANIMALS.map((a) => ({
  id: `animal_${slugify(a.name)}`,
  category: 'animal',
  industry: null,
  name: a.name,
  subtitle: a.subtitle,
  releaseYear: null,
  endYear: null,
  decade: null,
  era: null,
  popularityPrior: 1.1,
  verified: true,
  attributes: {
    domestication: a.domestication,
    habitat: a.habitat,
    diet: a.diet,
    size: a.size,
    flies: a.flies,
    swims: a.swims,
    legs: a.legs,
    mammal: a.mammal,
    dangerous: a.dangerous,
    keywords: a.keywords,
  },
}));

// ==================== WEATHER (16 — full curated set) ====================
interface WeatherSeed {
  name: string;
  subtitle: string;
  sky: 'sunny_clear' | 'rainy' | 'cloudy_fog' | 'snowy_icy' | 'stormy';
  season: 'summer' | 'monsoon' | 'winter' | 'any_season';
  temp: 'hot' | 'mild' | 'cold';
  precipitation: 'yes' | 'no';
  windy: 'yes' | 'no';
  dramatic: 'yes' | 'no';
  timeOfDay: 'daytime' | 'morning_night' | 'any_time';
}

const RAW_WEATHER: WeatherSeed[] = [
  { name: 'Clear Sunny Day', subtitle: 'Bright unobstructed sunlight & blue sky', sky: 'sunny_clear', season: 'summer', temp: 'hot', precipitation: 'no', windy: 'no', dramatic: 'no', timeOfDay: 'daytime' },
  { name: 'Heatwave', subtitle: 'Prolonged intense scorching summer heat', sky: 'sunny_clear', season: 'summer', temp: 'hot', precipitation: 'no', windy: 'yes', dramatic: 'yes', timeOfDay: 'daytime' },
  { name: 'Golden Sunset Breeze', subtitle: 'Warm pleasant evening light & calm air', sky: 'sunny_clear', season: 'any_season', temp: 'mild', precipitation: 'no', windy: 'yes', dramatic: 'no', timeOfDay: 'morning_night' },
  { name: 'Light Drizzle', subtitle: 'Gentle fine rain droplets & cool air', sky: 'rainy', season: 'monsoon', temp: 'mild', precipitation: 'yes', windy: 'no', dramatic: 'no', timeOfDay: 'any_time' },
  { name: 'Heavy Monsoon Downpour', subtitle: 'Torrential steady rain & flooded streets', sky: 'rainy', season: 'monsoon', temp: 'mild', precipitation: 'yes', windy: 'yes', dramatic: 'yes', timeOfDay: 'any_time' },
  { name: 'Rainbow Shower', subtitle: 'Sun-break rain painting a colour arc', sky: 'rainy', season: 'monsoon', temp: 'mild', precipitation: 'yes', windy: 'no', dramatic: 'yes', timeOfDay: 'daytime' },
  { name: 'Thunderstorm', subtitle: 'Flashing lightning, thunderclaps & squalls', sky: 'stormy', season: 'monsoon', temp: 'mild', precipitation: 'yes', windy: 'yes', dramatic: 'yes', timeOfDay: 'any_time' },
  { name: 'Cyclone / Hurricane', subtitle: 'Rotating low-pressure coastal storm system', sky: 'stormy', season: 'monsoon', temp: 'mild', precipitation: 'yes', windy: 'yes', dramatic: 'yes', timeOfDay: 'any_time' },
  { name: 'Dust Storm', subtitle: 'Swirling walls of dry windborne sand', sky: 'stormy', season: 'summer', temp: 'hot', precipitation: 'no', windy: 'yes', dramatic: 'yes', timeOfDay: 'daytime' },
  { name: 'Overcast Cloudy', subtitle: 'Uniform grey cloud cover without rain', sky: 'cloudy_fog', season: 'any_season', temp: 'mild', precipitation: 'no', windy: 'no', dramatic: 'no', timeOfDay: 'daytime' },
  { name: 'Dense Morning Fog', subtitle: 'Low-visibility misty blanket at dawn', sky: 'cloudy_fog', season: 'winter', temp: 'cold', precipitation: 'no', windy: 'no', dramatic: 'no', timeOfDay: 'morning_night' },
  { name: 'Breezy Autumn Wind', subtitle: 'Crisp gusts rustling dry leaves under clouds', sky: 'cloudy_fog', season: 'any_season', temp: 'mild', precipitation: 'no', windy: 'yes', dramatic: 'no', timeOfDay: 'any_time' },
  { name: 'Gentle Snowfall', subtitle: 'Soft snowflakes drifting quietly downward', sky: 'snowy_icy', season: 'winter', temp: 'cold', precipitation: 'yes', windy: 'no', dramatic: 'no', timeOfDay: 'any_time' },
  { name: 'Blizzard', subtitle: 'Whiteout snowstorm with fierce icy winds', sky: 'snowy_icy', season: 'winter', temp: 'cold', precipitation: 'yes', windy: 'yes', dramatic: 'yes', timeOfDay: 'any_time' },
  { name: 'Hailstorm', subtitle: 'Sudden frozen ice pellets falling from storm clouds', sky: 'snowy_icy', season: 'any_season', temp: 'cold', precipitation: 'yes', windy: 'yes', dramatic: 'yes', timeOfDay: 'daytime' },
  { name: 'Crisp Frosty Morning', subtitle: 'Clear freezing dawn with sparkling ice crystals', sky: 'snowy_icy', season: 'winter', temp: 'cold', precipitation: 'no', windy: 'no', dramatic: 'no', timeOfDay: 'morning_night' },
];

export const WEATHER_CANDIDATES: CandidateRecord[] = RAW_WEATHER.map((w) => ({
  id: `weather_${slugify(w.name)}`,
  category: 'weather',
  industry: null,
  name: w.name,
  subtitle: w.subtitle,
  releaseYear: null,
  endYear: null,
  decade: null,
  era: null,
  popularityPrior: 1.0,
  verified: true,
  attributes: {
    sky: w.sky,
    season: w.season,
    temp: w.temp,
    precipitation: w.precipitation,
    windy: w.windy,
    dramatic: w.dramatic,
    time_of_day: w.timeOfDay,
    keywords: w.name.toLowerCase(),
  },
}));

// ==================== ALPHABET (Complete 26 letters A–Z) ====================
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const CURVED_ONLY = new Set(['C', 'O', 'S', 'U']);
const STRAIGHT_ONLY = new Set(['A', 'E', 'F', 'H', 'I', 'K', 'L', 'M', 'N', 'T', 'V', 'W', 'X', 'Y', 'Z']);
const SYMMETRIC_V = new Set(['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y']);
const SYMMETRIC_H = new Set(['B', 'C', 'D', 'E', 'H', 'I', 'K', 'O', 'X']);
const COMMON_LETTERS = new Set(['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D', 'L', 'C']);

export const ALPHABET_CANDIDATES: CandidateRecord[] = Array.from({ length: 26 }, (_, idx) => {
  const pos = idx + 1;
  const ch = String.fromCharCode(65 + idx);
  const half = pos <= 13 ? 'first_half' : 'second_half';
  const quarter = pos <= 6 ? 'A_F' : pos <= 13 ? 'G_M' : pos <= 19 ? 'N_S' : 'T_Z';
  const shape = CURVED_ONLY.has(ch) ? 'curved' : STRAIGHT_ONLY.has(ch) ? 'straight' : 'mixed';
  const subHalf = pos <= 13 ? (pos <= 7 ? 'early' : 'late') : pos <= 20 ? 'early' : 'late';

  return {
    id: `alphabet_${ch.toLowerCase()}`,
    category: 'alphabet',
    industry: null,
    name: `Letter ${ch}`,
    subtitle: `Position #${pos} in the English alphabet · ${VOWELS.has(ch) ? 'Vowel' : 'Consonant'}`,
    releaseYear: null,
    endYear: null,
    decade: null,
    era: null,
    popularityPrior: 1.0,
    verified: true,
    attributes: {
      half,
      quarter,
      sub_half: subHalf,
      letter_type: VOWELS.has(ch) ? 'vowel' : 'consonant',
      shape,
      symmetric_vertical: SYMMETRIC_V.has(ch) ? 'yes' : 'no',
      symmetric_horizontal: SYMMETRIC_H.has(ch) ? 'yes' : 'no',
      position_parity: pos % 2 === 0 ? 'even' : 'odd',
      mod3: pos % 3 === 0 ? 'div3' : pos % 3 === 1 ? 'rem1' : 'rem2',
      common_english: COMMON_LETTERS.has(ch) ? 'yes' : 'no',
      keywords: ch.toLowerCase(),
    },
  };
});

// ==================== WORD (44 everyday vocabulary words) ====================
interface WordSeed {
  name: string;
  subtitle: string;
  semantic: 'emotion' | 'object' | 'nature' | 'abstract';
  pos: 'noun' | 'verb' | 'adjective';
  sentiment: 'positive' | 'negative' | 'neutral';
  tangible: 'yes' | 'no';
  keywords: string;
}

const RAW_WORDS: WordSeed[] = [
  { name: 'Love', subtitle: 'Deep affection & devotion', semantic: 'emotion', pos: 'noun', sentiment: 'positive', tangible: 'no', keywords: 'heart affection romance' },
  { name: 'Hope', subtitle: 'Expectation & trust in a brighter future', semantic: 'emotion', pos: 'noun', sentiment: 'positive', tangible: 'no', keywords: 'optimism future light' },
  { name: 'Fear', subtitle: 'Instinctive alarm toward perceived danger', semantic: 'emotion', pos: 'noun', sentiment: 'negative', tangible: 'no', keywords: 'scared anxiety dark' },
  { name: 'Joy', subtitle: 'Bright, sudden feeling of great pleasure', semantic: 'emotion', pos: 'noun', sentiment: 'positive', tangible: 'no', keywords: 'happy delight smile' },
  { name: 'Anger', subtitle: 'Strong feeling of annoyance or hostility', semantic: 'emotion', pos: 'noun', sentiment: 'negative', tangible: 'no', keywords: 'rage fury mad' },
  { name: 'Peace', subtitle: 'Calm freedom from disturbance or conflict', semantic: 'abstract', pos: 'noun', sentiment: 'positive', tangible: 'no', keywords: 'calm serene quiet harmony' },
  { name: 'Dream', subtitle: 'Visions during sleep or cherished ambitions', semantic: 'abstract', pos: 'noun', sentiment: 'positive', tangible: 'no', keywords: 'sleep ambition goal imagination' },
  { name: 'Time', subtitle: 'Continuous progression of past, present & future', semantic: 'abstract', pos: 'noun', sentiment: 'neutral', tangible: 'no', keywords: 'clock hours seconds life' },
  { name: 'Freedom', subtitle: 'Power to act, speak, and think without restraint', semantic: 'abstract', pos: 'noun', sentiment: 'positive', tangible: 'no', keywords: 'liberty independence wings' },
  { name: 'Courage', subtitle: 'Strength to face difficulty or uncertainty', semantic: 'abstract', pos: 'noun', sentiment: 'positive', tangible: 'no', keywords: 'brave hero bold' },
  { name: 'Silence', subtitle: 'Complete absence of sound', semantic: 'abstract', pos: 'noun', sentiment: 'neutral', tangible: 'no', keywords: 'quiet mute still' },
  { name: 'Chaos', subtitle: 'Complete disorder and unpredictability', semantic: 'abstract', pos: 'noun', sentiment: 'negative', tangible: 'no', keywords: 'mess disorder entropy' },
  { name: 'Ocean', subtitle: 'Vast expanse of saltwater covering Earth', semantic: 'nature', pos: 'noun', sentiment: 'neutral', tangible: 'yes', keywords: 'sea waves water blue' },
  { name: 'Mountain', subtitle: 'Towering natural elevation of Earth\'s crust', semantic: 'nature', pos: 'noun', sentiment: 'positive', tangible: 'yes', keywords: 'peak climb snow summit' },
  { name: 'Fire', subtitle: 'Combustion producing heat, flame, and light', semantic: 'nature', pos: 'noun', sentiment: 'neutral', tangible: 'yes', keywords: 'flame burn hot spark' },
  { name: 'Rain', subtitle: 'Water droplets falling from sky clouds', semantic: 'nature', pos: 'noun', sentiment: 'positive', tangible: 'yes', keywords: 'water monsoon drops umbrella' },
  { name: 'Star', subtitle: 'Luminous sphere of plasma shining in night sky', semantic: 'nature', pos: 'noun', sentiment: 'positive', tangible: 'yes', keywords: 'space night galaxy sky' },
  { name: 'Forest', subtitle: 'Dense ecosystem of trees and wildlife', semantic: 'nature', pos: 'noun', sentiment: 'positive', tangible: 'yes', keywords: 'trees woods green nature' },
  { name: 'Storm', subtitle: 'Violent atmospheric disturbance with wind & rain', semantic: 'nature', pos: 'noun', sentiment: 'negative', tangible: 'yes', keywords: 'thunder lightning wind' },
  { name: 'Shadow', subtitle: 'Dark shape cast when light is blocked', semantic: 'nature', pos: 'noun', sentiment: 'negative', tangible: 'no', keywords: 'dark shade silhouette' },
  { name: 'Book', subtitle: 'Bound pages carrying stories or knowledge', semantic: 'object', pos: 'noun', sentiment: 'positive', tangible: 'yes', keywords: 'read pages library story' },
  { name: 'Phone', subtitle: 'Pocket device for communication and apps', semantic: 'object', pos: 'noun', sentiment: 'neutral', tangible: 'yes', keywords: 'mobile call screen smartphone' },
  { name: 'Mirror', subtitle: 'Reflective glass surface showing your image', semantic: 'object', pos: 'noun', sentiment: 'neutral', tangible: 'yes', keywords: 'reflection glass look' },
  { name: 'Key', subtitle: 'Shaped metal piece that unlocks a door or secret', semantic: 'object', pos: 'noun', sentiment: 'neutral', tangible: 'yes', keywords: 'lock door open secret' },
  { name: 'Clock', subtitle: 'Instrument measuring and displaying hours', semantic: 'object', pos: 'noun', sentiment: 'neutral', tangible: 'yes', keywords: 'watch time tick hands' },
  { name: 'Compass', subtitle: 'Magnetic instrument pointing north', semantic: 'object', pos: 'noun', sentiment: 'positive', tangible: 'yes', keywords: 'direction north navigation' },
  { name: 'Guitar', subtitle: 'Six-stringed musical instrument', semantic: 'object', pos: 'noun', sentiment: 'positive', tangible: 'yes', keywords: 'music strings chords song' },
  { name: 'Crown', subtitle: 'Ornate headpiece symbolizing royalty', semantic: 'object', pos: 'noun', sentiment: 'positive', tangible: 'yes', keywords: 'king queen gold royal' },
  { name: 'Create', subtitle: 'To bring something new into existence', semantic: 'abstract', pos: 'verb', sentiment: 'positive', tangible: 'no', keywords: 'build make invent art' },
  { name: 'Explore', subtitle: 'To travel or investigate unfamiliar territory', semantic: 'abstract', pos: 'verb', sentiment: 'positive', tangible: 'no', keywords: 'discover adventure journey' },
  { name: 'Remember', subtitle: 'To recall a memory from the past', semantic: 'emotion', pos: 'verb', sentiment: 'neutral', tangible: 'no', keywords: 'memory mind past recall' },
  { name: 'Whisper', subtitle: 'To speak softly using breath rather than voice', semantic: 'abstract', pos: 'verb', sentiment: 'neutral', tangible: 'no', keywords: 'quiet secret soft voice' },
  { name: 'Shatter', subtitle: 'To break suddenly into many small pieces', semantic: 'object', pos: 'verb', sentiment: 'negative', tangible: 'no', keywords: 'break glass smash' },
  { name: 'Bright', subtitle: 'Radiating or reflecting generous light', semantic: 'nature', pos: 'adjective', sentiment: 'positive', tangible: 'no', keywords: 'shiny sun light smart' },
  { name: 'Mysterious', subtitle: 'Difficult to explain or full of intrigue', semantic: 'abstract', pos: 'adjective', sentiment: 'neutral', tangible: 'no', keywords: 'secret enigma unknown puzzle' },
  { name: 'Lonely', subtitle: 'Feeling sad from lacking companionship', semantic: 'emotion', pos: 'adjective', sentiment: 'negative', tangible: 'no', keywords: 'alone isolated quiet' },
  { name: 'Fearless', subtitle: 'Boldly acting without hesitation or dread', semantic: 'emotion', pos: 'adjective', sentiment: 'positive', tangible: 'no', keywords: 'brave bold strong' },
  { name: 'Ancient', subtitle: 'Belonging to the very distant past', semantic: 'abstract', pos: 'adjective', sentiment: 'neutral', tangible: 'no', keywords: 'old history ruins antique' },
];

export const WORD_CANDIDATES: CandidateRecord[] = RAW_WORDS.map((w) => {
  const clean = w.name.toUpperCase();
  const len = clean.length;
  const lenGroup = len <= 4 ? 'short_4' : len <= 6 ? 'medium_5_6' : 'long_7_plus';
  const startHalf = clean.charCodeAt(0) <= 77 ? 'A_M' : 'N_Z';
  const hasDouble = /(.)\1/.test(clean) ? 'yes' : 'no';
  const startsVowel = 'AEIOU'.includes(clean[0]) ? 'yes' : 'no';

  return {
    id: `word_${slugify(w.name)}`,
    category: 'word',
    industry: null,
    name: w.name,
    subtitle: `${w.subtitle} (${w.pos})`,
    releaseYear: null,
    endYear: null,
    decade: null,
    era: null,
    popularityPrior: 1.0,
    verified: true,
    attributes: {
      length_group: lenGroup,
      start_half: startHalf,
      starts_vowel: startsVowel,
      semantic: w.semantic,
      part_of_speech: w.pos,
      sentiment: w.sentiment,
      tangible: w.tangible,
      has_double_letter: hasDouble,
      keywords: w.keywords,
    },
  };
});
