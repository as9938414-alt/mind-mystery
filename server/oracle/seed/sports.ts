import type { CandidateRecord, MediaEra } from '../types.ts';

interface SportSeedInput {
  name: string;
  sport: string;
  peakYear: number;
  subtitle: string;
  countryGroup: 'india' | 'europe' | 'americas' | 'rest_of_world';
  gender: 'male' | 'female';
  role: 'attacker_batter' | 'defender_bowler' | 'allrounder_midfield' | 'individual_solo';
  status: 'active' | 'retired';
  worldChampion: 'yes' | 'no';
  captain: 'yes' | 'no';
  olympicMedalist: 'yes' | 'no';
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

const RAW_SPORTS: SportSeedInput[] = [
  // Cricket (18)
  { name: 'Virat Kohli', sport: 'Cricket', peakYear: 2016, subtitle: 'India · King Kohli · 50 ODI Centuries', countryGroup: 'india', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.48, keywords: 'rcb chase master jersey 18' },
  { name: 'MS Dhoni', sport: 'Cricket', peakYear: 2011, subtitle: 'India · Captain Cool · 3 ICC Trophies', countryGroup: 'india', gender: 'male', role: 'allrounder_midfield', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.48, keywords: 'thala csk jersey 7 wicketkeeper helicopter' },
  { name: 'Sachin Tendulkar', sport: 'Cricket', peakYear: 1998, subtitle: 'India · God of Cricket · 100 Centuries', countryGroup: 'india', gender: 'male', role: 'attacker_batter', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.48, keywords: 'master blaster jersey 10 bharat ratna' },
  { name: 'Rohit Sharma', sport: 'Cricket', peakYear: 2024, subtitle: 'India · Hitman · T20 World Cup Captain', countryGroup: 'india', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.45, keywords: 'mumbai indians jersey 45 double centuries' },
  { name: 'Jasprit Bumrah', sport: 'Cricket', peakYear: 2024, subtitle: 'India · Fast Bowler · Yorker Specialist', countryGroup: 'india', gender: 'male', role: 'defender_bowler', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.42, keywords: 'unorthodox action yorker t20 player of tournament' },
  { name: 'Hardik Pandya', sport: 'Cricket', peakYear: 2024, subtitle: 'India · Pace All-Rounder', countryGroup: 'india', gender: 'male', role: 'allrounder_midfield', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.35, keywords: 'kung fu pandya clutch sixes' },
  { name: 'Kapil Dev', sport: 'Cricket', peakYear: 1983, subtitle: 'India · 1983 World Cup Winning Captain', countryGroup: 'india', gender: 'male', role: 'allrounder_midfield', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.35, keywords: 'haryana hurricane 175 not out' },
  { name: 'Smriti Mandhana', sport: 'Cricket', peakYear: 2024, subtitle: 'India · Left-Handed Opening Batter', countryGroup: 'india', gender: 'female', role: 'attacker_batter', status: 'active', worldChampion: 'no', captain: 'yes', olympicMedalist: 'no', popularity: 1.4, keywords: 'rcb wpl champion jersey 18' },
  { name: 'Mithali Raj', sport: 'Cricket', peakYear: 2017, subtitle: 'India · Highest Run Scorer in Women\'s Cricket', countryGroup: 'india', gender: 'female', role: 'attacker_batter', status: 'retired', worldChampion: 'no', captain: 'yes', olympicMedalist: 'no', popularity: 1.32, keywords: 'legendary captain 23 years' },
  { name: 'AB de Villiers', sport: 'Cricket', peakYear: 2015, subtitle: 'South Africa · Mr. 360', countryGroup: 'rest_of_world', gender: 'male', role: 'attacker_batter', status: 'retired', worldChampion: 'no', captain: 'yes', olympicMedalist: 'no', popularity: 1.42, keywords: 'rcb fastest century innovative shots' },
  { name: 'Pat Cummins', sport: 'Cricket', peakYear: 2023, subtitle: 'Australia · 2023 World Cup & WTC Captain', countryGroup: 'rest_of_world', gender: 'male', role: 'defender_bowler', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.38, keywords: 'silencer srh fast bowler' },
  { name: 'Ricky Ponting', sport: 'Cricket', peakYear: 2003, subtitle: 'Australia · 2x World Cup Winning Captain', countryGroup: 'rest_of_world', gender: 'male', role: 'attacker_batter', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.35, keywords: 'punter pull shot dominant' },
  { name: 'Shane Warne', sport: 'Cricket', peakYear: 1999, subtitle: 'Australia · King of Spin', countryGroup: 'rest_of_world', gender: 'male', role: 'defender_bowler', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.38, keywords: 'ball of the century leg spin 708 wickets' },
  { name: 'Ben Stokes', sport: 'Cricket', peakYear: 2019, subtitle: 'England · 2019 & 2022 World Cup Hero', countryGroup: 'europe', gender: 'male', role: 'allrounder_midfield', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.35, keywords: 'headingley bazball clutch' },
  { name: 'Chris Gayle', sport: 'Cricket', peakYear: 2012, subtitle: 'West Indies · Universe Boss', countryGroup: 'americas', gender: 'male', role: 'attacker_batter', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.38, keywords: '175 rcb sixes t20 legend' },
  { name: 'Babar Azam', sport: 'Cricket', peakYear: 2022, subtitle: 'Pakistan · Elegant Top-Order Batter', countryGroup: 'rest_of_world', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'no', captain: 'yes', olympicMedalist: 'no', popularity: 1.35, keywords: 'cover drive pakistan' },
  { name: 'Ellyse Perry', sport: 'Cricket', peakYear: 2020, subtitle: 'Australia · Dual-Sport Legend & All-Rounder', countryGroup: 'rest_of_world', gender: 'female', role: 'allrounder_midfield', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.35, keywords: 'rcb football and cricket world cups' },
  { name: 'Ravindra Jadeja', sport: 'Cricket', peakYear: 2023, subtitle: 'India · Sir Jadeja · Spin All-Rounder', countryGroup: 'india', gender: 'male', role: 'allrounder_midfield', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.35, keywords: 'sword celebration csk fielder' },

  // Football (16)
  { name: 'Lionel Messi', sport: 'Football', peakYear: 2022, subtitle: 'Argentina · 8 Ballon d\'Or · World Cup Winner', countryGroup: 'americas', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'yes', popularity: 1.48, keywords: 'goat barcelona inter miami jersey 10' },
  { name: 'Cristiano Ronaldo', sport: 'Football', peakYear: 2017, subtitle: 'Portugal · CR7 · 5 Ballon d\'Or · Top Scorer', countryGroup: 'europe', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'no', captain: 'yes', olympicMedalist: 'no', popularity: 1.48, keywords: 'siuuu real madrid jersey 7 euro 2016' },
  { name: 'Kylian Mbappe', sport: 'Football', peakYear: 2022, subtitle: 'France · World Cup Winner & Hat-Trick Hero', countryGroup: 'europe', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.42, keywords: 'real madrid psg speed 2018' },
  { name: 'Neymar Jr.', sport: 'Football', peakYear: 2016, subtitle: 'Brazil · Skillful Forward · Olympic Gold', countryGroup: 'americas', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'no', captain: 'yes', olympicMedalist: 'yes', popularity: 1.4, keywords: 'dribbling santos barcelona psg' },
  { name: 'Sunil Chhetri', sport: 'Football', peakYear: 2018, subtitle: 'India · Captain Fantastic · 94 International Goals', countryGroup: 'india', gender: 'male', role: 'attacker_batter', status: 'retired', worldChampion: 'no', captain: 'yes', olympicMedalist: 'no', popularity: 1.42, keywords: 'indian football legend bengaluru fc' },
  { name: 'Pele', sport: 'Football', peakYear: 1970, subtitle: 'Brazil · 3x FIFA World Cup Winner', countryGroup: 'americas', gender: 'male', role: 'attacker_batter', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.42, keywords: 'o rei king brazil classic' },
  { name: 'Diego Maradona', sport: 'Football', peakYear: 1986, subtitle: 'Argentina · Hand of God · 1986 Legend', countryGroup: 'americas', gender: 'male', role: 'allrounder_midfield', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.4, keywords: 'napoli argentina dribble' },
  { name: 'Zinedine Zidane', sport: 'Football', peakYear: 1998, subtitle: 'France · Midfield Maestro & UCL Manager', countryGroup: 'europe', gender: 'male', role: 'allrounder_midfield', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.38, keywords: 'zizou volley real madrid' },
  { name: 'Erling Haaland', sport: 'Football', peakYear: 2023, subtitle: 'Norway · Manchester City Goal Machine', countryGroup: 'europe', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'no', captain: 'no', olympicMedalist: 'no', popularity: 1.38, keywords: 'treble premier league robot striker' },
  { name: 'Luka Modric', sport: 'Football', peakYear: 2018, subtitle: 'Croatia · 2018 Ballon d\'Or Midfielder', countryGroup: 'europe', gender: 'male', role: 'allrounder_midfield', status: 'active', worldChampion: 'no', captain: 'yes', olympicMedalist: 'no', popularity: 1.35, keywords: 'outside foot real madrid' },
  { name: 'Sergio Ramos', sport: 'Football', peakYear: 2014, subtitle: 'Spain · World Cup & 4x UCL Defender', countryGroup: 'europe', gender: 'male', role: 'defender_bowler', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.35, keywords: '92:48 header defender captain' },
  { name: 'David Beckham', sport: 'Football', peakYear: 2001, subtitle: 'England · Free-Kick Icon', countryGroup: 'europe', gender: 'male', role: 'allrounder_midfield', status: 'retired', worldChampion: 'no', captain: 'yes', olympicMedalist: 'no', popularity: 1.38, keywords: 'bend it man united inter miami owner' },
  { name: 'Aitana Bonmati', sport: 'Football', peakYear: 2024, subtitle: 'Spain · 2x Ballon d\'Or & World Cup Winner', countryGroup: 'europe', gender: 'female', role: 'allrounder_midfield', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.35, keywords: 'barcelona women midfielder' },
  { name: 'Marta', sport: 'Football', peakYear: 2007, subtitle: 'Brazil · 6x FIFA World Player of the Year', countryGroup: 'americas', gender: 'female', role: 'attacker_batter', status: 'active', worldChampion: 'no', captain: 'yes', olympicMedalist: 'yes', popularity: 1.32, keywords: 'queen of football olympic silver' },
  { name: 'Lamine Yamal', sport: 'Football', peakYear: 2024, subtitle: 'Spain · Teenage Euro 2024 Champion', countryGroup: 'europe', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'no', captain: 'no', olympicMedalist: 'no', popularity: 1.38, keywords: 'barcelona 17 prodigy winger' },
  { name: 'Manuel Neuer', sport: 'Football', peakYear: 2014, subtitle: 'Germany · World Cup Sweeper-Keeper', countryGroup: 'europe', gender: 'male', role: 'defender_bowler', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.32, keywords: 'goalkeeper bayern golden glove' },

  // Tennis (12)
  { name: 'Roger Federer', sport: 'Tennis', peakYear: 2006, subtitle: 'Switzerland · 20 Grand Slams · Wimbledon King', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.48, keywords: 'one handed backhand elegance grass' },
  { name: 'Rafael Nadal', sport: 'Tennis', peakYear: 2010, subtitle: 'Spain · King of Clay · 22 Grand Slams', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.48, keywords: '14 roland garros left handed topspin' },
  { name: 'Novak Djokovic', sport: 'Tennis', peakYear: 2023, subtitle: 'Serbia · 24 Grand Slams · Olympic Gold', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.48, keywords: 'nole record holder australian open' },
  { name: 'Serena Williams', sport: 'Tennis', peakYear: 2015, subtitle: 'USA · 23 Grand Slams · Tennis Icon', countryGroup: 'americas', gender: 'female', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.48, keywords: 'serve power four olympic golds' },
  { name: 'Carlos Alcaraz', sport: 'Tennis', peakYear: 2024, subtitle: 'Spain · Youngest World No. 1 · Wimbledon & Roland Garros', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.42, keywords: 'drop shot charly spain' },
  { name: 'Jannik Sinner', sport: 'Tennis', peakYear: 2024, subtitle: 'Italy · World No. 1 · Hard-Court Champion', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.4, keywords: 'red hair italian us open australian open' },
  { name: 'Iga Swiatek', sport: 'Tennis', peakYear: 2023, subtitle: 'Poland · Dominant Clay & World No. 1', countryGroup: 'europe', gender: 'female', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.38, keywords: 'french open bakery bagels' },
  { name: 'Sania Mirza', sport: 'Tennis', peakYear: 2015, subtitle: 'India · 6 Grand Slam Doubles Titles', countryGroup: 'india', gender: 'female', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.42, keywords: 'hyderabad doubles world number 1' },
  { name: 'Leander Paes', sport: 'Tennis', peakYear: 1999, subtitle: 'India · 18 Grand Slam Titles & Olympic Bronze', countryGroup: 'india', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'yes', popularity: 1.35, keywords: 'atlanta 1996 seven olympics doubles' },
  { name: 'Maria Sharapova', sport: 'Tennis', peakYear: 2006, subtitle: 'Russia · Career Grand Slam Winner', countryGroup: 'europe', gender: 'female', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.35, keywords: 'wimbledon 17 fashion grunt' },
  { name: 'Steffi Graf', sport: 'Tennis', peakYear: 1988, subtitle: 'Germany · 22 Slams · Only Golden Slam', countryGroup: 'europe', gender: 'female', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.32, keywords: '1988 forehand golden slam' },
  { name: 'Coco Gauff', sport: 'Tennis', peakYear: 2023, subtitle: 'USA · US Open Champion', countryGroup: 'americas', gender: 'female', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.35, keywords: 'teenage star american speed' },

  // Basketball (12)
  { name: 'Michael Jordan', sport: 'Basketball', peakYear: 1996, subtitle: 'USA · Air Jordan · 6x NBA Champion', countryGroup: 'americas', gender: 'male', role: 'attacker_batter', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'yes', popularity: 1.48, keywords: 'chicago bulls 23 sneakers goat' },
  { name: 'LeBron James', sport: 'Basketball', peakYear: 2016, subtitle: 'USA · King James · All-Time NBA Scoring Leader', countryGroup: 'americas', gender: 'male', role: 'allrounder_midfield', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'yes', popularity: 1.48, keywords: 'lakers cavaliers heat 40000 points' },
  { name: 'Kobe Bryant', sport: 'Basketball', peakYear: 2009, subtitle: 'USA · Black Mamba · 5x NBA Champion', countryGroup: 'americas', gender: 'male', role: 'attacker_batter', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'yes', popularity: 1.48, keywords: 'lakers 8 24 mamba mentality 81 points' },
  { name: 'Stephen Curry', sport: 'Basketball', peakYear: 2022, subtitle: 'USA · Greatest 3-Point Shooter Ever', countryGroup: 'americas', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'yes', popularity: 1.45, keywords: 'warriors chef splash three pointers' },
  { name: 'Shaquille O\'Neal', sport: 'Basketball', peakYear: 2001, subtitle: 'USA · Shaq · Dominant Center', countryGroup: 'americas', gender: 'male', role: 'defender_bowler', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.4, keywords: 'dunks breaking backboards lakers tv' },
  { name: 'Nikola Jokic', sport: 'Basketball', peakYear: 2023, subtitle: 'Serbia · The Joker · 3x NBA MVP', countryGroup: 'europe', gender: 'male', role: 'allrounder_midfield', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.38, keywords: 'denver nuggets passing center horses' },
  { name: 'Giannis Antetokounmpo', sport: 'Basketball', peakYear: 2021, subtitle: 'Greece · Greek Freak · NBA Champion', countryGroup: 'europe', gender: 'male', role: 'allrounder_midfield', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.38, keywords: 'milwaukee bucks 50 points finals' },
  { name: 'Kevin Durant', sport: 'Basketball', peakYear: 2017, subtitle: 'USA · Slim Reaper · 4x Olympic Gold', countryGroup: 'americas', gender: 'male', role: 'attacker_batter', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.38, keywords: 'easy money sniper scorer' },
  { name: 'Luka Doncic', sport: 'Basketball', peakYear: 2024, subtitle: 'Slovenia · Triple-Double Phenom', countryGroup: 'europe', gender: 'male', role: 'allrounder_midfield', status: 'active', worldChampion: 'no', captain: 'yes', olympicMedalist: 'no', popularity: 1.38, keywords: 'step back three dallas magic' },
  { name: 'Caitlin Clark', sport: 'Basketball', peakYear: 2024, subtitle: 'USA · WNBA Rookie of the Year & Logo Threes', countryGroup: 'americas', gender: 'female', role: 'attacker_batter', status: 'active', worldChampion: 'no', captain: 'no', olympicMedalist: 'no', popularity: 1.4, keywords: 'iowa fever deep threes viewership' },
  { name: 'Magic Johnson', sport: 'Basketball', peakYear: 1987, subtitle: 'USA · Showtime Lakers Point Guard', countryGroup: 'americas', gender: 'male', role: 'allrounder_midfield', status: 'retired', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'yes', popularity: 1.35, keywords: 'no look pass 5 rings dream team' },
  { name: 'Victor Wembanyama', sport: 'Basketball', peakYear: 2024, subtitle: 'France · 7\'4" Alien Phenom', countryGroup: 'europe', gender: 'male', role: 'defender_bowler', status: 'active', worldChampion: 'no', captain: 'no', olympicMedalist: 'yes', popularity: 1.35, keywords: 'spurs blocks paris silver' },

  // Athletics & Olympics (14)
  { name: 'Neeraj Chopra', sport: 'Athletics & Olympics', peakYear: 2021, subtitle: 'India · Olympic Gold & Silver Javelin Champion', countryGroup: 'india', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.48, keywords: 'javelin tokyo gold paris silver panipat' },
  { name: 'Usain Bolt', sport: 'Athletics & Olympics', peakYear: 2009, subtitle: 'Jamaica · Fastest Man Alive · 9.58s', countryGroup: 'americas', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.48, keywords: 'lightning bolt 100m 200m 8 golds' },
  { name: 'Michael Phelps', sport: 'Athletics & Olympics', peakYear: 2008, subtitle: 'USA · 23 Olympic Gold Medals · Swimming', countryGroup: 'americas', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.48, keywords: 'flying fish 28 medals beijing' },
  { name: 'Simone Biles', sport: 'Athletics & Olympics', peakYear: 2024, subtitle: 'USA · Most Decorated Gymnast in History', countryGroup: 'americas', gender: 'female', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.45, keywords: 'gymnastics vault 7 olympic golds' },
  { name: 'PV Sindhu', sport: 'Athletics & Olympics', peakYear: 2019, subtitle: 'India · 2x Olympic Badminton Medalist', countryGroup: 'india', gender: 'female', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.45, keywords: 'badminton rio silver tokyo bronze' },
  { name: 'Manu Bhaker', sport: 'Athletics & Olympics', peakYear: 2024, subtitle: 'India · 2 Medals at Paris 2024 Shooting', countryGroup: 'india', gender: 'female', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.42, keywords: 'pistol shooting paris two bronzes' },
  { name: 'Abhinav Bindra', sport: 'Athletics & Olympics', peakYear: 2008, subtitle: 'India · First Individual Olympic Gold (Shooting)', countryGroup: 'india', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.38, keywords: 'beijing 2008 air rifle gold' },
  { name: 'Milkha Singh', sport: 'Athletics & Olympics', peakYear: 1960, subtitle: 'India · The Flying Sikh', countryGroup: 'india', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'no', captain: 'no', olympicMedalist: 'no', popularity: 1.4, keywords: '400m rome commonwealth asian games' },
  { name: 'PT Usha', sport: 'Athletics & Olympics', peakYear: 1984, subtitle: 'India · Payyoli Express · Track Legend', countryGroup: 'india', gender: 'female', role: 'individual_solo', status: 'retired', worldChampion: 'no', captain: 'no', olympicMedalist: 'no', popularity: 1.35, keywords: 'hurdles 1/100th second ioa' },
  { name: 'Armand Duplantis', sport: 'Athletics & Olympics', peakYear: 2024, subtitle: 'Sweden · Mondo · Pole Vault World Record Holder', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.38, keywords: 'pole vault 6.26m paris gold' },
  { name: 'Eliud Kipchoge', sport: 'Athletics & Olympics', peakYear: 2019, subtitle: 'Kenya · Sub-2-Hour Marathon Legend', countryGroup: 'rest_of_world', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.35, keywords: 'no human is limited marathon' },
  { name: 'Katie Ledecky', sport: 'Athletics & Olympics', peakYear: 2024, subtitle: 'USA · 9x Olympic Gold Distance Swimmer', countryGroup: 'americas', gender: 'female', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.35, keywords: 'freestyle swimming 1500m' },
  { name: 'D. Gukesh', sport: 'Athletics & Olympics', peakYear: 2024, subtitle: 'India · Youngest World Chess Champion', countryGroup: 'india', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.45, keywords: 'chess 18 years old chennai Olympiad' },
  { name: 'Magnus Carlsen', sport: 'Athletics & Olympics', peakYear: 2014, subtitle: 'Norway · 5x World Chess Champion', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.42, keywords: 'chess goat 2882 rating' },

  // Combat & Motorsport (14)
  { name: 'Lewis Hamilton', sport: 'Combat & Motorsport', peakYear: 2020, subtitle: 'UK · 7x Formula 1 World Champion', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.48, keywords: 'f1 mercedes ferrari 105 wins' },
  { name: 'Max Verstappen', sport: 'Combat & Motorsport', peakYear: 2023, subtitle: 'Netherlands · 4x Formula 1 World Champion', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.48, keywords: 'red bull du du du f1' },
  { name: 'Michael Schumacher', sport: 'Combat & Motorsport', peakYear: 2004, subtitle: 'Germany · 7x Formula 1 Ferrari Legend', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.45, keywords: 'ferrari red baron f1' },
  { name: 'Ayrton Senna', sport: 'Combat & Motorsport', peakYear: 1991, subtitle: 'Brazil · 3x F1 World Champion · Rain Master', countryGroup: 'americas', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.4, keywords: 'mclaren yellow helmet monaco' },
  { name: 'Muhammad Ali', sport: 'Combat & Motorsport', peakYear: 1974, subtitle: 'USA · The Greatest · Heavyweight Boxing', countryGroup: 'americas', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.48, keywords: 'float like a butterfly rumble in the jungle' },
  { name: 'Mike Tyson', sport: 'Combat & Motorsport', peakYear: 1988, subtitle: 'USA · Iron Mike · Youngest Heavyweight Champ', countryGroup: 'americas', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.45, keywords: 'knockouts face tattoo boxing' },
  { name: 'Conor McGregor', sport: 'Combat & Motorsport', peakYear: 2016, subtitle: 'Ireland · First UFC Two-Division Champion', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.42, keywords: 'notorious mma ufc left hand' },
  { name: 'Khabib Nurmagomedov', sport: 'Combat & Motorsport', peakYear: 2020, subtitle: 'Russia · Undefeated 29-0 UFC Lightweight Champ', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.42, keywords: 'the eagle dagestan wrestling smesh' },
  { name: 'Mary Kom', sport: 'Combat & Motorsport', peakYear: 2012, subtitle: 'India · 6x World Boxing Champion & Olympic Bronze', countryGroup: 'india', gender: 'female', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'yes', popularity: 1.45, keywords: 'magnificent mary manipur boxer' },
  { name: 'Vinesh Phogat', sport: 'Combat & Motorsport', peakYear: 2024, subtitle: 'India · Wrestling Champion & Commonwealth Gold', countryGroup: 'india', gender: 'female', role: 'individual_solo', status: 'retired', worldChampion: 'no', captain: 'no', olympicMedalist: 'no', popularity: 1.38, keywords: 'wrestling haryana phogat' },
  { name: 'John Cena', sport: 'Combat & Motorsport', peakYear: 2010, subtitle: 'USA · 16x WWE Champion & Actor', countryGroup: 'americas', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.42, keywords: 'you cant see me wwe attitude adjustment' },
  { name: 'Roman Reigns', sport: 'Combat & Motorsport', peakYear: 2023, subtitle: 'USA · The Tribal Chief · WWE', countryGroup: 'americas', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'yes', captain: 'yes', olympicMedalist: 'no', popularity: 1.4, keywords: 'bloodline acknowledge me spear' },
  { name: 'Valentino Rossi', sport: 'Combat & Motorsport', peakYear: 2005, subtitle: 'Italy · The Doctor · 9x MotoGP Champion', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'retired', worldChampion: 'yes', captain: 'no', olympicMedalist: 'no', popularity: 1.35, keywords: '46 yellow motorbike motogp' },
  { name: 'Charles Leclerc', sport: 'Combat & Motorsport', peakYear: 2024, subtitle: 'Monaco · Ferrari F1 Driver', countryGroup: 'europe', gender: 'male', role: 'individual_solo', status: 'active', worldChampion: 'no', captain: 'no', olympicMedalist: 'no', popularity: 1.38, keywords: 'monaco winner ferrari 16' },
];

export const SPORTS_CANDIDATES: CandidateRecord[] = RAW_SPORTS.map((s) => {
  const era = getEra(s.peakYear);
  const decade = `${Math.floor(s.peakYear / 10) * 10}s`;
  return {
    id: `sports_${slugify(s.sport)}_${slugify(s.name)}`,
    category: 'sports_person',
    industry: s.sport,
    name: s.name,
    subtitle: s.subtitle,
    releaseYear: s.peakYear,
    endYear: null,
    decade,
    era,
    popularityPrior: s.popularity ?? 1.0,
    verified: true,
    attributes: {
      country_group: s.countryGroup,
      gender: s.gender,
      role: s.role,
      status: s.status,
      world_champion: s.worldChampion,
      era,
      peak_before_2015: s.peakYear < 2015 ? 'yes' : 'no',
      captain: s.captain,
      olympic_medalist: s.olympicMedalist,
      keywords: s.keywords ?? '',
    },
  };
});
