import type { CandidateRecord, MediaEra } from '../types.ts';

interface SingerSeedInput {
  name: string;
  industry: string;
  debutYear: number;
  subtitle: string;
  gender: 'male' | 'female' | 'group';
  genre: 'romantic_melody' | 'pop_dance' | 'hiphop_rap' | 'rock_indie' | 'classical_sufi';
  singerType: 'playback' | 'independent';
  format: 'solo' | 'band';
  voiceType: 'soulful' | 'energetic' | 'classical' | 'pop_smooth' | 'rap_rhythmic';
  stillActive: 'yes' | 'no';
  multiLingual: 'yes' | 'no';
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

const RAW_SINGERS: SingerSeedInput[] = [
  // Bollywood (Hindi) - 18
  { name: 'Arijit Singh', industry: 'Bollywood (Hindi)', debutYear: 2011, subtitle: 'Tum Hi Ho, Channa Mereya, Kesariya', gender: 'male', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.48, keywords: 'spotify most followed bengali romantic' },
  { name: 'Shreya Ghoshal', industry: 'Bollywood (Hindi)', debutYear: 2002, subtitle: 'Devdas, Munbe Vaa, Teri Ore', gender: 'female', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'yes', multiLingual: 'yes', popularity: 1.45, keywords: 'five national awards nightingale melody' },
  { name: 'Sonu Nigam', industry: 'Bollywood (Hindi)', debutYear: 1993, subtitle: 'Kal Ho Naa Ho, Abhi Mujh Mein Kahin', gender: 'male', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.42, keywords: 'versatile modern rafi sa re ga ma' },
  { name: 'Lata Mangeshkar', industry: 'Bollywood (Hindi)', debutYear: 1942, subtitle: 'Nightingale of India · Lag Ja Gale', gender: 'female', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'no', multiLingual: 'yes', popularity: 1.45, keywords: 'bharat ratna legend thousands of songs' },
  { name: 'Kishore Kumar', industry: 'Bollywood (Hindi)', debutYear: 1948, subtitle: 'Mere Sapno Ki Rani · Yodeling Icon', gender: 'male', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'no', multiLingual: 'yes', popularity: 1.42, keywords: 'yodeling actor comedian evergreen' },
  { name: 'A. R. Rahman', industry: 'Bollywood (Hindi)', debutYear: 1992, subtitle: 'Mozart of Madras · Kun Faya Kun', gender: 'male', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.45, keywords: 'two oscars composer sufi jai ho' },
  { name: 'Sunidhi Chauhan', industry: 'Bollywood (Hindi)', debutYear: 1996, subtitle: 'Beedi, Sheila Ki Jawani, Kamli', gender: 'female', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.35, keywords: 'powerhouse live performer dance' },
  { name: 'KK (Krishnakumar Kunnath)', industry: 'Bollywood (Hindi)', debutYear: 1999, subtitle: 'Pal, Yaaron, Zara Sa, Tadap Tadap', gender: 'male', genre: 'rock_indie', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'no', multiLingual: 'yes', popularity: 1.4, keywords: 'friendship college nostalgia high notes' },
  { name: 'Diljit Dosanjh', industry: 'Bollywood (Hindi)', debutYear: 2004, subtitle: 'Lover, G.O.A.T., Coachella Icon', gender: 'male', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.45, keywords: 'punjabi turban coachella actor' },
  { name: 'Badshah', industry: 'Bollywood (Hindi)', debutYear: 2012, subtitle: 'DJ Waley Babu, Kar Gayi Chull', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.35, keywords: 'party rap its your boy' },
  { name: 'Yo Yo Honey Singh', industry: 'Bollywood (Hindi)', debutYear: 2005, subtitle: 'Brown Rang, Lungi Dance, Desi Kalakaar', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.38, keywords: 'bluetooth era punjabi rap party' },
  { name: 'Neha Kakkar', industry: 'Bollywood (Hindi)', debutYear: 2008, subtitle: 'Kala Chashma, Dilbar, London Thumakda', gender: 'female', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.32, keywords: 'indian idol party hits' },
  { name: 'Mohit Chauhan', industry: 'Bollywood (Hindi)', debutYear: 1998, subtitle: 'Rockstar, Tum Se Hi, Masakali', gender: 'male', genre: 'rock_indie', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.32, keywords: 'silk route dooba dooba soft rock' },
  { name: 'Atif Aslam', industry: 'Bollywood (Hindi)', debutYear: 2004, subtitle: 'Tera Hone Laga Hoon, Jeene Laga Hoon', gender: 'male', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.38, keywords: 'jal band aadat romantic high voice' },
  { name: 'Jubin Nautiyal', industry: 'Bollywood (Hindi)', debutYear: 2014, subtitle: 'Raataan Lambiyan, Lut Gaye', gender: 'male', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.32, keywords: 'uttarakhand romantic bhajan' },
  { name: 'Anuv Jain', industry: 'Bollywood (Hindi)', debutYear: 2018, subtitle: 'Baarishein, Husn, Alag Aasmaan', gender: 'male', genre: 'rock_indie', singerType: 'independent', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.3, keywords: 'acoustic guitar indie bedroom pop' },
  { name: 'Mohammed Rafi', industry: 'Bollywood (Hindi)', debutYear: 1945, subtitle: 'Kya Hua Tera Wada · Golden Era', gender: 'male', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'no', multiLingual: 'yes', popularity: 1.38, keywords: 'golden era versatile classic' },
  { name: 'Karan Aujla', industry: 'Bollywood (Hindi)', debutYear: 2016, subtitle: 'Tauba Tauba, Softly · Making Memories', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.35, keywords: 'geetan di machine punjabi lyricist' },

  // Hollywood (English) - 18
  { name: 'Taylor Swift', industry: 'Hollywood (English)', debutYear: 2006, subtitle: 'The Eras Tour · 14-Time Grammy Winner', gender: 'female', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.48, keywords: 'swifties midnights cardigan songwriter' },
  { name: 'The Weeknd', industry: 'Hollywood (English)', debutYear: 2010, subtitle: 'Blinding Lights, Starboy, After Hours', gender: 'male', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.45, keywords: 'abel falsetto synthwave canadian' },
  { name: 'Ed Sheeran', industry: 'Hollywood (English)', debutYear: 2011, subtitle: 'Shape of You, Perfect, Divide', gender: 'male', genre: 'romantic_melody', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.45, keywords: 'loop pedal acoustic guitar red hair british' },
  { name: 'Adele', industry: 'Hollywood (English)', debutYear: 2008, subtitle: 'Hello, Someone Like You, Skyfall', gender: 'female', genre: 'romantic_melody', singerType: 'independent', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.42, keywords: '16 grammys london piano powerhouse' },
  { name: 'Billie Eilish', industry: 'Hollywood (English)', debutYear: 2015, subtitle: 'Bad Guy, Birds of a Feather, What Was I Made For', gender: 'female', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.42, keywords: 'two oscars whisper pop finneas baggy' },
  { name: 'Eminem', industry: 'Hollywood (English)', debutYear: 1996, subtitle: 'Lose Yourself, Rap God, Stan', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.45, keywords: 'slim shady detroit fast rap' },
  { name: 'Kendrick Lamar', industry: 'Hollywood (English)', debutYear: 2011, subtitle: 'HUMBLE., Not Like Us · Pulitzer Winner', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.42, keywords: 'compton pulitzer super bowl lyricist' },
  { name: 'Drake', industry: 'Hollywood (English)', debutYear: 2009, subtitle: 'God\'s Plan, One Dance, Hotline Bling', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'toronto ovo streams rapper singer' },
  { name: 'Michael Jackson', industry: 'Hollywood (English)', debutYear: 1964, subtitle: 'King of Pop · Thriller, Billie Jean', gender: 'male', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'energetic', stillActive: 'no', multiLingual: 'no', popularity: 1.48, keywords: 'moonwalk glove legend pop' },
  { name: 'Bruno Mars', industry: 'Hollywood (English)', debutYear: 2010, subtitle: 'Uptown Funk, Die With A Smile', gender: 'male', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'no', popularity: 1.42, keywords: 'funk silk sonic hawaiian showman' },
  { name: 'Beyonce', industry: 'Hollywood (English)', debutYear: 1997, subtitle: 'Queen Bey · Halo, Crazy in Love', gender: 'female', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'no', popularity: 1.42, keywords: 'most grammys destinys child renaissance' },
  { name: 'Lady Gaga', industry: 'Hollywood (English)', debutYear: 2008, subtitle: 'Shallow, Bad Romance, Poker Face', gender: 'female', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'no', popularity: 1.38, keywords: 'oscar theatrical fashion piano' },
  { name: 'Justin Bieber', industry: 'Hollywood (English)', debutYear: 2009, subtitle: 'Baby, Sorry, Peaches, Stay', gender: 'male', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'youtube discovery canadian pop' },
  { name: 'Coldplay', industry: 'Hollywood (English)', debutYear: 1997, subtitle: 'Yellow, Fix You, Viva La Vida', gender: 'group', genre: 'rock_indie', singerType: 'independent', format: 'band', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.42, keywords: 'chris martin wristbands stadium tour' },
  { name: 'Queen', industry: 'Hollywood (English)', debutYear: 1970, subtitle: 'Freddie Mercury · Bohemian Rhapsody', gender: 'group', genre: 'rock_indie', singerType: 'independent', format: 'band', voiceType: 'energetic', stillActive: 'no', multiLingual: 'no', popularity: 1.42, keywords: 'live aid stadium rock classic' },
  { name: 'Imagine Dragons', industry: 'Hollywood (English)', debutYear: 2008, subtitle: 'Believer, Thunder, Radioactive', gender: 'group', genre: 'rock_indie', singerType: 'independent', format: 'band', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'no', popularity: 1.38, keywords: 'dan reynolds drums arena rock' },
  { name: 'Ariana Grande', industry: 'Hollywood (English)', debutYear: 2013, subtitle: '7 rings, Thank U Next, Wicked', gender: 'female', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.38, keywords: 'high whistle register ponytail' },
  { name: 'Sabrina Carpenter', industry: 'Hollywood (English)', debutYear: 2015, subtitle: 'Espresso, Please Please Please', gender: 'female', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.35, keywords: 'short n sweet pop star 2024' },

  // Tollywood (Telugu) - 10
  { name: 'S. P. Balasubrahmanyam', industry: 'Tollywood (Telugu)', debutYear: 1966, subtitle: 'SPB · 40,000+ Songs Legend', gender: 'male', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'no', multiLingual: 'yes', popularity: 1.45, keywords: 'guinness record six national awards' },
  { name: 'Sid Sriram', industry: 'Tollywood (Telugu)', debutYear: 2013, subtitle: 'Srivalli, Samajavaragamana, Inkem Inkem', gender: 'male', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.45, keywords: 'carnatic r&b berklee voice' },
  { name: 'Rahul Sipligunj', industry: 'Tollywood (Telugu)', debutYear: 2009, subtitle: 'Naatu Naatu · Oscar Stage Performer', gender: 'male', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'no', popularity: 1.38, keywords: 'hyderabad bigg boss oscar' },
  { name: 'K. S. Chithra', industry: 'Tollywood (Telugu)', debutYear: 1979, subtitle: 'Nightingale of South India', gender: 'female', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'yes', multiLingual: 'yes', popularity: 1.38, keywords: 'six national awards melodious' },
  { name: 'Sunitha Upadrashta', industry: 'Tollywood (Telugu)', debutYear: 1995, subtitle: 'Telugu Playback & Dubbing Icon', gender: 'female', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.25, keywords: 'nandi awards melody anchor' },
  { name: 'Mangli', industry: 'Tollywood (Telugu)', debutYear: 2018, subtitle: 'Ramuloo Ramulaa, Saranga Dariya', gender: 'female', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.32, keywords: 'telangana folk high energy' },
  { name: 'Kaala Bhairava', industry: 'Tollywood (Telugu)', debutYear: 2015, subtitle: 'Naatu Naatu, Dheevara, Komuram Bheemudo', gender: 'male', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.35, keywords: 'keeravani son oscar stage' },
  { name: 'Devi Sri Prasad (DSP)', industry: 'Tollywood (Telugu)', debutYear: 1999, subtitle: 'Rockstar DSP · Pushpa, Arya', gender: 'male', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.35, keywords: 'composer mass beats national award' },
  { name: 'Karthik', industry: 'Tollywood (Telugu)', debutYear: 2001, subtitle: 'Niluvaddam, Chiru Chiru', gender: 'male', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'yes', popularity: 1.3, keywords: 'smooth breeze melody south' },
  { name: 'Ghantasala', industry: 'Tollywood (Telugu)', debutYear: 1945, subtitle: 'Mayabazar · Classic Golden Voice', gender: 'male', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'no', multiLingual: 'yes', popularity: 1.25, keywords: 'bhagavad gita golden era legend' },

  // Kollywood (Tamil) - 10
  { name: 'Anirudh Ravichander', industry: 'Kollywood (Tamil)', debutYear: 2011, subtitle: 'Rockstar · Hukum, Arabic Kuthu, Vaathi Coming', gender: 'male', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.48, keywords: 'kolaveri bgm king concert' },
  { name: 'Ilaiyaraaja', industry: 'Kollywood (Tamil)', debutYear: 1976, subtitle: 'Isaignani · Maestro of 1000+ Films', gender: 'male', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'yes', multiLingual: 'yes', popularity: 1.42, keywords: 'symphony folk maestro padma vibhushan' },
  { name: 'Hariharan', industry: 'Kollywood (Tamil)', debutYear: 1977, subtitle: 'Nenjukkul Peidhidum, Uyire', gender: 'male', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'yes', multiLingual: 'yes', popularity: 1.35, keywords: 'ghazal colonial cousins rahman' },
  { name: 'Chinmayi Sripada', industry: 'Kollywood (Tamil)', debutYear: 2002, subtitle: 'Kaathalae Kaathalae, Tere Bina', gender: 'female', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.35, keywords: '96 dubbing samantha voice' },
  { name: 'Yuvan Shankar Raja', industry: 'Kollywood (Tamil)', debutYear: 1997, subtitle: 'U1 · Oru Kal Oru Kannadi', gender: 'male', genre: 'rock_indie', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.38, keywords: 'drugs bgm heartbreak youth king' },
  { name: 'Dhee', industry: 'Kollywood (Tamil)', debutYear: 2013, subtitle: 'Rowdy Baby, Enjoy Enjaami', gender: 'female', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.38, keywords: 'unique husky voice santhosh narayanan' },
  { name: 'Shankar Mahadevan', industry: 'Kollywood (Tamil)', debutYear: 1998, subtitle: 'Breathless · National Award Winner', gender: 'male', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'yes', multiLingual: 'yes', popularity: 1.38, keywords: 'shakti grammy breathless trio' },
  { name: 'S. Janaki', industry: 'Kollywood (Tamil)', debutYear: 1957, subtitle: 'Nightingale of the South', gender: 'female', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'no', multiLingual: 'yes', popularity: 1.3, keywords: 'four national awards expressive' },
  { name: 'Pradeep Kumar', industry: 'Kollywood (Tamil)', debutYear: 2010, subtitle: 'Aagayam Theepidicha, Life of Ram', gender: 'male', genre: 'rock_indie', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.3, keywords: 'haunting acoustic soulful 96' },
  { name: 'Jonita Gandhi', industry: 'Kollywood (Tamil)', debutYear: 2013, subtitle: 'Arabic Kuthu, Mental Manadhil', gender: 'female', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'yes', popularity: 1.32, keywords: 'indo canadian bilingual pop' },

  // Mollywood/Sandalwood - 10
  { name: 'K. J. Yesudas', industry: 'Mollywood/Sandalwood', debutYear: 1961, subtitle: 'Gaanagandharvan · 8 National Awards', gender: 'male', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'no', multiLingual: 'yes', popularity: 1.45, keywords: 'celestial singer white kurta legend' },
  { name: 'Vijay Prakash', industry: 'Mollywood/Sandalwood', debutYear: 2000, subtitle: 'Belageddu, Salaam Rocky Bhai, Jai Ho', gender: 'male', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.38, keywords: 'mysuru kannada jai ho' },
  { name: 'Vineeth Sreenivasan', industry: 'Mollywood/Sandalwood', debutYear: 2003, subtitle: 'Jimikki Kammal · Singer-Director', gender: 'male', genre: 'pop_dance', singerType: 'playback', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.38, keywords: 'hridayam actor director feel good' },
  { name: 'Vijay Yesudas', industry: 'Mollywood/Sandalwood', debutYear: 2000, subtitle: 'Malare · Premam', gender: 'male', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.35, keywords: 'yesudas son smooth melody' },
  { name: 'Sushin Shyam', industry: 'Mollywood/Sandalwood', debutYear: 2014, subtitle: 'Aavesham, Manjummel Boys, Kumbalangi', gender: 'male', genre: 'rock_indie', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'no', popularity: 1.38, keywords: 'the down troddence hitmaker composer' },
  { name: 'Dabzee', industry: 'Mollywood/Sandalwood', debutYear: 2022, subtitle: 'Illuminati, Manavaalan Thug', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.35, keywords: 'malabar rap aavesham viral' },
  { name: 'Sujatha Mohan', industry: 'Mollywood/Sandalwood', debutYear: 1975, subtitle: 'Evergreen Malayalam & Tamil Melody', gender: 'female', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'yes', multiLingual: 'yes', popularity: 1.3, keywords: 'sweet timeless voice rahman' },
  { name: 'Sanjith Hegde', industry: 'Mollywood/Sandalwood', debutYear: 2017, subtitle: 'Shaakuntle Sikkalu · Modern Kannada', gender: 'male', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.32, keywords: 'sa re ga ma kannada indie' },
  { name: 'Sithara Krishnakumar', industry: 'Mollywood/Sandalwood', debutYear: 2007, subtitle: 'Project Malabaricus · State Award Winner', gender: 'female', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'yes', multiLingual: 'yes', popularity: 1.28, keywords: 'fusion classical band kerala' },
  { name: 'Rajesh Krishnan', industry: 'Mollywood/Sandalwood', debutYear: 1991, subtitle: 'Usire Usire · Kannada Playback Icon', gender: 'male', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.28, keywords: 'kannada 90s 2000s melody' },

  // Korean (K-Pop) - 12
  { name: 'BTS', industry: 'Korean (K-Pop)', debutYear: 2013, subtitle: 'Dynamite, Butter, Spring Day', gender: 'group', genre: 'pop_dance', singerType: 'independent', format: 'band', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'yes', popularity: 1.48, keywords: 'army seven members bangtan purple' },
  { name: 'BLACKPINK', industry: 'Korean (K-Pop)', debutYear: 2016, subtitle: 'DDU-DU DDU-DU, How You Like That', gender: 'group', genre: 'hiphop_rap', singerType: 'independent', format: 'band', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.48, keywords: 'blinks four members coachella' },
  { name: 'Jungkook', industry: 'Korean (K-Pop)', debutYear: 2013, subtitle: 'Seven, Standing Next to You · Golden', gender: 'male', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'yes', popularity: 1.45, keywords: 'golden maknae bts solo' },
  { name: 'ROSÉ', industry: 'Korean (K-Pop)', debutYear: 2016, subtitle: 'APT., On The Ground · BLACKPINK', gender: 'female', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.45, keywords: 'bruno mars apt guitar blonde' },
  { name: 'LISA', industry: 'Korean (K-Pop)', debutYear: 2016, subtitle: 'Money, Lalisa, Rockstar', gender: 'female', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.42, keywords: 'thai dancer rapper blackpink' },
  { name: 'PSY', industry: 'Korean (K-Pop)', debutYear: 2001, subtitle: 'Gangnam Style, Gentleman, That That', gender: 'male', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'horse dance viral pioneer' },
  { name: 'IU', industry: 'Korean (K-Pop)', debutYear: 2008, subtitle: 'Good Day, Lilac, Love Wins All', gender: 'female', genre: 'romantic_melody', singerType: 'independent', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'three high notes soloist actress' },
  { name: 'NewJeans', industry: 'Korean (K-Pop)', debutYear: 2022, subtitle: 'Ditto, Super Shy, Hype Boy', gender: 'group', genre: 'pop_dance', singerType: 'independent', format: 'band', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'yes', popularity: 1.4, keywords: 'y2k bunny bunnies girl group' },
  { name: 'Stray Kids', industry: 'Korean (K-Pop)', debutYear: 2018, subtitle: 'God\'s Menu, S-Class, Chk Chk Boom', gender: 'group', genre: 'hiphop_rap', singerType: 'independent', format: 'band', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.38, keywords: 'stay self produced noise music' },
  { name: 'TWICE', industry: 'Korean (K-Pop)', debutYear: 2015, subtitle: 'Fancy, What Is Love?, Feel Special', gender: 'group', genre: 'pop_dance', singerType: 'independent', format: 'band', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'yes', popularity: 1.38, keywords: 'nine members once nations girl group' },
  { name: 'EXO', industry: 'Korean (K-Pop)', debutYear: 2012, subtitle: 'Love Shot, Growl, Monster', gender: 'group', genre: 'pop_dance', singerType: 'independent', format: 'band', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.35, keywords: 'vocal kings superpowers' },
  { name: 'SEVENTEEN', industry: 'Korean (K-Pop)', debutYear: 2015, subtitle: 'Super, Very Nice, Maestro', gender: 'group', genre: 'pop_dance', singerType: 'independent', format: 'band', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.38, keywords: '13 members synchronized carat' },

  // Independent / Global - 10
  { name: 'AP Dhillon', industry: 'Independent / Global', debutYear: 2019, subtitle: 'Brown Munde, Excuses, With You', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'yes', popularity: 1.4, keywords: 'indo canadian punjabi synth' },
  { name: 'Prateek Kuhad', industry: 'Independent / Global', debutYear: 2013, subtitle: 'cold/mess, Kasoor, Kho Gaye Hum Kahan', gender: 'male', genre: 'rock_indie', singerType: 'independent', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.35, keywords: 'obama playlist acoustic heartbreak' },
  { name: 'Ali Sethi', industry: 'Independent / Global', debutYear: 2015, subtitle: 'Pasoori · Coke Studio Global Hit', gender: 'male', genre: 'classical_sufi', singerType: 'independent', format: 'solo', voiceType: 'classical', stillActive: 'yes', multiLingual: 'yes', popularity: 1.38, keywords: 'harvard classical ghazal pasoori' },
  { name: 'Hanumankind', industry: 'Independent / Global', debutYear: 2019, subtitle: 'Big Dawgs · Global Indian Hip-Hop', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'well of death kerala viral rap 2024' },
  { name: 'DIVINE', industry: 'Independent / Global', debutYear: 2013, subtitle: 'Mere Gully Mein, Kohinoor · Gully Gang', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.35, keywords: 'mumbai gully boy indian rap pioneer' },
  { name: 'Bad Bunny', industry: 'Independent / Global', debutYear: 2016, subtitle: 'Titi Me Pregunto · Reggaeton Icon', gender: 'male', genre: 'hiphop_rap', singerType: 'independent', format: 'solo', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'puerto rico spanish spotify king' },
  { name: 'Shakira', industry: 'Independent / Global', debutYear: 1995, subtitle: 'Waka Waka, Hips Don\'t Lie', gender: 'female', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'yes', popularity: 1.4, keywords: 'colombian belly dance world cup' },
  { name: 'Dua Lipa', industry: 'Independent / Global', debutYear: 2015, subtitle: 'Levitating, Don\'t Start Now', gender: 'female', genre: 'pop_dance', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'disco british albanian grammy' },
  { name: 'The Local Train', industry: 'Independent / Global', debutYear: 2008, subtitle: 'Choo Lo, Aaoge Tum Kabhi', gender: 'group', genre: 'rock_indie', singerType: 'independent', format: 'band', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.35, keywords: 'hindi rock band college anthem' },
  { name: 'Lana Del Rey', industry: 'Independent / Global', debutYear: 2011, subtitle: 'Summertime Sadness, Young and Beautiful', gender: 'female', genre: 'romantic_melody', singerType: 'independent', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'vintage americana melancholic cinematic' },

  // Anime / J-Pop - 10
  { name: 'YOASOBI', industry: 'Anime / J-Pop', debutYear: 2019, subtitle: 'Idol, Racing into the Night', gender: 'group', genre: 'pop_dance', singerType: 'independent', format: 'band', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'yes', popularity: 1.45, keywords: 'duo ayase ikura oshi no ko' },
  { name: 'LiSA', industry: 'Anime / J-Pop', debutYear: 2010, subtitle: 'Gurenge, Homura · Demon Slayer', gender: 'female', genre: 'rock_indie', singerType: 'playback', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'no', popularity: 1.45, keywords: 'anison queen sword art online' },
  { name: 'Kenshi Yonezu', industry: 'Anime / J-Pop', debutYear: 2012, subtitle: 'Lemon, Kick Back · Chainsaw Man', gender: 'male', genre: 'rock_indie', singerType: 'independent', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.42, keywords: 'hachi vocaloid lemon illustrator' },
  { name: 'RADWIMPS', industry: 'Anime / J-Pop', debutYear: 2003, subtitle: 'Sparkle, Zenzenzense, Suzume', gender: 'group', genre: 'rock_indie', singerType: 'playback', format: 'band', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'yes', popularity: 1.42, keywords: 'makoto shinkai your name' },
  { name: 'Fujii Kaze', industry: 'Anime / J-Pop', debutYear: 2020, subtitle: 'Shinunoga E-Wa, Matsuri', gender: 'male', genre: 'romantic_melody', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'yes', popularity: 1.42, keywords: 'piano viral global jpop' },
  { name: 'Creepy Nuts', industry: 'Anime / J-Pop', debutYear: 2013, subtitle: 'Bling-Bang-Bang-Born, Otonoke', gender: 'group', genre: 'hiphop_rap', singerType: 'playback', format: 'band', voiceType: 'rap_rhythmic', stillActive: 'yes', multiLingual: 'no', popularity: 1.42, keywords: 'dj matsunaga r-shitei mashle dandadan' },
  { name: 'Ado', industry: 'Anime / J-Pop', debutYear: 2020, subtitle: 'Usseewa, New Genesis · One Piece Film Red', gender: 'female', genre: 'rock_indie', singerType: 'independent', format: 'solo', voiceType: 'energetic', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'faceless silhouette uta powerful growl' },
  { name: 'Eve', industry: 'Anime / J-Pop', debutYear: 2016, subtitle: 'Kaikai Kitan · Jujutsu Kaisen', gender: 'male', genre: 'rock_indie', singerType: 'independent', format: 'solo', voiceType: 'pop_smooth', stillActive: 'yes', multiLingual: 'no', popularity: 1.38, keywords: 'animated music videos jjk' },
  { name: 'Aimer', industry: 'Anime / J-Pop', debutYear: 2011, subtitle: 'Zankyosanka · Demon Slayer, Fate', gender: 'female', genre: 'romantic_melody', singerType: 'playback', format: 'solo', voiceType: 'soulful', stillActive: 'yes', multiLingual: 'no', popularity: 1.35, keywords: 'husky smoky emotional voice' },
  { name: 'Joe Hisaishi', industry: 'Anime / J-Pop', debutYear: 1981, subtitle: 'Studio Ghibli Maestro · Spirited Away', gender: 'male', genre: 'classical_sufi', singerType: 'playback', format: 'solo', voiceType: 'classical', stillActive: 'yes', multiLingual: 'no', popularity: 1.4, keywords: 'miyazaki piano orchestra composer' },
];

export const SINGER_CANDIDATES: CandidateRecord[] = RAW_SINGERS.map((s) => {
  const era = getEra(s.debutYear);
  const decade = `${Math.floor(s.debutYear / 10) * 10}s`;
  return {
    id: `singer_${slugify(s.industry)}_${slugify(s.name)}`,
    category: 'singer',
    industry: s.industry,
    name: s.name,
    subtitle: s.subtitle,
    releaseYear: s.debutYear,
    endYear: null,
    decade,
    era,
    popularityPrior: s.popularity ?? 1.0,
    verified: true,
    attributes: {
      gender: s.gender,
      genre: s.genre,
      singer_type: s.singerType,
      format: s.format,
      voice_type: s.voiceType,
      era,
      debut_before_2010: s.debutYear < 2010 ? 'yes' : 'no',
      still_active: s.stillActive,
      multi_lingual: s.multiLingual,
      keywords: s.keywords ?? '',
    },
  };
});
