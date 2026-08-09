import { Position } from '../types';

export interface NFLPlayer {
  id: string;
  name: string;
  position: Position;
  nflTeam: string;
  adp: number;
  tier: number;
  rank: number;
  positionRank: string;
  byeWeek: number;
  projectedPtsPPR: number;
  tags: string[];
  notes?: string;
  injuryStatus?: string | null;
}

export const NFL_PLAYERS_DATABASE = 'NFL_PLAYERS_DATABASE';
export const INITIAL_NFL_PLAYERS: NFLPlayer[] = [
  { id: '1', name: 'Christian McCaffrey', position: 'RB', nflTeam: 'SF', adp: 1.1, tier: 1, rank: 1, positionRank: 'RB1', byeWeek: 9, projectedPtsPPR: 345, tags: ['Elite'], notes: 'Workhorse' },
  { id: '2', name: 'CeeDee Lamb', position: 'WR', nflTeam: 'DAL', adp: 2.2, tier: 1, rank: 2, positionRank: 'WR1', byeWeek: 7, projectedPtsPPR: 320, tags: ['Alpha'], notes: 'Target Monster' },
  { id: '3', name: 'Tyreek Hill', position: 'WR', nflTeam: 'MIA', adp: 3.1, tier: 1, rank: 3, positionRank: 'WR2', byeWeek: 6, projectedPtsPPR: 315, tags: ['Speed'], notes: 'Gamebreaker' },
];
