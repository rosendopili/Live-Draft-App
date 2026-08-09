import { OCRResult, SampleBoard } from '../types';

// Utility to generate SVG data URIs for sample draft board photos
function createSampleBoardSvg(title: string, teamsCount: number, roundsCount: number): string {
  const width = 1000;
  const height = 650;
  const colWidth = (width - 60) / teamsCount;
  const rowHeight = (height - 80) / roundsCount;

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];
  const posColors: Record<string, { bg: string; text: string }> = {
    WR: { bg: '#10B981', text: '#FFFFFF' },
    RB: { bg: '#3B82F6', text: '#FFFFFF' },
    QB: { bg: '#EF4444', text: '#FFFFFF' },
    TE: { bg: '#F59E0B', text: '#FFFFFF' },
    K: { bg: '#8B5CF6', text: '#FFFFFF' },
    DST: { bg: '#6B7280', text: '#FFFFFF' }
  };

  const playersByPos: Record<string, string[]> = {
    WR: ['Justin Jefferson', 'Ja\'Marr Chase', 'CeeDee Lamb', 'A.J. Brown', 'Amon-Ra St. Brown', 'Tyreek Hill', 'Marvin Harrison Jr.'],
    RB: ['Christian McCaffrey', 'Breece Hall', 'Bijan Robinson', 'Saquon Barkley', 'Jonathan Taylor', 'Jahmyr Gibbs'],
    QB: ['Patrick Mahomes', 'Josh Allen', 'Lamar Jackson', 'Jalen Hurts', 'C.J. Stroud', 'Anthony Richardson'],
    TE: ['Travis Kelce', 'Sam LaPorta', 'Trey McBride', 'Mark Andrews', 'George Kittle', 'Evan Engram'],
    K: ['Justin Tucker', 'Harrison Butker', 'Brandon Aubrey', 'Evan McPherson'],
    DST: ['SF DST', 'BAL DST', 'DAL DST', 'CLE DST']
  };

  let cellsSvg = '';
  // Draw team headers
  for (let col = 0; col < teamsCount; col++) {
    const x = 50 + col * colWidth;
    cellsSvg += `<rect x="${x}" y="30" width="${colWidth - 4}" height="35" rx="4" fill="#1E293B" stroke="#334155"/>`;
    cellsSvg += `<text x="${x + colWidth / 2}" y="52" fill="#E2E8F0" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Team ${col + 1}</text>`;
  }

  // Draw round numbers and stickers
  for (let r = 0; r < roundsCount; r++) {
    const y = 75 + r * rowHeight;
    cellsSvg += `<text x="25" y="${y + rowHeight / 2 + 4}" fill="#94A3B8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">R${r + 1}</text>`;

    for (let c = 0; c < teamsCount; c++) {
      const x = 50 + c * colWidth;
      // Only fill ~75% of slots to simulate active draft in progress
      if ((r * teamsCount + c) % 5 === 0 && r >= roundsCount - 2) continue;

      const posIndex = (r + c) % positions.length;
      const pos = positions[posIndex];
      const color = posColors[pos];
      const playerList = playersByPos[pos];
      const name = playerList[(r * 3 + c) % playerList.length];

      cellsSvg += `<rect x="${x + 2}" y="${y + 2}" width="${colWidth - 8}" height="${rowHeight - 4}" rx="3" fill="${color.bg}" stroke="#000000" stroke-opacity="0.2"/>`;
      cellsSvg += `<text x="${x + (colWidth - 8) / 2 + 2}" y="${y + rowHeight / 2 - 2}" fill="${color.text}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${name}</text>`;
      cellsSvg += `<text x="${x + (colWidth - 8) / 2 + 2}" y="${y + rowHeight / 2 + 10}" fill="rgba(255,255,255,0.85)" font-family="sans-serif" font-size="8" text-anchor="middle">${pos} - MIN</text>`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#0F172A"/>
    <text x="${width / 2}" y="20" fill="#F8FAFC" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">${title} (Physical Draft Board OCR Scan)</text>
    ${cellsSvg}
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const SAMPLE_BOARDS: SampleBoard[] = [
  {
    id: 'sample-12-team-std',
    title: '12-Team Standard Draft Board (Round 1-4 Complete)',
    description: 'High-contrast draft board with color-coded stickers across 12 fantasy teams.',
    teams: 12,
    rounds: 4,
    thumbnailUrl: createSampleBoardSvg('12-Team Standard Draft Board', 12, 4),
    picksData: {
      draft_info: {
        total_teams: 12,
        total_rounds: 4,
        detected_picks: 48,
        teams: Array.from({ length: 12 }, (_, i) => ({ column: i + 1, name: `Team ${i + 1}` }))
      },
      picks: [
        { round: 1, pick_in_round: 1, overall_pick: 1, team_column: 1, team_name: 'Team 1', player_name: 'Christian McCaffrey', position: 'RB', nfl_team: 'SF', raw_text: 'C. McCaffrey RB SF', confidence: 0.99, status: 'confirmed' },
        { round: 1, pick_in_round: 2, overall_pick: 2, team_column: 2, team_name: 'Team 2', player_name: 'CeeDee Lamb', position: 'WR', nfl_team: 'DAL', raw_text: 'C. Lamb WR DAL', confidence: 0.98, status: 'confirmed' },
        { round: 1, pick_in_round: 3, overall_pick: 3, team_column: 3, team_name: 'Team 3', player_name: 'Tyreek Hill', position: 'WR', nfl_team: 'MIA', raw_text: 'T. Hill WR MIA', confidence: 0.97, status: 'confirmed' },
        { round: 1, pick_in_round: 4, overall_pick: 4, team_column: 4, team_name: 'Team 4', player_name: 'Justin Jefferson', position: 'WR', nfl_team: 'MIN', raw_text: 'J. Jefferson WR MIN', confidence: 0.98, status: 'confirmed' },
        { round: 1, pick_in_round: 5, overall_pick: 5, team_column: 5, team_name: 'Team 5', player_name: 'Ja\'Marr Chase', position: 'WR', nfl_team: 'CIN', raw_text: 'J. Chase WR CIN', confidence: 0.96, status: 'confirmed' },
        { round: 1, pick_in_round: 6, overall_pick: 6, team_column: 6, team_name: 'Team 6', player_name: 'Breece Hall', position: 'RB', nfl_team: 'NYJ', raw_text: 'B. Hall RB NYJ', confidence: 0.95, status: 'confirmed' },
        { round: 1, pick_in_round: 7, overall_pick: 7, team_column: 7, team_name: 'Team 7', player_name: 'Bijan Robinson', position: 'RB', nfl_team: 'ATL', raw_text: 'B. Robinson RB ATL', confidence: 0.97, status: 'confirmed' },
        { round: 1, pick_in_round: 8, overall_pick: 8, team_column: 8, team_name: 'Team 8', player_name: 'Amon-Ra St. Brown', position: 'WR', nfl_team: 'DET', raw_text: 'A. St. Brown WR DET', confidence: 0.94, status: 'confirmed' },
        { round: 1, pick_in_round: 9, overall_pick: 9, team_column: 9, team_name: 'Team 9', player_name: 'A.J. Brown', position: 'WR', nfl_team: 'PHI', raw_text: 'A.J. Brown WR PHI', confidence: 0.99, status: 'confirmed' },
        { round: 1, pick_in_round: 10, overall_pick: 10, team_column: 10, team_name: 'Team 10', player_name: 'Saquon Barkley', position: 'RB', nfl_team: 'PHI', raw_text: 'S. Barkley RB PHI', confidence: 0.93, status: 'confirmed' },
        { round: 1, pick_in_round: 11, overall_pick: 11, team_column: 11, team_name: 'Team 11', player_name: 'Jonathan Taylor', position: 'RB', nfl_team: 'IND', raw_text: 'J. Taylor RB IND', confidence: 0.91, status: 'confirmed' },
        { round: 1, pick_in_round: 12, overall_pick: 12, team_column: 12, team_name: 'Team 12', player_name: 'Puka Nacua', position: 'WR', nfl_team: 'LAR', raw_text: 'P. Nacua WR LAR', confidence: 0.88, status: 'confirmed' },
        
        // Round 2 (Snake Draft order simulation or row mapping)
        { round: 2, pick_in_round: 1, overall_pick: 13, team_column: 1, team_name: 'Team 1', player_name: 'Garrett Wilson', position: 'WR', nfl_team: 'NYJ', raw_text: 'G. Wilson WR NYJ', confidence: 0.92, status: 'confirmed' },
        { round: 2, pick_in_round: 2, overall_pick: 14, team_column: 2, team_name: 'Team 2', player_name: 'Jahmyr Gibbs', position: 'RB', nfl_team: 'DET', raw_text: 'J. Gibbs RB DET', confidence: 0.95, status: 'confirmed' },
        { round: 2, pick_in_round: 3, overall_pick: 3, team_column: 3, team_name: 'Team 3', player_name: 'Marvin Harrison Jr.', position: 'WR', nfl_team: 'ARI', raw_text: 'M. Harrison WR ARI', confidence: 0.89, status: 'confirmed' },
        { round: 2, pick_in_round: 4, overall_pick: 4, team_column: 4, team_name: 'Team 4', player_name: 'Kyren Williams', position: 'RB', nfl_team: 'LAR', raw_text: 'K. Williams RB LAR', confidence: 0.86, status: 'confirmed' },
        { round: 2, pick_in_round: 5, overall_pick: 5, team_column: 5, team_name: 'Team 5', player_name: 'Derrick Henry', position: 'RB', nfl_team: 'BAL', raw_text: 'D. Henry RB BAL', confidence: 0.98, status: 'confirmed' },
        { round: 2, pick_in_round: 6, overall_pick: 6, team_column: 6, team_name: 'Team 6', player_name: 'Travis Kelce', position: 'TE', nfl_team: 'KC', raw_text: 'T. Kelce TE KC', confidence: 0.97, status: 'confirmed' },
        { round: 2, pick_in_round: 7, overall_pick: 7, team_column: 7, team_name: 'Team 7', player_name: 'Drake London', position: 'WR', nfl_team: 'ATL', raw_text: 'D. London WR ATL', confidence: 0.82, status: 'confirmed' },
        { round: 2, pick_in_round: 8, overall_pick: 8, team_column: 8, team_name: 'Team 8', player_name: 'De\'Von Achane', position: 'RB', nfl_team: 'MIA', raw_text: 'D. Achane RB MIA', confidence: 0.79, status: 'needs_review' },
        { round: 2, pick_in_round: 9, overall_pick: 9, team_column: 9, team_name: 'Team 9', player_name: 'Davante Adams', position: 'WR', nfl_team: 'LV', raw_text: 'D. Adams WR LV', confidence: 0.91, status: 'confirmed' },
        { round: 2, pick_in_round: 10, overall_pick: 10, team_column: 10, team_name: 'Team 10', player_name: 'Chris Olave', position: 'WR', nfl_team: 'NO', raw_text: 'C. Olave WR NO', confidence: 0.88, status: 'confirmed' },
        { round: 2, pick_in_round: 11, overall_pick: 11, team_column: 11, team_name: 'Team 11', player_name: 'Josh Allen', position: 'QB', nfl_team: 'BUF', raw_text: 'J. Allen QB BUF', confidence: 0.99, status: 'confirmed' },
        { round: 2, pick_in_round: 12, overall_pick: 12, team_column: 12, team_name: 'Team 12', player_name: 'Patrick Mahomes', position: 'QB', nfl_team: 'KC', raw_text: 'P. Mahomes QB KC', confidence: 0.98, status: 'confirmed' },

        // Round 3
        { round: 3, pick_in_round: 1, overall_pick: 25, team_column: 1, team_name: 'Team 1', player_name: 'Sam LaPorta', position: 'TE', nfl_team: 'DET', raw_text: 'S. LaPorta TE DET', confidence: 0.94, status: 'confirmed' },
        { round: 3, pick_in_round: 2, overall_pick: 26, team_column: 2, team_name: 'Team 2', player_name: 'Lamar Jackson', position: 'QB', nfl_team: 'BAL', raw_text: 'L. Jackson QB BAL', confidence: 0.96, status: 'confirmed' },
        { round: 3, pick_in_round: 3, overall_pick: 27, team_column: 3, team_name: 'Team 3', player_name: 'Isiah Pacheco', position: 'RB', nfl_team: 'KC', raw_text: 'I. Pacheco RB KC', confidence: 0.87, status: 'confirmed' },
        { round: 3, pick_in_round: 4, overall_pick: 28, team_column: 4, team_name: 'Team 4', player_name: 'Mike Evans', position: 'WR', nfl_team: 'TB', raw_text: 'M. Evans WR TB', confidence: 0.93, status: 'confirmed' },
        { round: 3, pick_in_round: 5, overall_pick: 29, team_column: 5, team_name: 'Team 5', player_name: 'Nico Collins', position: 'WR', nfl_team: 'HOU', raw_text: 'N. Collins WR HOU', confidence: 0.90, status: 'confirmed' },
        { round: 3, pick_in_round: 6, overall_pick: 30, team_column: 6, team_name: 'Team 6', player_name: 'Travis Etienne Jr.', position: 'RB', nfl_team: 'JAX', raw_text: 'T. Etienne RB JAX', confidence: 0.84, status: 'confirmed' },
        { round: 3, pick_in_round: 7, overall_pick: 31, team_column: 7, team_name: 'Team 7', player_name: 'Brandon Aiyuk', position: 'WR', nfl_team: 'SF', raw_text: 'B. Aiyuk WR SF', confidence: 0.88, status: 'confirmed' },
        { round: 3, pick_in_round: 8, overall_pick: 32, team_column: 8, team_name: 'Team 8', player_name: 'Josh Jacobs', position: 'RB', nfl_team: 'GB', raw_text: 'J. Jacobs RB GB', confidence: 0.92, status: 'confirmed' },
        { round: 3, pick_in_round: 9, overall_pick: 33, team_column: 9, team_name: 'Team 9', player_name: 'Trey McBride', position: 'TE', nfl_team: 'ARI', raw_text: 'T. McBride TE ARI', confidence: 0.91, status: 'confirmed' },
        { round: 3, pick_in_round: 10, overall_pick: 34, team_column: 10, team_name: 'Team 10', player_name: 'Deebo Samuel', position: 'WR', nfl_team: 'SF', raw_text: 'D. Samuel WR SF', confidence: 0.85, status: 'confirmed' },
        { round: 3, pick_in_round: 11, overall_pick: 35, team_column: 11, team_name: 'Team 11', player_name: 'DK Metcalf', position: 'WR', nfl_team: 'SEA', raw_text: 'DK Metcalf WR SEA', confidence: 0.89, status: 'confirmed' },
        { round: 3, pick_in_round: 12, overall_pick: 36, team_column: 12, team_name: 'Team 12', player_name: 'Rachaad White', position: 'RB', nfl_team: 'TB', raw_text: 'R. White RB TB', confidence: 0.81, status: 'confirmed' },

        // Round 4
        { round: 4, pick_in_round: 1, overall_pick: 37, team_column: 1, team_name: 'Team 1', player_name: 'Kenneth Walker III', position: 'RB', nfl_team: 'SEA', raw_text: 'K. Walker RB SEA', confidence: 0.83, status: 'confirmed' },
        { round: 4, pick_in_round: 2, overall_pick: 38, team_column: 2, team_name: 'Team 2', player_name: 'Michael Pittman Jr.', position: 'WR', nfl_team: 'IND', raw_text: 'M. Pittman WR IND', confidence: 0.86, status: 'confirmed' },
        { round: 4, pick_in_round: 3, overall_pick: 39, team_column: 3, team_name: 'Team 3', player_name: 'Stefon Diggs', position: 'WR', nfl_team: 'HOU', raw_text: 'S. Diggs WR HOU', confidence: 0.91, status: 'confirmed' },
        { round: 4, pick_in_round: 4, overall_pick: 40, team_column: 4, team_name: 'Team 4', player_name: 'Mark Andrews', position: 'TE', nfl_team: 'BAL', raw_text: 'M. Andrews TE BAL', confidence: 0.90, status: 'confirmed' },
        { round: 4, pick_in_round: 5, overall_pick: 41, team_column: 5, team_name: 'Team 5', player_name: 'Jalen Hurts', position: 'QB', nfl_team: 'PHI', raw_text: 'J. Hurts QB PHI', confidence: 0.97, status: 'confirmed' },
        { round: 4, pick_in_round: 6, overall_pick: 42, team_column: 6, team_name: 'Team 6', player_name: 'Amari Cooper', position: 'WR', nfl_team: 'CLE', raw_text: 'A. Cooper WR CLE', confidence: 0.84, status: 'confirmed' },
        { round: 4, pick_in_round: 7, overall_pick: 43, team_column: 7, team_name: 'Team 7', player_name: 'James Cook', position: 'RB', nfl_team: 'BUF', raw_text: 'J. Cook RB BUF', confidence: 0.82, status: 'confirmed' },
        { round: 4, pick_in_round: 8, overall_pick: 44, team_column: 8, team_name: 'Team 8', player_name: 'Malik Nabers', position: 'WR', nfl_team: 'NYG', raw_text: 'M. Nabers WR NYG', confidence: 0.76, status: 'needs_review' },
        { round: 4, pick_in_round: 9, overall_pick: 45, team_column: 9, team_name: 'Team 9', player_name: 'George Kittle', position: 'TE', nfl_team: 'SF', raw_text: 'G. Kittle TE SF', confidence: 0.93, status: 'confirmed' },
        { round: 4, pick_in_round: 10, overall_pick: 46, team_column: 10, team_name: 'Team 10', player_name: 'Alvin Kamara', position: 'RB', nfl_team: 'NO', raw_text: 'A. Kamara RB NO', confidence: 0.89, status: 'confirmed' },
        { round: 4, pick_in_round: 11, overall_pick: 47, team_column: 11, team_name: 'Team 11', player_name: 'Joe Burrow', position: 'QB', nfl_team: 'CIN', raw_text: 'J. Burrow QB CIN', confidence: 0.94, status: 'confirmed' },
        { round: 4, pick_in_round: 12, overall_pick: 48, team_column: 12, team_name: 'Team 12', player_name: 'Dalton Kincaid', position: 'TE', nfl_team: 'BUF', raw_text: 'D. Kincaid TE BUF', confidence: 0.88, status: 'confirmed' }
      ]
    }
  },
  {
    id: 'sample-10-team-handwritten',
    title: '10-Team PPR Draft Board (Blurry/Handwritten Stickers)',
    description: 'Simulates challenging real-world draft board photos with handwriting and partially smudged stickers.',
    teams: 10,
    rounds: 3,
    thumbnailUrl: createSampleBoardSvg('10-Team Handwritten Board', 10, 3),
    picksData: {
      draft_info: {
        total_teams: 10,
        total_rounds: 3,
        detected_picks: 30,
        teams: Array.from({ length: 10 }, (_, i) => ({ column: i + 1, name: `Team ${i + 1}` }))
      },
      picks: [
        { round: 1, pick_in_round: 1, overall_pick: 1, team_column: 1, team_name: 'Team 1', player_name: 'Christian McCaffrey', position: 'RB', nfl_team: 'SF', raw_text: 'CMC RB SF', confidence: 0.92, status: 'confirmed' },
        { round: 1, pick_in_round: 2, overall_pick: 2, team_column: 2, team_name: 'Team 2', player_name: 'Justin Jefferson', position: 'WR', nfl_team: 'MIN', raw_text: 'J. Jeffersn WR MIN', confidence: 0.85, status: 'confirmed', notes: 'Spelling auto-corrected from "Jeffersn"' },
        { round: 1, pick_in_round: 3, overall_pick: 3, team_column: 3, team_name: 'Team 3', player_name: 'CeeDee Lamb', position: 'WR', nfl_team: 'DAL', raw_text: 'CD Lamb WR DAL', confidence: 0.89, status: 'confirmed' },
        { round: 1, pick_in_round: 4, overall_pick: 4, team_column: 4, team_name: 'Team 4', player_name: 'Tyreek Hill', position: 'WR', nfl_team: 'MIA', raw_text: 'T. Hill WR MIA', confidence: 0.91, status: 'confirmed' },
        { round: 1, pick_in_round: 5, overall_pick: 5, team_column: 5, team_name: 'Team 5', player_name: 'Ja\'Marr Chase', position: 'WR', nfl_team: 'CIN', raw_text: 'J. Chase WR CIN', confidence: 0.88, status: 'confirmed' },
        { round: 1, pick_in_round: 6, overall_pick: 6, team_column: 6, team_name: 'Team 6', player_name: 'Breece Hall', position: 'RB', nfl_team: 'NYJ', raw_text: 'B. Hall RB NYJ', confidence: 0.87, status: 'confirmed' },
        { round: 1, pick_in_round: 7, overall_pick: 7, team_column: 7, team_name: 'Team 7', player_name: 'Bijan Robinson', position: 'RB', nfl_team: 'ATL', raw_text: 'B Robinson RB ATL', confidence: 0.83, status: 'confirmed' },
        { round: 1, pick_in_round: 8, overall_pick: 8, team_column: 8, team_name: 'Team 8', player_name: 'Amon-Ra St. Brown', position: 'WR', nfl_team: 'DET', raw_text: 'A. St Brown WR DET', confidence: 0.80, status: 'confirmed' },
        { round: 1, pick_in_round: 9, overall_pick: 9, team_column: 9, team_name: 'Team 9', player_name: 'A.J. Brown', position: 'WR', nfl_team: 'PHI', raw_text: 'AJ Brown WR PHI', confidence: 0.88, status: 'confirmed' },
        { round: 1, pick_in_round: 10, overall_pick: 10, team_column: 10, team_name: 'Team 10', player_name: 'Saquon Barkley', position: 'RB', nfl_team: 'PHI', raw_text: 'S. Barkley RB PHI', confidence: 0.84, status: 'confirmed' },
        
        { round: 2, pick_in_round: 1, overall_pick: 11, team_column: 1, team_name: 'Team 1', player_name: 'Garrett Wilson', position: 'WR', nfl_team: 'NYJ', raw_text: 'G. Wlsn WR NYJ', confidence: 0.65, status: 'needs_review', notes: 'Blurry text resolved using WR + NYJ' },
        { round: 2, pick_in_round: 2, overall_pick: 12, team_column: 2, team_name: 'Team 2', player_name: 'Jahmyr Gibbs', position: 'RB', nfl_team: 'DET', raw_text: 'J. Gibbs RB DET', confidence: 0.89, status: 'confirmed' },
        { round: 2, pick_in_round: 3, overall_pick: 13, team_column: 3, team_name: 'Team 3', player_name: 'Jonathan Taylor', position: 'RB', nfl_team: 'IND', raw_text: 'J. Taylor RB IND', confidence: 0.90, status: 'confirmed' },
        { round: 2, pick_in_round: 4, overall_pick: 14, team_column: 4, team_name: 'Team 4', player_name: 'Puka Nacua', position: 'WR', nfl_team: 'LAR', raw_text: 'P. Nacua WR LAR', confidence: 0.81, status: 'confirmed' },
        { round: 2, pick_in_round: 5, overall_pick: 15, team_column: 5, team_name: 'Team 5', player_name: 'Marvin Harrison Jr.', position: 'WR', nfl_team: 'ARI', raw_text: 'MHJ WR ARI', confidence: 0.88, status: 'confirmed' },
        { round: 2, pick_in_round: 6, overall_pick: 16, team_column: 6, team_name: 'Team 6', player_name: 'Derrick Henry', position: 'RB', nfl_team: 'BAL', raw_text: 'D Henry RB BAL', confidence: 0.91, status: 'confirmed' },
        { round: 2, pick_in_round: 7, overall_pick: 17, team_column: 7, team_name: 'Team 7', player_name: 'Travis Kelce', position: 'TE', nfl_team: 'KC', raw_text: 'T Kelce TE KC', confidence: 0.94, status: 'confirmed' },
        { round: 2, pick_in_round: 8, overall_pick: 18, team_column: 8, team_name: 'Team 8', player_name: 'Kyren Williams', position: 'RB', nfl_team: 'LAR', raw_text: 'K Williams RB LAR', confidence: 0.78, status: 'confirmed' },
        { round: 2, pick_in_round: 9, overall_pick: 19, team_column: 9, team_name: 'Team 9', player_name: 'Davante Adams', position: 'WR', nfl_team: 'LV', raw_text: 'D. Adams WR LV', confidence: 0.87, status: 'confirmed' },
        { round: 2, pick_in_round: 10, overall_pick: 20, team_column: 10, team_name: 'Team 10', player_name: 'Josh Allen', position: 'QB', nfl_team: 'BUF', raw_text: 'J. Allen QB BUF', confidence: 0.95, status: 'confirmed' },

        { round: 3, pick_in_round: 1, overall_pick: 21, team_column: 1, team_name: 'Team 1', player_name: 'Patrick Mahomes', position: 'QB', nfl_team: 'KC', raw_text: 'P. Mahomes QB KC', confidence: 0.96, status: 'confirmed' },
        { round: 3, pick_in_round: 2, overall_pick: 22, team_column: 2, team_name: 'Team 2', player_name: 'Sam LaPorta', position: 'TE', nfl_team: 'DET', raw_text: 'S. LaPorta TE DET', confidence: 0.90, status: 'confirmed' },
        { round: 3, pick_in_round: 3, overall_pick: 23, team_column: 3, team_name: 'Team 3', player_name: 'Lamar Jackson', position: 'QB', nfl_team: 'BAL', raw_text: 'L. Jackson QB BAL', confidence: 0.93, status: 'confirmed' },
        { round: 3, pick_in_round: 4, overall_pick: 24, team_column: 4, team_name: 'Team 4', player_name: 'Isiah Pacheco', position: 'RB', nfl_team: 'KC', raw_text: 'I. Pacheco RB KC', confidence: 0.86, status: 'confirmed' },
        { round: 3, pick_in_round: 5, overall_pick: 25, team_column: 5, team_name: 'Team 5', player_name: 'De\'Von Achane', position: 'RB', nfl_team: 'MIA', raw_text: 'D. Achane RB MIA', confidence: 0.80, status: 'confirmed' },
        { round: 3, pick_in_round: 6, overall_pick: 26, team_column: 6, team_name: 'Team 6', player_name: 'Chris Olave', position: 'WR', nfl_team: 'NO', raw_text: 'C. Olave WR NO', confidence: 0.83, status: 'confirmed' },
        { round: 3, pick_in_round: 7, overall_pick: 7, team_column: 7, team_name: 'Team 7', player_name: 'Mike Evans', position: 'WR', nfl_team: 'TB', raw_text: 'M. Evans WR TB', confidence: 0.91, status: 'confirmed' },
        { round: 3, pick_in_round: 8, overall_pick: 8, team_column: 8, team_name: 'Team 8', player_name: 'Nico Collins', position: 'WR', nfl_team: 'HOU', raw_text: 'N. Collins WR HOU', confidence: 0.88, status: 'confirmed' },
        { round: 3, pick_in_round: 9, overall_pick: 9, team_column: 9, team_name: 'Team 9', player_name: 'San Francisco 49ers', position: 'DST', nfl_team: 'SF', raw_text: 'SF DST', confidence: 0.94, status: 'confirmed' },
        { round: 3, pick_in_round: 10, overall_pick: 10, team_column: 10, team_name: 'Team 10', player_name: 'Justin Tucker', position: 'K', nfl_team: 'BAL', raw_text: 'J. Tucker K BAL', confidence: 0.97, status: 'confirmed' }
      ]
    }
  }
];
