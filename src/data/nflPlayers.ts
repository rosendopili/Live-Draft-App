import { Position } from '../types';

export interface NFLPlayer {
  id: string;
  name: string;
  position: Position;
  nflTeam: string;
  adp: number;
  tier: number;
  rank: number;
  positionRank: string; // e.g. "RB1", "WR4"
  byeWeek: number;
  projectedPtsPPR: number;
  tags: string[];
  notes?: string;
}

export const NFL_PLAYERS_DATABASE = 'NFL_PLAYERS_DATABASE';

export const INITIAL_NFL_PLAYERS: NFLPlayer[] = [
  // Round 1 Tier 1 Elite
  { id: '1', name: 'Christian McCaffrey', position: 'RB', nflTeam: 'SF', adp: 1.1, tier: 1, rank: 1, positionRank: 'RB1', byeWeek: 9, projectedPtsPPR: 345, tags: ['Workhorse', 'Elite Receiving', 'Tier 1'], notes: 'Consensus #1 pick with elite floor and ceiling in Shanahan offense.' },
  { id: '2', name: 'CeeDee Lamb', position: 'WR', nflTeam: 'DAL', adp: 2.2, tier: 1, rank: 2, positionRank: 'WR1', byeWeek: 7, projectedPtsPPR: 320, tags: ['Target Monster', 'PPR Alpha'], notes: 'Led NFL in targets and receptions. Dak Prescott primary weapon.' },
  { id: '3', name: 'Tyreek Hill', position: 'WR', nflTeam: 'MIA', adp: 3.1, tier: 1, rank: 3, positionRank: 'WR2', byeWeek: 6, projectedPtsPPR: 315, tags: ['Gamebreaker', 'Speedster'], notes: '2,000-yard upside in McDaniel explosive Miami offense.' },
  { id: '4', name: 'Breece Hall', position: 'RB', nflTeam: 'NYJ', adp: 4.5, tier: 1, rank: 4, positionRank: 'RB2', byeWeek: 12, projectedPtsPPR: 300, tags: ['Pass Catcher', 'Workhorse'], notes: 'Elite dual-threat RB benefiting from Aaron Rodgers return.' },
  { id: '5', name: 'Bijan Robinson', position: 'RB', nflTeam: 'ATL', adp: 5.2, tier: 1, rank: 5, positionRank: 'RB3', byeWeek: 12, projectedPtsPPR: 295, tags: ['Breakout Star', 'Three-Down'], notes: 'Prime breakout candidate under new offensive coaching staff.' },
  { id: '6', name: 'Justin Jefferson', position: 'WR', nflTeam: 'MIN', adp: 6.1, tier: 1, rank: 6, positionRank: 'WR3', byeWeek: 6, projectedPtsPPR: 305, tags: ['Elite Skill', 'WR Alpha'], notes: 'Generational wide receiver talent guaranteed 150+ targets.' },
  { id: '7', name: 'Amon-Ra St. Brown', position: 'WR', nflTeam: 'DET', adp: 7.3, tier: 1, rank: 7, positionRank: 'WR4', byeWeek: 5, projectedPtsPPR: 298, tags: ['Slot God', 'PPR Lock'], notes: 'High-floor volume vacuum in potent Lions offense.' },
  { id: '8', name: 'Ja\'Marr Chase', position: 'WR', nflTeam: 'CIN', adp: 8.0, tier: 1, rank: 8, positionRank: 'WR5', byeWeek: 12, projectedPtsPPR: 290, tags: ['Deep Threat', 'TD Monster'], notes: 'Reunited with healthy Joe Burrow for massive upside.' },
  { id: '9', name: 'Saquon Barkley', position: 'RB', nflTeam: 'PHI', adp: 9.4, tier: 1, rank: 9, positionRank: 'RB4', byeWeek: 5, projectedPtsPPR: 285, tags: ['Offensive Upgrade', 'Workhorse'], notes: 'Upgraded behind elite Eagles offensive line with massive TD potential.' },
  { id: '10', name: 'AJ Brown', position: 'WR', nflTeam: 'PHI', adp: 10.2, tier: 1, rank: 10, positionRank: 'WR6', byeWeek: 5, projectedPtsPPR: 275, tags: ['YAC Specialist', 'Physical Alpha'], notes: 'Physical force outside with consistent double-digit TD upside.' },
  { id: '11', name: 'Jonathan Taylor', position: 'RB', nflTeam: 'IND', adp: 11.5, tier: 1, rank: 11, positionRank: 'RB5', byeWeek: 14, projectedPtsPPR: 270, tags: ['Pure Runner', 'Goal Line'], notes: 'Fully healthy entering season paired with Anthony Richardson.' },
  { id: '12', name: 'Garrett Wilson', position: 'WR', nflTeam: 'NYJ', adp: 12.1, tier: 1, rank: 12, positionRank: 'WR7', byeWeek: 12, projectedPtsPPR: 265, tags: ['Breakout Target', 'WR1 Upside'], notes: 'Positioned for massive Year 3 explosion with Aaron Rodgers.' },

  // Round 2
  { id: '13', name: 'Puka Nacua', position: 'WR', nflTeam: 'LAR', adp: 13.0, tier: 2, rank: 13, positionRank: 'WR8', byeWeek: 6, projectedPtsPPR: 260, tags: ['Rookie Phenom', 'Target Machine'], notes: 'Set NFL rookie receiving record. High PPR floor.' },
  { id: '14', name: 'Jahmyr Gibbs', position: 'RB', nflTeam: 'DET', adp: 14.2, tier: 2, rank: 14, positionRank: 'RB6', byeWeek: 5, projectedPtsPPR: 255, tags: ['Explosive', 'Pass Catcher'], notes: 'Dynamic playmaker with home-run speed on every touch.' },
  { id: '15', name: 'Kyren Williams', position: 'RB', nflTeam: 'LAR', adp: 15.1, tier: 2, rank: 15, positionRank: 'RB7', byeWeek: 6, projectedPtsPPR: 250, tags: ['Touch Monster', 'Red Zone'], notes: 'Averaged 20+ touches per game in McVay offense.' },
  { id: '16', name: 'Marvin Harrison Jr.', position: 'WR', nflTeam: 'ARI', adp: 16.0, tier: 2, rank: 16, positionRank: 'WR9', byeWeek: 11, projectedPtsPPR: 248, tags: ['Generational Rookie', 'WR1 Alpha'], notes: 'Instant focal point of Kyler Murray passing attack.' },
  { id: '17', name: 'Derrick Henry', position: 'RB', nflTeam: 'BAL', adp: 17.5, tier: 2, rank: 17, positionRank: 'RB8', byeWeek: 14, projectedPtsPPR: 245, tags: ['King Henry', 'TD Hammer'], notes: 'Joined Lamar Jackson in Baltimore for unmatched goal line threat.' },
  { id: '18', name: 'Drake London', position: 'WR', nflTeam: 'ATL', adp: 18.2, tier: 2, rank: 18, positionRank: 'WR10', byeWeek: 12, projectedPtsPPR: 240, tags: ['Breakout', 'QB Upgrade'], notes: 'Kirk Cousins QB upgrade unlocks London true WR1 potential.' },
  { id: '19', name: 'Chris Olave', position: 'WR', nflTeam: 'NO', adp: 19.1, tier: 2, rank: 19, positionRank: 'WR11', byeWeek: 12, projectedPtsPPR: 238, tags: ['Air Yards', 'Smooth Technician'], notes: 'Dominates air yards share in Saints passing offense.' },
  { id: '20', name: 'Travis Etienne Jr.', position: 'RB', nflTeam: 'JAX', adp: 20.0, tier: 2, rank: 20, positionRank: 'RB9', byeWeek: 12, projectedPtsPPR: 235, tags: ['Three-Down', 'High Touch'], notes: 'Reliable volume RB1 with receiving work in Jacksonville.' },
  { id: '21', name: 'De\'Von Achane', position: 'RB', nflTeam: 'MIA', adp: 21.3, tier: 2, rank: 21, positionRank: 'RB10', byeWeek: 6, projectedPtsPPR: 232, tags: ['Electric Speed', 'RB Ceiling'], notes: 'Historical efficiency in Miami. Massive weekly winning upside.' },
  { id: '22', name: 'Davante Adams', position: 'WR', nflTeam: 'LV', adp: 22.0, tier: 2, rank: 22, positionRank: 'WR12', byeWeek: 10, projectedPtsPPR: 230, tags: ['Veteran Alpha', 'Route Technician'], notes: 'Elite route runner who commands double-digit targets every week.' },
  { id: '23', name: 'Josh Allen', position: 'QB', nflTeam: 'BUF', adp: 23.0, tier: 2, rank: 23, positionRank: 'QB1', byeWeek: 12, projectedPtsPPR: 380, tags: ['Konami Code', 'QB1 Overall'], notes: 'Premier dual-threat QB with 10+ rushing TD potential annually.' },
  { id: '24', name: 'Sam LaPorta', position: 'TE', nflTeam: 'DET', adp: 24.0, tier: 2, rank: 24, positionRank: 'TE1', byeWeek: 5, projectedPtsPPR: 220, tags: ['TE1 Overall', 'Red Zone Target'], notes: 'Historical rookie tight end season. Top target for Jared Goff.' },

  // Round 3
  { id: '25', name: 'Patrick Mahomes', position: 'QB', nflTeam: 'KC', adp: 25.5, tier: 2, rank: 25, positionRank: 'QB2', byeWeek: 6, projectedPtsPPR: 365, tags: ['Elite Passer', 'Superstar'], notes: 'Re-tooled receiving core with Worthy and Brown speed.' },
  { id: '26', name: 'Lamar Jackson', position: 'QB', nflTeam: 'BAL', adp: 26.2, tier: 2, rank: 26, positionRank: 'QB3', byeWeek: 14, projectedPtsPPR: 370, tags: ['MVP Rushing', 'Konami Code'], notes: 'Two-time MVP with unmatched rushing floor at quarterback.' },
  { id: '27', name: 'Travis Kelce', position: 'TE', nflTeam: 'KC', adp: 27.1, tier: 2, rank: 27, positionRank: 'TE2', byeWeek: 6, projectedPtsPPR: 215, tags: ['Hall of Famer', 'PPR Machine'], notes: 'Mahomes favorite target in high-leverage and red zone situations.' },
  { id: '28', name: 'Nico Collins', position: 'WR', nflTeam: 'HOU', adp: 28.0, tier: 3, rank: 28, positionRank: 'WR13', byeWeek: 14, projectedPtsPPR: 235, tags: ['Texans Alpha', 'CJ Stroud WR'], notes: 'Elite YAC and efficiency paired with superstar CJ Stroud.' },
  { id: '29', name: 'Isiah Pacheco', position: 'RB', nflTeam: 'KC', adp: 29.3, tier: 3, rank: 29, positionRank: 'RB11', byeWeek: 6, projectedPtsPPR: 225, tags: ['Violent Runner', 'Chiefs Bellcow'], notes: 'Unquestioned lead back in Chiefs high-powered offense.' },
  { id: '30', name: 'Josh Jacobs', position: 'RB', nflTeam: 'GB', adp: 30.1, tier: 3, rank: 30, positionRank: 'RB12', byeWeek: 10, projectedPtsPPR: 220, tags: ['Packers Lead', 'Goal Line'], notes: 'Signed as Packers premier back. Big touchdown upside.' },
  { id: '31', name: 'Mike Evans', position: 'WR', nflTeam: 'TB', adp: 31.0, tier: 3, rank: 31, positionRank: 'WR14', byeWeek: 11, projectedPtsPPR: 228, tags: ['1000-Yard Streak', 'TD Specialist'], notes: '10 consecutive 1,000-yard seasons. Baker Mayfield primary target.' },
  { id: '32', name: 'Deebo Samuel', position: 'WR', nflTeam: 'SF', adp: 32.4, tier: 3, rank: 32, positionRank: 'WR15', byeWeek: 9, projectedPtsPPR: 225, tags: ['Wide Back', 'YAC King'], notes: 'Dual threat receiving and rushing in Shanahan offensive system.' },
  { id: '33', name: 'Stefon Diggs', position: 'WR', nflTeam: 'HOU', adp: 33.2, tier: 3, rank: 33, positionRank: 'WR16', byeWeek: 14, projectedPtsPPR: 222, tags: ['Veteran WR', 'Stroud Weapon'], notes: 'Traded to Houston to join explosive Texans passing game.' },
  { id: '34', name: 'Brandon Aiyuk', position: 'WR', nflTeam: 'SF', adp: 34.0, tier: 3, rank: 34, positionRank: 'WR17', byeWeek: 9, projectedPtsPPR: 220, tags: ['Route Specialist', 'Efficiency'], notes: 'Led 49ers in receiving yards. High yards-per-target efficiency.' },
  { id: '35', name: 'Rachaad White', position: 'RB', nflTeam: 'TB', adp: 35.1, tier: 3, rank: 35, positionRank: 'RB13', byeWeek: 11, projectedPtsPPR: 218, tags: ['Pass Catcher', 'PPR Workhorse'], notes: 'Elite pass-catching floor among running backs.' },
  { id: '36', name: 'Trey McBride', position: 'TE', nflTeam: 'ARI', adp: 36.0, tier: 3, rank: 36, positionRank: 'TE3', byeWeek: 11, projectedPtsPPR: 210, tags: ['Target Vacuum', 'TE Breakout'], notes: 'Averaged 8+ targets per game with Kyler Murray back.' },

  // Round 4
  { id: '37', name: 'Jalen Hurts', position: 'QB', nflTeam: 'PHI', adp: 37.0, tier: 3, rank: 37, positionRank: 'QB4', byeWeek: 5, projectedPtsPPR: 360, tags: ['Tush Push', 'TD Machine'], notes: 'Brotherly shove guarantees 10+ rushing touchdowns per year.' },
  { id: '38', name: 'DK Metcalf', position: 'WR', nflTeam: 'SEA', adp: 38.2, tier: 3, rank: 38, positionRank: 'WR18', byeWeek: 10, projectedPtsPPR: 215, tags: ['Physical Freak', 'Red Zone'], notes: 'New offensive scheme under Ryan Grubb to unlock downfield passing.' },
  { id: '39', name: 'DJ Moore', position: 'WR', nflTeam: 'CHI', adp: 39.0, tier: 3, rank: 39, positionRank: 'WR19', byeWeek: 7, projectedPtsPPR: 212, tags: ['Caleb Williams WR', 'YAC'], notes: 'Top target for #1 overall pick Caleb Williams.' },
  { id: '40', name: 'James Cook', position: 'RB', nflTeam: 'BUF', adp: 40.1, tier: 3, rank: 40, positionRank: 'RB14', byeWeek: 12, projectedPtsPPR: 210, tags: ['Bills Lead Back', 'YPC Leader'], notes: 'Dynamic dual-threat lead runner in Joe Brady offense.' },
  { id: '41', name: 'Mark Andrews', position: 'TE', nflTeam: 'BAL', adp: 41.0, tier: 3, rank: 41, positionRank: 'TE4', byeWeek: 14, projectedPtsPPR: 205, tags: ['Red Zone Weapon', 'Lamar Safety Valve'], notes: 'Consistently among top tight ends in target share.' },
  { id: '42', name: 'Joe Mixon', position: 'RB', nflTeam: 'HOU', adp: 42.3, tier: 3, rank: 42, positionRank: 'RB15', byeWeek: 14, projectedPtsPPR: 208, tags: ['Texans Bellcow', 'Goal Line'], notes: 'Acquired to be Houston unquestioned primary early-down and goal line RB.' },
  { id: '43', name: 'Kenneth Walker III', position: 'RB', nflTeam: 'SEA', adp: 43.1, tier: 3, rank: 43, positionRank: 'RB16', byeWeek: 10, projectedPtsPPR: 205, tags: ['Home Run Hitter', 'Pure Runner'], notes: 'Explosive runner under new Seahawks offensive staff.' },
  { id: '44', name: 'Malik Nabers', position: 'WR', nflTeam: 'NYG', adp: 44.0, tier: 3, rank: 44, positionRank: 'WR20', byeWeek: 11, projectedPtsPPR: 208, tags: ['Rookie Explosive', 'Target Vacuum'], notes: 'LSU phenom expected to see 130+ targets immediately.' },
  { id: '45', name: 'Cooper Kupp', position: 'WR', nflTeam: 'LAR', adp: 45.2, tier: 3, rank: 45, positionRank: 'WR21', byeWeek: 6, projectedPtsPPR: 205, tags: ['Triple Crown WR', 'Slot Technician'], notes: 'Fully healthy offseason paired with Matthew Stafford.' },
  { id: '46', name: 'Alvin Kamara', position: 'RB', nflTeam: 'NO', adp: 46.0, tier: 3, rank: 46, positionRank: 'RB17', byeWeek: 12, projectedPtsPPR: 202, tags: ['PPR King', 'Pass Catcher'], notes: 'Top pass-catching RB in fantasy football history.' },
  { id: '47', name: 'George Kittle', position: 'TE', nflTeam: 'SF', adp: 47.1, tier: 3, rank: 47, positionRank: 'TE5', byeWeek: 9, projectedPtsPPR: 200, tags: ['YAC Monster', 'Tight End Elite'], notes: 'Explosive tight end with multiple 1,000-yard seasons.' },
  { id: '48', name: 'C.J. Stroud', position: 'QB', nflTeam: 'HOU', adp: 48.0, tier: 3, rank: 48, positionRank: 'QB5', byeWeek: 14, projectedPtsPPR: 340, tags: ['Sophomore Phenom', 'Passer'], notes: 'Surrounded by Diggs, Collins, Dell, and Schultz.' },

  // Round 5
  { id: '49', name: 'Amari Cooper', position: 'WR', nflTeam: 'CLE', adp: 49.0, tier: 4, rank: 49, positionRank: 'WR22', byeWeek: 10, projectedPtsPPR: 200, tags: ['Route Specialist', 'WR1 Alpha'], notes: 'Clean route technician with 200-yard game ceiling.' },
  { id: '50', name: 'Tee Higgins', position: 'WR', nflTeam: 'CIN', adp: 50.1, tier: 4, rank: 50, positionRank: 'WR23', byeWeek: 12, projectedPtsPPR: 198, tags: ['Contested Catch', 'Bengals WR2'], notes: 'Contract year motivation with Joe Burrow.' },
  { id: '51', name: 'Aaron Jones', position: 'RB', nflTeam: 'MIN', adp: 51.0, tier: 4, rank: 51, positionRank: 'RB18', byeWeek: 6, projectedPtsPPR: 195, tags: ['Vikings Lead', 'Pass Catcher'], notes: 'Dynamic dual-threat lead runner for Kevin O\'Connell.' },
  { id: '52', name: 'George Pickens', position: 'WR', nflTeam: 'PIT', adp: 52.2, tier: 4, rank: 52, positionRank: 'WR24', byeWeek: 9, projectedPtsPPR: 195, tags: ['Highlight Catch', 'Steelers Alpha'], notes: 'Clear #1 option in Pittsburgh passing offense.' },
  { id: '53', name: 'Dalton Kincaid', position: 'TE', nflTeam: 'BUF', adp: 53.0, tier: 4, rank: 53, positionRank: 'TE6', byeWeek: 12, projectedPtsPPR: 190, tags: ['Josh Allen Target', 'TE Breakout'], notes: 'Expected to inherit large share of Stefon Diggs targets.' },
  { id: '54', name: 'Zay Flowers', position: 'WR', nflTeam: 'BAL', adp: 54.1, tier: 4, rank: 54, positionRank: 'WR25', byeWeek: 14, projectedPtsPPR: 192, tags: ['YAC Dynamic', 'Lamar WR1'], notes: 'Ravens lead wide receiver with explosive elusiveness.' },
  { id: '55', name: 'Anthony Richardson', position: 'QB', nflTeam: 'IND', adp: 55.0, tier: 4, rank: 55, positionRank: 'QB6', byeWeek: 14, projectedPtsPPR: 350, tags: ['Rushing Ceiling', 'Konami QB'], notes: 'Unmatched physical tools and rushing touchdown upside.' },
  { id: '56', name: 'Rhamondre Stevenson', position: 'RB', nflTeam: 'NE', adp: 56.2, tier: 4, rank: 56, positionRank: 'RB19', byeWeek: 14, projectedPtsPPR: 188, tags: ['Workhorse Contract', 'PPR Back'], notes: 'Signed major extension to lead Patriots backfield.' },
  { id: '57', name: 'David Montgomery', position: 'RB', nflTeam: 'DET', adp: 57.0, tier: 4, rank: 57, positionRank: 'RB20', byeWeek: 5, projectedPtsPPR: 185, tags: ['Goal Line Hammer', 'Lions RB'], notes: '13 touchdowns last season behind elite offensive line.' },
  { id: '58', name: 'Terry McLaurin', position: 'WR', nflTeam: 'WAS', adp: 58.1, tier: 4, rank: 58, positionRank: 'WR26', byeWeek: 14, projectedPtsPPR: 190, tags: ['Jayden Daniels WR', 'Contested Catch'], notes: 'Finally gets elite rookie QB Jayden Daniels throwing to him.' },
  { id: '59', name: 'Christian Kirk', position: 'WR', nflTeam: 'JAX', adp: 59.0, tier: 4, rank: 59, positionRank: 'WR27', byeWeek: 12, projectedPtsPPR: 188, tags: ['Slot Target', 'Trevor Lawrence WR'], notes: 'Trevor Lawrence trusted slot weapon.' },
  { id: '60', name: 'James Conner', position: 'RB', nflTeam: 'ARI', adp: 60.0, tier: 4, rank: 60, positionRank: 'RB21', byeWeek: 11, projectedPtsPPR: 185, tags: ['Tough Runner', 'Cardinals Bellcow'], notes: '1,000-yard season runner with high touch volume.' },

  // Round 6
  { id: '61', name: 'D\'Andre Swift', position: 'RB', nflTeam: 'CHI', adp: 61.0, tier: 4, rank: 61, positionRank: 'RB22', byeWeek: 7, projectedPtsPPR: 180, tags: ['Bears Lead', 'Dual Threat'], notes: 'Signed to lead Chicago backfield with Caleb Williams.' },
  { id: '62', name: 'Xavier Worthy', position: 'WR', nflTeam: 'KC', adp: 62.0, tier: 4, rank: 62, positionRank: 'WR28', byeWeek: 6, projectedPtsPPR: 182, tags: ['4.21 Speed', 'Mahomes Deep Threat'], notes: 'Broke NFL Combine 40-yard dash record. Instant Chiefs weapon.' },
  { id: '63', name: 'Kyle Pitts', position: 'TE', nflTeam: 'ATL', adp: 63.0, tier: 4, rank: 63, positionRank: 'TE7', byeWeek: 12, projectedPtsPPR: 180, tags: ['Unicorn', 'Kirk Cousins TE'], notes: 'Fresh start under new coaching and elite QB play.' },
  { id: '64', name: 'Chris Godwin', position: 'WR', nflTeam: 'TB', adp: 64.0, tier: 4, rank: 64, positionRank: 'WR29', byeWeek: 11, projectedPtsPPR: 185, tags: ['Slot Machine', 'PPR Floor'], notes: 'Moving back full-time to high-volume slot role.' },
  { id: '65', name: 'Najee Harris', position: 'RB', nflTeam: 'PIT', adp: 65.0, tier: 4, rank: 65, positionRank: 'RB23', byeWeek: 9, projectedPtsPPR: 178, tags: ['3x 1000-Yard', 'Arthur Smith RB'], notes: 'Arthur Smith run-heavy scheme benefits Najee.' },
  { id: '66', name: 'Calvin Ridley', position: 'WR', nflTeam: 'TEN', adp: 66.0, tier: 4, rank: 66, positionRank: 'WR30', byeWeek: 5, projectedPtsPPR: 180, tags: ['Titans WR1', 'Deep Target'], notes: 'Signed massive contract to be Will Levis primary WR.' },
  { id: '67', name: 'Dak Prescott', position: 'QB', nflTeam: 'DAL', adp: 67.0, tier: 4, rank: 67, positionRank: 'QB7', byeWeek: 7, projectedPtsPPR: 335, tags: ['MVP Runner Up', 'Volume Passer'], notes: 'Led NFL in passing touchdowns last season.' },
  { id: '68', name: 'Joe Burrow', position: 'QB', nflTeam: 'CIN', adp: 68.0, tier: 4, rank: 68, positionRank: 'QB8', byeWeek: 12, projectedPtsPPR: 330, tags: ['Passer Elite', 'Burrow Chase'], notes: 'Healthy wrist and ready to sling with Chase and Higgins.' },
  { id: '69', name: 'Zack Moss', position: 'RB', nflTeam: 'CIN', adp: 69.0, tier: 4, rank: 69, positionRank: 'RB24', byeWeek: 12, projectedPtsPPR: 172, tags: ['Bengals Starter', 'Goal Line'], notes: 'In line for early down and goal line work in Cincinnati.' },
  { id: '70', name: 'Keenan Allen', position: 'WR', nflTeam: 'CHI', adp: 70.0, tier: 4, rank: 70, positionRank: 'WR31', byeWeek: 7, projectedPtsPPR: 178, tags: ['PPR Veteran', 'Route Master'], notes: '100+ catch veteran now in Chicago slot.' },
  { id: '71', name: 'Tony Pollard', position: 'RB', nflTeam: 'TEN', adp: 71.0, tier: 4, rank: 71, positionRank: 'RB25', byeWeek: 5, projectedPtsPPR: 170, tags: ['Dual Threat', 'Titans RB'], notes: 'Paired with Tyjae Spears in Titans backfield.' },
  { id: '72', name: 'Evan Engram', position: 'TE', nflTeam: 'JAX', adp: 72.0, tier: 4, rank: 72, positionRank: 'TE8', byeWeek: 12, projectedPtsPPR: 175, tags: ['114 Catches', 'PPR TE'], notes: 'Second most receptions by a tight end in NFL history last year.' },

  // Round 7 & 8 Value Targets
  { id: '73', name: 'Raheem Mostert', position: 'RB', nflTeam: 'MIA', adp: 73.0, tier: 5, rank: 73, positionRank: 'RB26', byeWeek: 6, projectedPtsPPR: 168, tags: ['18 TDs', 'Speed'], notes: '2023 touchdown leader in explosive offense.' },
  { id: '74', name: 'Ladd McConkey', position: 'WR', nflTeam: 'LAC', adp: 74.0, tier: 5, rank: 74, positionRank: 'WR32', byeWeek: 5, projectedPtsPPR: 175, tags: ['Herbert WR1', 'Rookie Technician'], notes: 'Expected to lead Chargers in targets.' },
  { id: '75', name: 'Jaylen Warren', position: 'RB', nflTeam: 'PIT', adp: 75.0, tier: 5, rank: 75, positionRank: 'RB27', byeWeek: 9, projectedPtsPPR: 165, tags: ['Pass Catcher', 'YAC Specialist'], notes: 'High efficiency receiving back for Steelers.' },
  { id: '76', name: 'Kyler Murray', position: 'QB', nflTeam: 'ARI', adp: 76.0, tier: 5, rank: 76, positionRank: 'QB9', byeWeek: 11, projectedPtsPPR: 320, tags: ['Rushing QB', 'MHJ Stack'], notes: 'Paired with Marvin Harrison Jr for massive ceiling.' },
  { id: '77', name: 'Jordan Love', position: 'QB', nflTeam: 'GB', adp: 77.0, tier: 5, rank: 77, positionRank: 'QB10', byeWeek: 10, projectedPtsPPR: 315, tags: ['Breakout Passer', 'Packers QB'], notes: 'Top 5 fantasy QB over final 10 games of 2023.' },
  { id: '78', name: 'Jonnu Smith', position: 'TE', nflTeam: 'MIA', adp: 78.0, tier: 5, rank: 78, positionRank: 'TE9', byeWeek: 6, projectedPtsPPR: 145, tags: ['YAC Tight End'], notes: 'Dynamic move TE in McDaniel offense.' },
  { id: '79', name: 'Brock Bowers', position: 'TE', nflTeam: 'LV', adp: 79.0, tier: 5, rank: 79, positionRank: 'TE10', byeWeek: 10, projectedPtsPPR: 155, tags: ['Generational TE Rookie'], notes: 'Highest graded college TE prospect ever.' },
  { id: '80', name: 'Courtland Sutton', position: 'WR', nflTeam: 'DEN', adp: 80.0, tier: 5, rank: 80, positionRank: 'WR33', byeWeek: 14, projectedPtsPPR: 165, tags: ['10 TDs', 'Broncos WR1'], notes: 'Primary target in Sean Payton offense.' },
  { id: '81', name: 'Jaxon Smith-Njigba', position: 'WR', nflTeam: 'SEA', adp: 81.0, tier: 5, rank: 81, positionRank: 'WR34', byeWeek: 10, projectedPtsPPR: 162, tags: ['Year 2 Breakout', 'Slot Target'], notes: 'Poised for huge leap under new OC.' },
  { id: '82', name: 'Rome Odunze', position: 'WR', nflTeam: 'CHI', adp: 82.0, tier: 5, rank: 82, positionRank: 'WR35', byeWeek: 7, projectedPtsPPR: 160, tags: ['Top 10 Pick', 'Deep Weapon'], notes: 'Rookie #9 overall pick with elite size.' },
  { id: '83', name: 'Javonte Williams', position: 'RB', nflTeam: 'DEN', adp: 83.0, tier: 5, rank: 83, positionRank: 'RB28', byeWeek: 14, projectedPtsPPR: 158, tags: ['Power Back', 'Broncos Lead'], notes: 'Fully healthy 2 years removed from knee surgery.' },
  { id: '84', name: 'Trey Benson', position: 'RB', nflTeam: 'ARI', adp: 84.0, tier: 5, rank: 84, positionRank: 'RB29', byeWeek: 11, projectedPtsPPR: 150, tags: ['Rookie Speed', 'Handsoff upside'], notes: 'High upside rookie runner.' },

  // Top Defense & Kickers
  { id: '101', name: 'San Francisco 49ers', position: 'DST', nflTeam: 'SF', adp: 120.0, tier: 1, rank: 101, positionRank: 'DST1', byeWeek: 9, projectedPtsPPR: 130, tags: ['Elite Defense', 'Sack Machine'], notes: 'Top fantasy defense with Bosa and Warner.' },
  { id: '102', name: 'Baltimore Ravens', position: 'DST', nflTeam: 'BAL', adp: 122.0, tier: 1, rank: 102, positionRank: 'DST2', byeWeek: 14, projectedPtsPPR: 128, tags: ['Turnover Machine'], notes: 'Led NFL in sacks and takeaways in 2023.' },
  { id: '103', name: 'Dallas Cowboys', position: 'DST', nflTeam: 'DAL', adp: 124.0, tier: 1, rank: 103, positionRank: 'DST3', byeWeek: 7, projectedPtsPPR: 125, tags: ['Pick 6 Threat'], notes: 'Micah Parsons and Trevon Diggs high ceiling.' },
  { id: '104', name: 'Cleveland Browns', position: 'DST', nflTeam: 'CLE', adp: 128.0, tier: 1, rank: 104, positionRank: 'DST4', byeWeek: 10, projectedPtsPPR: 122, tags: ['Myles Garrett', 'Shutdown'], notes: 'Dominant home defense.' },
  { id: '105', name: 'Justin Tucker', position: 'K', nflTeam: 'BAL', adp: 130.0, tier: 1, rank: 105, positionRank: 'K1', byeWeek: 14, projectedPtsPPR: 145, tags: ['GOAT Kicker', '60+ Yarder'], notes: 'Most accurate kicker in NFL history.' },
  { id: '106', name: 'Harrison Butker', position: 'K', nflTeam: 'KC', adp: 132.0, tier: 1, rank: 106, positionRank: 'K2', byeWeek: 6, projectedPtsPPR: 142, tags: ['Clutch Kicker', 'High Scoring Offense'], notes: 'Chiefs high volume scoring drive multiplier.' },
  { id: '107', name: 'Brandon Aubrey', position: 'K', nflTeam: 'DAL', adp: 134.0, tier: 1, rank: 107, positionRank: 'K3', byeWeek: 7, projectedPtsPPR: 140, tags: ['All-Pro Kicker', '50+ Monster'], notes: '36 for 38 field goals in 2023.' },
];
