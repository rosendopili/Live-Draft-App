export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST';
export interface TeamHeader { column: number; name: string; }
export interface DraftPick { round: number; pick_in_round: number; overall_pick: number; team_column: number; team_name: string; player_name: string; position: Position; nfl_team: string; raw_text: string; confidence: number; status?: 'confirmed' | 'needs_review' | 'edited'; notes?: string; }
export interface RosterSettings { qb: number; rb: number; wr: number; te: number; flex: number; k: number; dst: number; bench: number; }
export interface DraftSettings { total_teams: number; total_rounds: number; draft_type: 'snake' | 'linear'; scoring_format: 'PPR' | 'Half-PPR' | 'Standard' | 'TE Premium' | '2QB / Superflex'; my_team_column: number; team_names: Record<number, string>; roster_settings?: RosterSettings; time_per_pick?: number; }
export interface OCRResult { draft_info: { total_teams: number; total_rounds: number; detected_picks: number; teams: TeamHeader[]; }; picks: DraftPick[]; summary?: { total_detected: number; avg_confidence: number; low_confidence_count: number; positions_breakdown: Record<Position, number>; }; processing_time_ms?: number; }
