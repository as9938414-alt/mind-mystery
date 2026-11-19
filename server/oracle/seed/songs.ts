import type { CandidateRecord, MediaEra } from '../types.ts';

interface SongSeedInput {
  name: string;
  industry: string;
  year: number;
  subtitle: string;
  genre: 'romantic' | 'pop_dance' | 'rock_anthem' | 'soulful_sad' | 'hiphop_rap' | 'classical_folk' | 'orchestral_theme';
  mood: 'uplifting' | 'heartbreak' | 'energetic' | 'chill';
  tempo: 'slow' | 'medium' | 'fast';
  vocals: 'solo_male' | 'solo_female' | 'duet' | 'group_band';
  origin: 'film' | 'independent';
  iconicHook: 'yes' | 'no';
  popularity?: number;
  keywords?: string;
}

function getEra(year: number): MediaEra {
  if (year < 1990) return 'classic';
  if (year < 2000) return '90s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

const RAW_SONGS: SongSeedInput[] = [
  // Bollywood (Hindi) - 24
  { name: 'Tum Hi Ho', industry: 'Bollywood (Hindi)', year: 2013, subtitle: 'Arijit Singh · Aashiqui 2', genre: 'romantic', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'arijit rain love aashiqui' },
  { name: 'Kesariya', industry: 'Bollywood (Hindi)', year: 2022, subtitle: 'Arijit Singh · Brahmastra', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'ranbir alia varanasi love storiyaan' },
  { name: 'Channa Mereya', industry: 'Bollywood (Hindi)', year: 2016, subtitle: 'Arijit Singh · Ae Dil Hai Mushkil', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'mehndi wedding heartbreak unrequited' },
  { name: 'Kal Ho Naa Ho', industry: 'Bollywood (Hindi)', year: 2003, subtitle: 'Sonu Nigam · Shankar-Ehsaan-Loy', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'srk new york live today' },
  { name: 'Chaiyya Chaiyya', industry: 'Bollywood (Hindi)', year: 1998, subtitle: 'Sukhwinder Singh · Dil Se', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'train dance srk rahman sufi' },
  { name: 'Kun Faya Kun', industry: 'Bollywood (Hindi)', year: 2011, subtitle: 'A. R. Rahman · Rockstar', genre: 'classical_folk', mood: 'chill', tempo: 'medium', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'qawwali dargah sufi peace' },
  { name: 'Tujhe Dekha To', industry: 'Bollywood (Hindi)', year: 1995, subtitle: 'Kumar Sanu & Lata Mangeshkar · DDLJ', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'mustard fields srk kajol' },
  { name: 'Lag Ja Gale', industry: 'Bollywood (Hindi)', year: 1964, subtitle: 'Lata Mangeshkar · Woh Kaun Thi', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'classic vintage longing lata' },
  { name: 'Badtameez Dil', industry: 'Bollywood (Hindi)', year: 2013, subtitle: 'Benny Dayal · YJHD', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'party ranbir dance wedding' },
  { name: 'Kar Gayi Chull', industry: 'Bollywood (Hindi)', year: 2016, subtitle: 'Badshah · Neha Kakkar', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'party rap alia sidharth' },
  { name: 'Apna Time Aayega', industry: 'Bollywood (Hindi)', year: 2019, subtitle: 'Ranveer Singh · Gully Boy', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'rap motivation street hip hop' },
  { name: 'Raataan Lambiyan', industry: 'Bollywood (Hindi)', year: 2021, subtitle: 'Jubin Nautiyal & Asees Kaur · Shershaah', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'army love soft romantic' },
  { name: 'Sadda Haq', industry: 'Bollywood (Hindi)', year: 2011, subtitle: 'Mohit Chauhan · Rockstar', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'guitar rock concert rebellion' },
  { name: 'Ghungroo', industry: 'Bollywood (Hindi)', year: 2019, subtitle: 'Arijit Singh & Shilpa Rao · War', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'beach dance hrithik disco' },
  { name: 'Tauba Tauba', industry: 'Bollywood (Hindi)', year: 2024, subtitle: 'Karan Aujla · Bad Newz', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'vicky kaushal footwork hook step punjabi' },
  { name: 'Aaj Ki Raat', industry: 'Bollywood (Hindi)', year: 2024, subtitle: 'Madhubanti Bagchi · Stree 2', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'tamannaah dance item stree' },
  { name: 'Tere Bina', industry: 'Bollywood (Hindi)', year: 2007, subtitle: 'A. R. Rahman & Chinmayi · Guru', genre: 'classical_folk', mood: 'chill', tempo: 'slow', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'sufi melodious rahman aishwarya' },
  { name: 'Pasoori', industry: 'Bollywood (Hindi)', year: 2022, subtitle: 'Ali Sethi & Shae Gill · Coke Studio', genre: 'classical_folk', mood: 'chill', tempo: 'medium', vocals: 'duet', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'coke studio punjabi fusion viral' },
  { name: 'Brown Munde', industry: 'Bollywood (Hindi)', year: 2020, subtitle: 'AP Dhillon & Gurinder Gill', genre: 'hiphop_rap', mood: 'energetic', tempo: 'medium', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.3, keywords: 'punjabi canada hiphop viral' },
  { name: 'Excuses', industry: 'Bollywood (Hindi)', year: 2020, subtitle: 'AP Dhillon & Gurinder Gill', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'medium', vocals: 'duet', origin: 'independent', iconicHook: 'yes', popularity: 1.25, keywords: 'kehndi hundi si chand tak punjabi' },
  { name: 'Husn', industry: 'Bollywood (Hindi)', year: 2023, subtitle: 'Anuv Jain', genre: 'soulful_sad', mood: 'chill', tempo: 'slow', vocals: 'solo_male', origin: 'independent', iconicHook: 'no', popularity: 1.25, keywords: 'acoustic guitar indie soft' },
  { name: 'Deva Shree Ganesha', industry: 'Bollywood (Hindi)', year: 2012, subtitle: 'Ajay Gogavale · Agneepath', genre: 'classical_folk', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'devotional festival dhol hrithik' },
  { name: 'Kala Chashma', industry: 'Bollywood (Hindi)', year: 2016, subtitle: 'Amar Arshi & Neha Kakkar', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'katrina sunglasses wedding dance' },
  { name: 'Pehla Nasha', industry: 'Bollywood (Hindi)', year: 1992, subtitle: 'Udit Narayan & Sadhana Sargam', genre: 'romantic', mood: 'chill', tempo: 'slow', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'slow motion first love aamir' },

  // Hollywood (English) - 24
  { name: 'Blinding Lights', industry: 'Hollywood (English)', year: 2019, subtitle: 'The Weeknd · After Hours', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'independent', iconicHook: 'yes', popularity: 1.45, keywords: 'synthwave 80s neon billboard record' },
  { name: 'Shape of You', industry: 'Hollywood (English)', year: 2017, subtitle: 'Ed Sheeran · Divide', genre: 'pop_dance', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'independent', iconicHook: 'yes', popularity: 1.45, keywords: 'marimba club pop streams' },
  { name: 'Bohemian Rhapsody', industry: 'Hollywood (English)', year: 1975, subtitle: 'Queen · Freddie Mercury', genre: 'rock_anthem', mood: 'energetic', tempo: 'medium', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.45, keywords: 'opera rock mama galileo classic' },
  { name: 'Believer', industry: 'Hollywood (English)', year: 2017, subtitle: 'Imagine Dragons · Evolve', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.4, keywords: 'pain drums workout anthem' },
  { name: 'My Heart Will Go On', industry: 'Hollywood (English)', year: 1997, subtitle: 'Celine Dion · Titanic', genre: 'romantic', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'titanic flute ballad ocean' },
  { name: 'Perfect', industry: 'Hollywood (English)', year: 2017, subtitle: 'Ed Sheeran', genre: 'romantic', mood: 'uplifting', tempo: 'slow', vocals: 'solo_male', origin: 'independent', iconicHook: 'yes', popularity: 1.4, keywords: 'wedding waltz dancing in the dark' },
  { name: 'Someone Like You', industry: 'Hollywood (English)', year: 2011, subtitle: 'Adele · 21', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_female', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'piano heartbreak ballad london' },
  { name: 'Anti-Hero', industry: 'Hollywood (English)', year: 2022, subtitle: 'Taylor Swift · Midnights', genre: 'pop_dance', mood: 'chill', tempo: 'medium', vocals: 'solo_female', origin: 'independent', iconicHook: 'yes', popularity: 1.4, keywords: 'its me hi im the problem pop' },
  { name: 'Cruel Summer', industry: 'Hollywood (English)', year: 2019, subtitle: 'Taylor Swift · Lover', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'solo_female', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'bridge synthpop eras tour' },
  { name: 'Lose Yourself', industry: 'Hollywood (English)', year: 2002, subtitle: 'Eminem · 8 Mile', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'mom spaghetti oscar rap motivation' },
  { name: 'See You Again', industry: 'Hollywood (English)', year: 2015, subtitle: 'Wiz Khalifa & Charlie Puth · Furious 7', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'medium', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'paul walker tribute fast furious piano' },
  { name: 'Shallow', industry: 'Hollywood (English)', year: 2018, subtitle: 'Lady Gaga & Bradley Cooper · A Star Is Born', genre: 'rock_anthem', mood: 'heartbreak', tempo: 'slow', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'oscar acoustic duet concert' },
  { name: 'Let It Go', industry: 'Hollywood (English)', year: 2013, subtitle: 'Idina Menzel · Frozen', genre: 'orchestral_theme', mood: 'uplifting', tempo: 'medium', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'disney elsa ice castle broadway' },
  { name: 'Espresso', industry: 'Hollywood (English)', year: 2024, subtitle: 'Sabrina Carpenter', genre: 'pop_dance', mood: 'uplifting', tempo: 'fast', vocals: 'solo_female', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'coffee summer pop viral' },
  { name: 'Die With A Smile', industry: 'Hollywood (English)', year: 2024, subtitle: 'Lady Gaga & Bruno Mars', genre: 'romantic', mood: 'heartbreak', tempo: 'slow', vocals: 'duet', origin: 'independent', iconicHook: 'yes', popularity: 1.4, keywords: 'ballad duet retro guitar' },
  { name: 'Not Like Us', industry: 'Hollywood (English)', year: 2024, subtitle: 'Kendrick Lamar', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'west coast diss grammy mustard' },
  { name: 'Billie Jean', industry: 'Hollywood (English)', year: 1983, subtitle: 'Michael Jackson · Thriller', genre: 'pop_dance', mood: 'energetic', tempo: 'medium', vocals: 'solo_male', origin: 'independent', iconicHook: 'yes', popularity: 1.4, keywords: 'moonwalk bassline glove king of pop' },
  { name: 'Smells Like Teen Spirit', industry: 'Hollywood (English)', year: 1991, subtitle: 'Nirvana · Nevermind', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'grunge 90s kurt cobain guitar' },
  { name: 'Hotel California', industry: 'Hollywood (English)', year: 1977, subtitle: 'Eagles', genre: 'rock_anthem', mood: 'chill', tempo: 'medium', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'guitar solo classic rock checkout' },
  { name: 'Sunflower', industry: 'Hollywood (English)', year: 2018, subtitle: 'Post Malone & Swae Lee · Spider-Verse', genre: 'hiphop_rap', mood: 'chill', tempo: 'medium', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'miles morales chill spiderman' },
  { name: 'Birds of a Feather', industry: 'Hollywood (English)', year: 2024, subtitle: 'Billie Eilish', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'solo_female', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'stick together synth pop' },
  { name: 'Uptown Funk', industry: 'Hollywood (English)', year: 2014, subtitle: 'Mark Ronson & Bruno Mars', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'funk brass party retro' },
  { name: 'Cornfield Chase', industry: 'Hollywood (English)', year: 2014, subtitle: 'Hans Zimmer · Interstellar', genre: 'orchestral_theme', mood: 'chill', tempo: 'medium', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'organ piano instrumental space' },
  { name: 'In the End', industry: 'Hollywood (English)', year: 2000, subtitle: 'Linkin Park · Hybrid Theory', genre: 'rock_anthem', mood: 'heartbreak', tempo: 'medium', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'nu metal piano rap rock chester' },

  // Tollywood (Telugu) - 18
  { name: 'Naatu Naatu', industry: 'Tollywood (Telugu)', year: 2022, subtitle: 'Rahul Sipligunj & Kaala Bhairava · RRR', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'oscar hook step dance suspenders' },
  { name: 'Oo Antava', industry: 'Tollywood (Telugu)', year: 2021, subtitle: 'Indravathi Chauhan · Pushpa', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'samantha item dance pushpa' },
  { name: 'Srivalli', industry: 'Tollywood (Telugu)', year: 2021, subtitle: 'Sid Sriram · Pushpa', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'slipper walk hook step allu arjun' },
  { name: 'Butta Bomma', industry: 'Tollywood (Telugu)', year: 2020, subtitle: 'Armaan Malik · Ala Vaikunthapurramuloo', genre: 'pop_dance', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'pooja hegde viral dance allu arjun' },
  { name: 'Samajavaragamana', industry: 'Tollywood (Telugu)', year: 2019, subtitle: 'Sid Sriram · Ala Vaikunthapurramuloo', genre: 'romantic', mood: 'chill', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'paris melody sid sriram' },
  { name: 'Inkem Inkem Inkem Kaavaale', industry: 'Tollywood (Telugu)', year: 2018, subtitle: 'Sid Sriram · Geetha Govindam', genre: 'romantic', mood: 'uplifting', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'vijay deverakonda rashmika sweet love' },
  { name: 'Dheevara', industry: 'Tollywood (Telugu)', year: 2015, subtitle: 'Ramya Behara · Baahubali', genre: 'orchestral_theme', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'waterfall climb epic keeravani' },
  { name: 'Chuttamalle', industry: 'Tollywood (Telugu)', year: 2024, subtitle: 'Shilpa Rao · Devara', genre: 'romantic', mood: 'chill', tempo: 'medium', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'janhvi ntr beach anirudh' },
  { name: 'Kurchi Madathapetti', industry: 'Tollywood (Telugu)', year: 2024, subtitle: 'Sahithi Chaganti · Guntur Kaaram', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'chair mass dance mahesh babu' },
  { name: 'Saami Saami', industry: 'Tollywood (Telugu)', year: 2021, subtitle: 'Mounika Yadav · Pushpa', genre: 'classical_folk', mood: 'energetic', tempo: 'fast', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'rashmika folk dance viral' },
  { name: 'Kalaavathi', industry: 'Tollywood (Telugu)', year: 2022, subtitle: 'Sid Sriram · Sarkaru Vaari Paata', genre: 'romantic', mood: 'chill', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'mahesh babu keerthy melody' },
  { name: 'Oh Sita Hey Rama', industry: 'Tollywood (Telugu)', year: 2022, subtitle: 'SPB Charan & Ramya Behara · Sita Ramam', genre: 'classical_folk', mood: 'uplifting', tempo: 'slow', vocals: 'duet', origin: 'film', iconicHook: 'no', popularity: 1.25, keywords: 'retro romance kashmir dulquer' },
  { name: 'Ringa Ringa', industry: 'Tollywood (Telugu)', year: 2009, subtitle: 'Priya Himesh · Arya 2', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'dsp party mass item song' },
  { name: 'Nuvvostanante Nenoddantana (Niluvaddam)', industry: 'Tollywood (Telugu)', year: 2005, subtitle: 'Karthik · DSP', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'duet', origin: 'film', iconicHook: 'no', popularity: 1.2, keywords: 'village romance siddharth trisha' },
  { name: 'Panchadara Bomma', industry: 'Tollywood (Telugu)', year: 2009, subtitle: 'Anuj Gurwara · Magadheera', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'ram charan kajal keeravani' },
  { name: 'Sivuni Aana', industry: 'Tollywood (Telugu)', year: 2015, subtitle: 'M. M. Keeravani · Baahubali', genre: 'classical_folk', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'shivalingam prabhas devotional epic' },
  { name: 'Telusa Telusa', industry: 'Tollywood (Telugu)', year: 2016, subtitle: 'Jubin Nautiyal · Sarrainodu', genre: 'romantic', mood: 'chill', tempo: 'slow', vocals: 'duet', origin: 'film', iconicHook: 'no', popularity: 1.2, keywords: 'allu arjun bolivia salt flats' },
  { name: 'Mind Block', industry: 'Tollywood (Telugu)', year: 2020, subtitle: 'Blaaze & Ranina Reddy · Sarileru Neekevvaru', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.2, keywords: 'mass dance beat mahesh babu' },

  // Kollywood (Tamil) - 18
  { name: 'Why This Kolaveri Di', industry: 'Kollywood (Tamil)', year: 2011, subtitle: 'Dhanush · Anirudh', genre: 'pop_dance', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'tanglish soup song viral youtube' },
  { name: 'Rowdy Baby', industry: 'Kollywood (Tamil)', year: 2018, subtitle: 'Dhanush & Dhee · Maari 2', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'sai pallavi billion views dance' },
  { name: 'Arabic Kuthu', industry: 'Kollywood (Tamil)', year: 2022, subtitle: 'Anirudh & Jonita Gandhi · Beast', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'halamithi habibo vijay pooja dance' },
  { name: 'Vaathi Coming', industry: 'Kollywood (Tamil)', year: 2020, subtitle: 'Anirudh · Master', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'shoulder drop vijay kuthu dance' },
  { name: 'Hukum', industry: 'Kollywood (Tamil)', year: 2023, subtitle: 'Anirudh · Jailer', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'tiger rajinikanth mass anthem' },
  { name: 'Kaavaalaa', industry: 'Kollywood (Tamil)', year: 2023, subtitle: 'Shilpa Rao & Anirudh · Jailer', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'tamannaah viral hook step' },
  { name: 'Munbe Vaa', industry: 'Kollywood (Tamil)', year: 2006, subtitle: 'Shreya Ghoshal · A. R. Rahman', genre: 'romantic', mood: 'chill', tempo: 'slow', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'suriya jyothika melody classical' },
  { name: 'Vaseegara', industry: 'Kollywood (Tamil)', year: 2001, subtitle: 'Bombay Jayashri · Minnale', genre: 'romantic', mood: 'chill', tempo: 'slow', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'rain melody madhavan timeless' },
  { name: 'Kannaana Kanney', industry: 'Kollywood (Tamil)', year: 2019, subtitle: 'Sid Sriram · Viswasam', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'no', popularity: 1.3, keywords: 'father daughter lullaby ajith' },
  { name: 'Enjoy Enjaami', industry: 'Kollywood (Tamil)', year: 2021, subtitle: 'Dhee & Arivu · Maajja', genre: 'hiphop_rap', mood: 'uplifting', tempo: 'medium', vocals: 'duet', origin: 'independent', iconicHook: 'yes', popularity: 1.4, keywords: 'cuckoo roots ancestors folk rap' },
  { name: 'Naa Ready', industry: 'Kollywood (Tamil)', year: 2023, subtitle: 'Vijay & Anirudh · Leo', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'mass dance celebration leo' },
  { name: 'Kaathalae Kaathalae', industry: 'Kollywood (Tamil)', year: 2018, subtitle: 'Chinmayi · 96', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_female', origin: 'film', iconicHook: 'no', popularity: 1.3, keywords: 'nostalgia violin school love' },
  { name: 'Kadhal Rojave', industry: 'Kollywood (Tamil)', year: 1992, subtitle: 'S. P. Balasubrahmanyam · Roja', genre: 'romantic', mood: 'heartbreak', tempo: 'slow', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'rahman classic rose kashmir' },
  { name: 'Vikram Title Track', industry: 'Kollywood (Tamil)', year: 2022, subtitle: 'Anirudh · Vikram', genre: 'orchestral_theme', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'eagle is coming bass bgm kamal' },
  { name: 'Nenjukkul Peidhidum', industry: 'Kollywood (Tamil)', year: 2008, subtitle: 'Hariharan · Vaaranam Aayiram', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'guitar train suriya harris jayaraj' },
  { name: 'Katchi Sera', industry: 'Kollywood (Tamil)', year: 2024, subtitle: 'Sai Abhyankkar', genre: 'pop_dance', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'independent', iconicHook: 'yes', popularity: 1.3, keywords: 'indie viral tamil pop 2024' },
  { name: 'Oru Kal Oru Kannadi', industry: 'Kollywood (Tamil)', year: 2009, subtitle: 'Yuvan Shankar Raja · Siva Manasula Sakthi', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'heartbreak yuvan classic soup' },
  { name: 'Aalaporan Thamizhan', industry: 'Kollywood (Tamil)', year: 2017, subtitle: 'Kailash Kher · Mersal', genre: 'classical_folk', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'tamil pride rahman festival vijay' },

  // Mollywood/Sandalwood - 16
  { name: 'Illuminati', industry: 'Mollywood/Sandalwood', year: 2024, subtitle: 'Dabzee · Sushin Shyam · Aavesham', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'ranga fahadh bangalore rap viral' },
  { name: 'Malare', industry: 'Mollywood/Sandalwood', year: 2015, subtitle: 'Vijay Yesudas · Premam', genre: 'romantic', mood: 'chill', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'sai pallavi college teacher melody' },
  { name: 'Jimikki Kammal', industry: 'Mollywood/Sandalwood', year: 2017, subtitle: 'Vineeth Sreenivasan · Velipadinte Pusthakam', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'earrings viral college dance onam' },
  { name: 'Varaha Roopam', industry: 'Mollywood/Sandalwood', year: 2022, subtitle: 'Sai Vignesh · Kantara', genre: 'classical_folk', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'climax divine rishab shetty bhoota kola' },
  { name: 'Toofan', industry: 'Mollywood/Sandalwood', year: 2022, subtitle: 'Ravi Basrur · K.G.F: Chapter 2', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'rocky mass chorus anthem yash' },
  { name: 'Salaam Rocky Bhai', industry: 'Mollywood/Sandalwood', year: 2018, subtitle: 'Vijay Prakash · K.G.F: Chapter 1', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'kgf elevation chorus anthem' },
  { name: 'Belageddu', industry: 'Mollywood/Sandalwood', year: 2016, subtitle: 'Vijay Prakash · Kirik Party', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'morning campus rashmika rakshit' },
  { name: 'Anisuthide', industry: 'Mollywood/Sandalwood', year: 2006, subtitle: 'Sonu Nigam · Mungaru Male', genre: 'romantic', mood: 'chill', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'rain kannada classic love' },
  { name: 'Dwapara', industry: 'Mollywood/Sandalwood', year: 2024, subtitle: 'Jaskaran Singh · Krishnam Pranaya Sakhi', genre: 'classical_folk', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'kannada viral melody 2024' },
  { name: 'Kuthanthram', industry: 'Mollywood/Sandalwood', year: 2024, subtitle: 'Vedan · Manjummel Boys', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'cave trip friends rap sushin' },
  { name: 'Jeevamshamayi', industry: 'Mollywood/Sandalwood', year: 2018, subtitle: 'K. S. Harisankar & Shreya Ghoshal · Theevandi', genre: 'romantic', mood: 'chill', tempo: 'slow', vocals: 'duet', origin: 'film', iconicHook: 'no', popularity: 1.25, keywords: 'tovino melody soft love' },
  { name: 'Aaradhike', industry: 'Mollywood/Sandalwood', year: 2019, subtitle: 'Sooraj Santhosh · Ambili', genre: 'romantic', mood: 'uplifting', tempo: 'medium', vocals: 'duet', origin: 'film', iconicHook: 'no', popularity: 1.25, keywords: 'cycling innocent love melody' },
  { name: 'Pala Palli', industry: 'Mollywood/Sandalwood', year: 2022, subtitle: 'Athul Narukara · Kaduva', genre: 'classical_folk', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'festival drum mass dance prithviraj' },
  { name: 'Oru Kathilola', industry: 'Mollywood/Sandalwood', year: 1998, subtitle: 'M. G. Sreekumar · Vettam', genre: 'pop_dance', mood: 'uplifting', tempo: 'fast', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.2, keywords: 'classic kerala nostalgia dance' },
  { name: 'Neela Nilave', industry: 'Mollywood/Sandalwood', year: 2023, subtitle: 'Kapil Kapilan · RDX', genre: 'romantic', mood: 'chill', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'retro romance viral 2023' },
  { name: 'Sapta Saagaradaache Ello Title Track', industry: 'Mollywood/Sandalwood', year: 2023, subtitle: 'Kapil Kapilan · Charan Raj', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'no', popularity: 1.25, keywords: 'ocean longing blue melody' },

  // Korean (K-Pop) - 18
  { name: 'Dynamite', industry: 'Korean (K-Pop)', year: 2020, subtitle: 'BTS · Disco Pop', genre: 'pop_dance', mood: 'uplifting', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.45, keywords: 'bts english disco billboard hot 100' },
  { name: 'Butter', industry: 'Korean (K-Pop)', year: 2021, subtitle: 'BTS · Dance Pop', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.4, keywords: 'smooth like butter bts yellow' },
  { name: 'Spring Day', industry: 'Korean (K-Pop)', year: 2017, subtitle: 'BTS · You Never Walk Alone', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'group_band', origin: 'independent', iconicHook: 'no', popularity: 1.35, keywords: 'queen of melon longing snow bts' },
  { name: 'Gangnam Style', industry: 'Korean (K-Pop)', year: 2012, subtitle: 'PSY · Viral Anthem', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'independent', iconicHook: 'yes', popularity: 1.45, keywords: 'horse dance oppa youtube first billion' },
  { name: 'DDU-DU DDU-DU', industry: 'Korean (K-Pop)', year: 2018, subtitle: 'BLACKPINK · Square Up', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.45, keywords: 'finger guns blackpink girl crush' },
  { name: 'How You Like That', industry: 'Korean (K-Pop)', year: 2020, subtitle: 'BLACKPINK · The Album', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.4, keywords: 'hanbok fierce drop blackpink' },
  { name: 'APT.', industry: 'Korean (K-Pop)', year: 2024, subtitle: 'ROSÉ & Bruno Mars', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'duet', origin: 'independent', iconicHook: 'yes', popularity: 1.45, keywords: 'apateu drinking game viral 2024' },
  { name: 'Seven', industry: 'Korean (K-Pop)', year: 2023, subtitle: 'Jungkook feat. Latto', genre: 'pop_dance', mood: 'uplifting', tempo: 'fast', vocals: 'duet', origin: 'independent', iconicHook: 'yes', popularity: 1.4, keywords: 'monday tuesday uk garage bts solo' },
  { name: 'Cupid', industry: 'Korean (K-Pop)', year: 2023, subtitle: 'FIFTY FIFTY · Twin Version', genre: 'romantic', mood: 'chill', tempo: 'medium', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'hopeless romantic viral reels soft' },
  { name: 'Super Shy', industry: 'Korean (K-Pop)', year: 2023, subtitle: 'NewJeans · Get Up', genre: 'pop_dance', mood: 'uplifting', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'waacking flash mob jersey club' },
  { name: 'Ditto', industry: 'Korean (K-Pop)', year: 2022, subtitle: 'NewJeans · Nostalgic Pop', genre: 'soulful_sad', mood: 'chill', tempo: 'medium', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'camcorder winter school nostalgia' },
  { name: 'Love Scenario', industry: 'Korean (K-Pop)', year: 2018, subtitle: 'iKON', genre: 'romantic', mood: 'chill', tempo: 'medium', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.3, keywords: 'piano singalong elementary schools' },
  { name: 'Money', industry: 'Korean (K-Pop)', year: 2021, subtitle: 'LISA · Solo', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'solo_female', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'dollar bills dropping rap blackpink' },
  { name: 'Stay With Me', industry: 'Korean (K-Pop)', year: 2016, subtitle: 'Chanyeol & Punch · Goblin OST', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'duet', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'goblin kdrama guitar haunted ost' },
  { name: 'God\'s Menu', industry: 'Korean (K-Pop)', year: 2020, subtitle: 'Stray Kids', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.3, keywords: 'du du du cooking chef bass' },
  { name: 'Magnetic', industry: 'Korean (K-Pop)', year: 2024, subtitle: 'ILLIT', genre: 'pop_dance', mood: 'uplifting', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.35, keywords: 'super 이끌림 finger dance debut' },
  { name: 'Gee', industry: 'Korean (K-Pop)', year: 2009, subtitle: 'Girls\' Generation (SNSD)', genre: 'pop_dance', mood: 'uplifting', tempo: 'fast', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.3, keywords: 'mannequins colorful jeans classic kpop' },
  { name: 'Haru Haru', industry: 'Korean (K-Pop)', year: 2008, subtitle: 'BIGBANG', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'medium', vocals: 'group_band', origin: 'independent', iconicHook: 'yes', popularity: 1.25, keywords: 'day by day piano hiphop tragedy' },

  // Web Series OST - 14
  { name: 'Bella Ciao', industry: 'Web Series OST', year: 2017, subtitle: 'Money Heist Anthem', genre: 'classical_folk', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'italian partisan professor berlin heist' },
  { name: 'Game of Thrones Main Title', industry: 'Web Series OST', year: 2011, subtitle: 'Ramin Djawadi · HBO', genre: 'orchestral_theme', mood: 'energetic', tempo: 'medium', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'cello map opening credits westeros' },
  { name: 'Scam 1992 Theme', industry: 'Web Series OST', year: 2020, subtitle: 'Achint Thakkar · SonyLIV', genre: 'orchestral_theme', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'ringtone synth bass stock market' },
  { name: 'Running Up That Hill', industry: 'Web Series OST', year: 1985, subtitle: 'Kate Bush · Stranger Things S4', genre: 'rock_anthem', mood: 'heartbreak', tempo: 'medium', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'max vecna headphones synth 80s' },
  { name: 'I\'ll Be There for You', industry: 'Web Series OST', year: 1994, subtitle: 'The Rembrandts · Friends', genre: 'rock_anthem', mood: 'uplifting', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'four claps fountain sofa sitcom' },
  { name: 'Red Right Hand', industry: 'Web Series OST', year: 1994, subtitle: 'Nick Cave · Peaky Blinders', genre: 'rock_anthem', mood: 'chill', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'bell chime thomas shelby dark' },
  { name: 'Stranger Things Main Theme', industry: 'Web Series OST', year: 2016, subtitle: 'Kyle Dixon & Michael Stein', genre: 'orchestral_theme', mood: 'chill', tempo: 'medium', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'arpeggio synth 80s glowing red title' },
  { name: 'Pink Soldiers', industry: 'Web Series OST', year: 2021, subtitle: 'Jung Jae-il · Squid Game', genre: 'orchestral_theme', mood: 'energetic', tempo: 'medium', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'recorders masked guards stairs' },
  { name: 'Mirzapur Theme', industry: 'Web Series OST', year: 2018, subtitle: 'Anand Bhaskar · Prime Video', genre: 'orchestral_theme', mood: 'energetic', tempo: 'medium', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'electric guitar rustic gangster' },
  { name: 'Tuyo', industry: 'Web Series OST', year: 2015, subtitle: 'Rodrigo Amarante · Narcos', genre: 'romantic', mood: 'chill', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'spanish bolero guitar escobar' },
  { name: 'Goodbye', industry: 'Web Series OST', year: 2017, subtitle: 'Apparat · Dark Opening', genre: 'soulful_sad', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'no', popularity: 1.3, keywords: 'fold out your hands kaleidoscope dark' },
  { name: 'Succession Main Title', industry: 'Web Series OST', year: 2018, subtitle: 'Nicholas Britell · HBO', genre: 'orchestral_theme', mood: 'chill', tempo: 'medium', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'piano hiphop beat strings billionaire' },
  { name: 'Toss a Coin to Your Witcher', industry: 'Web Series OST', year: 2019, subtitle: 'Joey Batey · The Witcher', genre: 'classical_folk', mood: 'uplifting', tempo: 'medium', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.25, keywords: 'bard lute jaskier geralt valley of plenty' },
  { name: 'Paint It Black (Cello)', industry: 'Web Series OST', year: 2022, subtitle: 'Wednesday Addams · Netflix', genre: 'orchestral_theme', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.3, keywords: 'balcony cello dark goth' },

  // Anime OST - 16
  { name: 'Unravel', industry: 'Anime OST', year: 2014, subtitle: 'TK from Ling tosite sigure · Tokyo Ghoul', genre: 'rock_anthem', mood: 'heartbreak', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'oshiete yo acoustic to screaming rock' },
  { name: 'Blue Bird', industry: 'Anime OST', year: 2008, subtitle: 'Ikimonogakari · Naruto Shippuden', genre: 'pop_dance', mood: 'uplifting', tempo: 'fast', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'habataitara flute opening 3 naruto' },
  { name: 'Gurenge', industry: 'Anime OST', year: 2019, subtitle: 'LiSA · Demon Slayer', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'red lotus tanjiro opening sword' },
  { name: 'Guren no Yumiya', industry: 'Anime OST', year: 2013, subtitle: 'Linked Horizon · Attack on Titan', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'sie sind das essen jaeger choir' },
  { name: 'Idol', industry: 'Anime OST', year: 2023, subtitle: 'YOASOBI · Oshi no Ko', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'ai hoshino star eyes billboard global' },
  { name: 'Suzume', industry: 'Anime OST', year: 2022, subtitle: 'RADWIMPS feat. Toaka', genre: 'classical_folk', mood: 'chill', tempo: 'slow', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'ru ru ru haunting melody doors' },
  { name: 'Sparkle', industry: 'Anime OST', year: 2016, subtitle: 'RADWIMPS · Your Name', genre: 'romantic', mood: 'heartbreak', tempo: 'slow', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'piano comet twilight meteor' },
  { name: 'A Cruel Angel\'s Thesis', industry: 'Anime OST', year: 1995, subtitle: 'Yoko Takahashi · Evangelion', genre: 'pop_dance', mood: 'energetic', tempo: 'fast', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: '90s brass classic mecha karaoke' },
  { name: 'Kick Back', industry: 'Anime OST', year: 2022, subtitle: 'Kenshi Yonezu · Chainsaw Man', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'chaotic bassline denji cinema references' },
  { name: 'Kaikai Kitan', industry: 'Anime OST', year: 2020, subtitle: 'Eve · Jujutsu Kaisen', genre: 'rock_anthem', mood: 'energetic', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.4, keywords: 'jjk opening 1 fast guitar' },
  { name: 'Bling-Bang-Bang-Born', industry: 'Anime OST', year: 2024, subtitle: 'Creepy Nuts · Mashle', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.45, keywords: 'viral dance jersey club magic muscles' },
  { name: 'Otonoke', industry: 'Anime OST', year: 2024, subtitle: 'Creepy Nuts · Dandadan', genre: 'hiphop_rap', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'aliens ghosts fast rap 2024' },
  { name: 'We Are!', industry: 'Anime OST', year: 1999, subtitle: 'Hiroshi Kitadani · One Piece', genre: 'pop_dance', mood: 'uplifting', tempo: 'fast', vocals: 'solo_male', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'pirate anthem opening 1 adventure' },
  { name: 'The World', industry: 'Anime OST', year: 2006, subtitle: 'Nightmare · Death Note', genre: 'rock_anthem', mood: 'heartbreak', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'gothic rock light yagami apples' },
  { name: 'Again', industry: 'Anime OST', year: 2009, subtitle: 'YUI · Fullmetal Alchemist: Brotherhood', genre: 'rock_anthem', mood: 'uplifting', tempo: 'fast', vocals: 'solo_female', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: 'fast verse acoustic guitar opening 1' },
  { name: 'Tank!', industry: 'Anime OST', year: 1998, subtitle: 'Seatbelts · Cowboy Bebop', genre: 'orchestral_theme', mood: 'energetic', tempo: 'fast', vocals: 'group_band', origin: 'film', iconicHook: 'yes', popularity: 1.35, keywords: '3 2 1 lets jam big band jazz saxophone' },
];

export const SONG_CANDIDATES: CandidateRecord[] = RAW_SONGS.map((s) => {
  const era = getEra(s.year);
  const decade = `${Math.floor(s.year / 10) * 10}s`;
  return {
    id: `song_${slugify(s.industry)}_${slugify(s.name)}`,
    category: 'song',
    industry: s.industry,
    name: s.name,
    subtitle: s.subtitle,
    releaseYear: s.year,
    endYear: null,
    decade,
    era,
    popularityPrior: s.popularity ?? 1.0,
    verified: true,
    attributes: {
      genre: s.genre,
      mood: s.mood,
      tempo: s.tempo,
      vocals: s.vocals,
      origin: s.origin,
      era,
      before_2015: s.year < 2015 ? 'yes' : 'no',
      before_2020: s.year < 2020 ? 'yes' : 'no',
      iconic_hook: s.iconicHook,
      keywords: s.keywords ?? '',
    },
  };
});
