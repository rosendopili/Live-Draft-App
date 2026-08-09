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

    // 1. Filter out non-active, non-rostered, or retired players
    // 2. Sort by search_rank to get the "Most Relevant" players first
    const players: NFLPlayer[] = Object.values(data)
      .filter((p: any) => 
        p.active === true && 
        p.team !== null && 
        p.team !== undefined &&
        p.team !== "" &&
        p.search_rank !== null && 
        p.search_rank > 0 &&
        ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p.position)
      )
      .map((p: any) => ({
        id: p.player_id,
        name: `${p.first_name} ${p.last_name}`,
        position: (p.position === 'DEF' ? 'DST' : p.position) as Position,
        nflTeam: p.team,
        adp: p.search_rank || 999,
        tier: p.search_rank < 50 ? 1 : p.search_rank < 100 ? 2 : p.search_rank < 150 ? 3 : 4,
        rank: p.search_rank || 999,
        positionRank: `${p.position}${p.depth_chart_order || ''}`,
        byeWeek: p.search_rank || 0,
        projectedPtsPPR: 0,
        tags: [p.status],
        notes: `Team: ${p.team}`,
        injuryStatus: p.injury_status
      }))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 300); // We only want the Top 300 active players to avoid "all over the place" results

    localStorage.setItem('sleeper_players_cache', JSON.stringify(players));
    localStorage.setItem('sleeper_cache_timestamp', Date.now().toString());
    return players;
  } catch (error) {
    console.error('Error fetching Sleeper players:', error);
    return [];
  }
}
