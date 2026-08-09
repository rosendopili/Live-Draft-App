import { NFLPlayer } from '../data/nflPlayers';
import { Position } from '../types';

const SLEEPER_PLAYERS_URL = 'https://api.sleeper.app/v1/players/nfl';

export async function fetchSleeperPlayers(): Promise<NFLPlayer[]> {
  try {
    const cached = localStorage.getItem('sleeper_players_cache');
    const cacheTime = localStorage.getItem('sleeper_cache_timestamp');
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime) < 86400000)) return JSON.parse(cached);

    const response = await fetch(SLEEPER_PLAYERS_URL);
    const data = await response.json();

    const players: NFLPlayer[] = Object.values(data)
      .filter((p: any) => 
        p.active && 
        p.team && // Must be on an active NFL roster
        ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p.position)
      )
      .map((p: any) => ({
        id: p.player_id,
        name: `${p.first_name} ${p.last_name}`,
        position: (p.position === 'DEF' ? 'DST' : p.position) as Position,
        nflTeam: p.team,
        adp: 999,
        tier: 5,
        rank: 999,
        positionRank: `${p.position}0`,
        byeWeek: p.search_rank || 0,
        projectedPtsPPR: 0,
        tags: [p.status],
        notes: `Age: ${p.age || 'N/A'}`,
        injuryStatus: p.injury_status
      }));

    localStorage.setItem('sleeper_players_cache', JSON.stringify(players));
    localStorage.setItem('sleeper_cache_timestamp', Date.now().toString());
    return players;
  } catch (error) {
    console.error('Error fetching Sleeper players:', error);
    return [];
  }
}
