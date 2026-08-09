import { NFLPlayer } from './data/nflPlayers';
import { Position } from './types';

const SLEEPER_PLAYERS_URL = 'https://api.sleeper.app/v1/players/nfl';
const SLEEPER_TRENDING_URL = 'https://api.sleeper.app/v1/trending/nfl/add?lookback_hours=24&limit=50';

export async function fetchSleeperPlayers(): Promise<NFLPlayer[]> {
  try {
    // 1. Check Cache first (Sleeper recommends only fetching this once per 24 hours)
    const cached = localStorage.getItem('sleeper_players_cache');
    const cacheTime = localStorage.getItem('sleeper_cache_timestamp');
    
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime) < 86400000)) {
      return JSON.parse(cached);
    }

    // 2. Fetch from Sleeper
    const response = await fetch(SLEEPER_PLAYERS_URL);
    const data = await response.json();

    // 3. Transform Sleeper format to our NFLPlayer format
    const players: NFLPlayer[] = Object.values(data)
      .filter((p: any) => p.active && ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p.position))
      .map((p: any) => ({
        id: p.player_id,
        name: `${p.first_name} ${p.last_name}`,
        position: (p.position === 'DEF' ? 'DST' : p.position) as Position,
        nflTeam: p.team || 'FA',
        adp: 999, // Sleeper API doesn't provide ADP in the master list, requires separate endpoint or default
        tier: 5,
        rank: 999,
        positionRank: `${p.position}0`,
        byeWeek: p.search_rank || 0,
        projectedPtsPPR: 0,
        tags: [p.status],
        notes: `Age: ${p.age || 'N/A'} • Exp: ${p.years_exp || 0} years`
      }));

    // 4. Update Cache
    localStorage.setItem('sleeper_players_cache', JSON.stringify(players));
    localStorage.setItem('sleeper_cache_timestamp', Date.now().toString());

    return players;
  } catch (error) {
    console.error('Error fetching Sleeper players:', error);
    return [];
  }
}

export async function fetchTrendingPlayers() {
  try {
    const response = await fetch(SLEEPER_TRENDING_URL);
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending players:', error);
    return [];
  }
}
