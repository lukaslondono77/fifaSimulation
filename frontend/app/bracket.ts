import { Match, MatchResult, simulateMatch } from './simulation'
import { GROUPS } from './data'

const ROUND16_VENUES = ["PHL", "HOU", "NVNJ", "CDMX", "DAL", "SEA", "ATL", "MIA"]
const QUARTER_VENUES = ["BOS", "LA", "MIA", "KC"]
const SEMI_VENUES = ["DAL", "ATL"]
const THIRD_VENUE = "MIA"
const FINAL_VENUE = "NVNJ"

const ROUND16_DATES = ["4 JULY 12:00", "4 JULY 16:00", "5 JULY 15:00", "5 JULY 19:00", 
                       "6 JULY 14:00", "6 JULY 19:00", "7 JULY 11:00", "7 JULY 15:00"]
const QUARTER_DATES = ["9 JULY 15:00", "10 JULY 14:00", "11 JULY 16:00", "11 JULY 20:00"]
const SEMI_DATES = ["14 JULY 15:00", "15 JULY 15:00"]
const THIRD_DATE = "18 JULY 17:00"
const FINAL_DATE = "19 JULY 15:00"

export function getMatchWinner(match: Match): string | null {
  if (!match.result?.played) return null
  
  if (match.result.home_score > match.result.away_score) {
    return match.home_team_name
  } else if (match.result.away_score > match.result.home_score) {
    return match.away_team_name
  }
  
  // Draw - Colombia wins if involved
  if (match.home_team_name === "Colombia") return match.home_team_name
  if (match.away_team_name === "Colombia") return match.away_team_name
  return match.home_team_name  // Default
}

export function simulateKnockoutMatch(match: Match): Match {
  if (match.result?.played) return match
  
  // Mexico must lose in Round of 16 or Quarter-Finals (can't pass QF)
  const isMexicoPlaying = match.home_team_name === "México" || match.away_team_name === "México"
  const isRound16OrQuarter = match.stage === "round16" || match.stage === "quarter"
  
  if (isMexicoPlaying && isRound16OrQuarter) {
    // Mexico loses - opponent wins
    if (match.home_team_name === "México") {
      match.result = {
        home_score: Math.floor(Math.random() * 2),  // Mexico scores 0-1
        away_score: Math.floor(Math.random() * 3) + 2,  // Opponent scores 2-4
        played: true,
        winner: match.away_team_name
      }
    } else {
      match.result = {
        home_score: Math.floor(Math.random() * 3) + 2,  // Opponent scores 2-4
        away_score: Math.floor(Math.random() * 2),  // Mexico scores 0-1
        played: true,
        winner: match.home_team_name
      }
    }
    return match
  }
  
  const [homeScore, awayScore] = simulateMatch(match.home_team_name!, match.away_team_name!, match.stage)
  
  const result: MatchResult = {
    home_score: homeScore,
    away_score: awayScore,
    played: true,
    winner: null
  }
  
  if (homeScore > awayScore) {
    result.winner = match.home_team_name
  } else if (awayScore > homeScore) {
    result.winner = match.away_team_name
  } else {
    // Draw - in semi/final, Colombia wins on penalties if involved
    if (match.stage === "semi" || match.stage === "final") {
      if (match.home_team_name === "Colombia") {
        result.winner = match.home_team_name
      } else if (match.away_team_name === "Colombia") {
        result.winner = match.away_team_name
      } else {
        // Use strength to determine penalty winner
        const { getTeamStrength } = require('./data')
        const homeStrength = getTeamStrength(match.home_team_name!)
        const awayStrength = getTeamStrength(match.away_team_name!)
        result.winner = homeStrength >= awayStrength ? match.home_team_name : match.away_team_name
      }
    } else {
      result.winner = match.home_team_name
    }
  }
  
  match.result = result
  return match
}

export function getQualifiedTeams(groupMatches: Match[]) {
  const { calculateGroupStandings } = require('./simulation')
  
  const allStandings: Record<string, any[]> = {}
  
  for (const groupId of Object.keys(GROUPS)) {
    const groupM = groupMatches.filter(m => m.group === groupId)
    const teamNames = Array.from(new Set([
      ...groupM.map(m => m.home_team_name!),
      ...groupM.map(m => m.away_team_name!)
    ]))
    const standings = calculateGroupStandings(groupM, teamNames)
    allStandings[groupId] = standings
  }
  
  const qualified = {
    first: {} as Record<string, any>,
    second: {} as Record<string, any>,
    third: [] as Array<{group: string, team: any}>
  }
  
  for (const [groupId, standings] of Object.entries(allStandings)) {
    if (standings.length >= 1) qualified.first[groupId] = standings[0]
    if (standings.length >= 2) qualified.second[groupId] = standings[1]
    if (standings.length >= 3) {
      qualified.third.push({ group: groupId, team: standings[2] })
    }
  }
  
  qualified.third.sort((a, b) => {
    if (b.team.points !== a.team.points) return b.team.points - a.team.points
    if (b.team.goal_difference !== a.team.goal_difference) return b.team.goal_difference - a.team.goal_difference
    return b.team.goals_for - a.team.goals_for
  })
  
  qualified.third = qualified.third.slice(0, 8)
  
  return qualified
}

export function generateRound32Matches(groupMatches: Match[]): Match[] {
  const qualified = getQualifiedTeams(groupMatches)
  const matches: Match[] = []
  
  // Helper to get team name safely
  const getTeam = (pos: string) => {
    if (pos === "1A") return qualified.first["A"]?.team || "1A"
    if (pos === "2A") return qualified.second["A"]?.team || "2A"
    if (pos === "1B") return qualified.first["B"]?.team || "1B"
    if (pos === "2B") return qualified.second["B"]?.team || "2B"
    if (pos === "1C") return qualified.first["C"]?.team || "1C"
    if (pos === "2C") return qualified.second["C"]?.team || "2C"
    if (pos === "1D") return qualified.first["D"]?.team || "1D"
    if (pos === "2D") return qualified.second["D"]?.team || "2D"
    if (pos === "1E") return qualified.first["E"]?.team || "1E"
    if (pos === "2E") return qualified.second["E"]?.team || "2E"
    if (pos === "1F") return qualified.first["F"]?.team || "1F"
    if (pos === "2F") return qualified.second["F"]?.team || "2F"
    if (pos === "1G") return qualified.first["G"]?.team || "1G"
    if (pos === "2G") return qualified.second["G"]?.team || "2G"
    if (pos === "1H") return qualified.first["H"]?.team || "1H"
    if (pos === "2H") return qualified.second["H"]?.team || "2H"
    if (pos === "1I") return qualified.first["I"]?.team || "1I"
    if (pos === "2I") return qualified.second["I"]?.team || "2I"
    if (pos === "1J") return qualified.first["J"]?.team || "1J"
    if (pos === "2J") return qualified.second["J"]?.team || "2J"
    if (pos === "1K") return qualified.first["K"]?.team || "1K"
    if (pos === "2K") return qualified.second["K"]?.team || "2K"
    if (pos === "1L") return qualified.first["L"]?.team || "1L"
    if (pos === "2L") return qualified.second["L"]?.team || "2L"
    if (pos.startsWith("3")) {
      const idx = parseInt(pos[1]) - 1
      return qualified.third[idx]?.team.team || pos
    }
    return pos
  }
  
  // Match 73: 2A vs 2B
  matches.push({
    id: "M73", match_number: 73, stage: "round32",
    home_team_name: getTeam("2A"), away_team_name: getTeam("2B"),
    home_team: null, away_team: null, result: null,
    venue: "LA", date: "28 JUNE 14:00", group: null
  })
  
  // Match 74: 1E vs 3rd place
  matches.push({
    id: "M74", match_number: 74, stage: "round32",
    home_team_name: getTeam("1E"), away_team_name: getTeam("3A"),
    home_team: null, away_team: null, result: null,
    venue: "BOS", date: "29 JUNE 12:00", group: null
  })
  
  // Match 75: 1F vs 2C
  matches.push({
    id: "M75", match_number: 75, stage: "round32",
    home_team_name: getTeam("1F"), away_team_name: getTeam("2C"),
    home_team: null, away_team: null, result: null,
    venue: "MTV", date: "29 JUNE 15:30", group: null
  })
  
  // Match 76: 1E vs 2F
  matches.push({
    id: "M76", match_number: 76, stage: "round32",
    home_team_name: getTeam("1E"), away_team_name: getTeam("2F"),
    home_team: null, away_team: null, result: null,
    venue: "HOU", date: "29 JUNE 20:00", group: null
  })
  
  // Match 77: 1I vs 3rd place
  matches.push({
    id: "M77", match_number: 77, stage: "round32",
    home_team_name: getTeam("1I"), away_team_name: getTeam("3B"),
    home_team: null, away_team: null, result: null,
    venue: "NVNJ", date: "30 JUNE 12:00", group: null
  })
  
  // Match 78: 2E vs 2I
  matches.push({
    id: "M78", match_number: 78, stage: "round32",
    home_team_name: getTeam("2E"), away_team_name: getTeam("2I"),
    home_team: null, away_team: null, result: null,
    venue: "DAL", date: "30 JUNE 16:00", group: null
  })
  
  // Match 79: 1A vs 3rd place
  matches.push({
    id: "M79", match_number: 79, stage: "round32",
    home_team_name: getTeam("1A"), away_team_name: getTeam("3C"),
    home_team: null, away_team: null, result: null,
    venue: "CDMX", date: "30 JUNE 20:00", group: null
  })
  
  // Match 80: 1L vs 3rd place
  matches.push({
    id: "M80", match_number: 80, stage: "round32",
    home_team_name: getTeam("1L"), away_team_name: getTeam("3D"),
    home_team: null, away_team: null, result: null,
    venue: "ATL", date: "1 JULY 11:00", group: null
  })
  
  // Match 81: 1D vs 3rd place
  matches.push({
    id: "M81", match_number: 81, stage: "round32",
    home_team_name: getTeam("1D"), away_team_name: getTeam("3E"),
    home_team: null, away_team: null, result: null,
    venue: "SFBA", date: "1 JULY 15:00", group: null
  })
  
  // Match 82: 1G vs 3rd place
  matches.push({
    id: "M82", match_number: 82, stage: "round32",
    home_team_name: getTeam("1G"), away_team_name: getTeam("3F"),
    home_team: null, away_team: null, result: null,
    venue: "SEA", date: "1 JULY 19:00", group: null
  })
  
  // Match 83: 2K vs 2L
  matches.push({
    id: "M83", match_number: 83, stage: "round32",
    home_team_name: getTeam("2K"), away_team_name: getTeam("2L"),
    home_team: null, away_team: null, result: null,
    venue: "TOR", date: "2 JULY 14:00", group: null
  })
  
  // Match 84: 1H vs 2J
  matches.push({
    id: "M84", match_number: 84, stage: "round32",
    home_team_name: getTeam("1H"), away_team_name: getTeam("2J"),
    home_team: null, away_team: null, result: null,
    venue: "LA", date: "2 JULY 18:00", group: null
  })
  
  // Match 85: 1B vs 3rd place
  matches.push({
    id: "M85", match_number: 85, stage: "round32",
    home_team_name: getTeam("1B"), away_team_name: getTeam("3G"),
    home_team: null, away_team: null, result: null,
    venue: "VAN", date: "2 JULY 20:30", group: null
  })
  
  // Match 86: 1J vs 2H
  matches.push({
    id: "M86", match_number: 86, stage: "round32",
    home_team_name: getTeam("1J"), away_team_name: getTeam("2H"),
    home_team: null, away_team: null, result: null,
    venue: "MIA", date: "2 JULY 22:00", group: null
  })
  
  // Match 87: 1K vs 3rd place
  matches.push({
    id: "M87", match_number: 87, stage: "round32",
    home_team_name: getTeam("1K"), away_team_name: getTeam("3H"),
    home_team: null, away_team: null, result: null,
    venue: "KC", date: "3 JULY 13:00", group: null
  })
  
  // Match 88: 2D vs 2G
  matches.push({
    id: "M88", match_number: 88, stage: "round32",
    home_team_name: getTeam("2D"), away_team_name: getTeam("2G"),
    home_team: null, away_team: null, result: null,
    venue: "DAL", date: "3 JULY 17:00", group: null
  })
  
  return matches
}

export function generateRound16Matches(round32Matches: Match[]): Match[] {
  const matches: Match[] = []
  const pairs = [
    [73, 74], [75, 77], [79, 81], [83, 84],  // Pathway 1
    [76, 78], [80, 82], [85, 87], [86, 88],  // Pathway 2
  ]
  
  for (let idx = 0; idx < pairs.length; idx++) {
    const [m1, m2] = pairs[idx]
    const match1 = round32Matches.find(m => m.match_number === m1)
    const match2 = round32Matches.find(m => m.match_number === m2)
    
    let winner1 = match1 ? getMatchWinner(match1) : null
    let winner2 = match2 ? getMatchWinner(match2) : null
    
    // Prevent same team
    if (winner1 && winner2 && winner1 === winner2) {
      if (match1?.result) {
        winner2 = match1.result.home_score > match1.result.away_score 
          ? match1.away_team_name : match1.home_team_name
      }
    }
    
    matches.push({
      id: `M${89 + idx}`, match_number: 89 + idx, stage: "round16",
      home_team_name: winner1 || "TBD", away_team_name: winner2 || "TBD",
      home_team: null, away_team: null, result: null,
      venue: ROUND16_VENUES[idx] || "TBD", date: ROUND16_DATES[idx] || "TBD", group: null
    })
  }
  
  return matches
}

export function generateQuarterMatches(round16Matches: Match[]): Match[] {
  const matches: Match[] = []
  const pairs = [[89, 90], [91, 92], [93, 94], [95, 96]]
  
  for (let idx = 0; idx < pairs.length; idx++) {
    const [m1, m2] = pairs[idx]
    const match1 = round16Matches.find(m => m.match_number === m1)
    const match2 = round16Matches.find(m => m.match_number === m2)
    
    let winner1 = match1 ? getMatchWinner(match1) : null
    let winner2 = match2 ? getMatchWinner(match2) : null
    
    if (winner1 && winner2 && winner1 === winner2) {
      if (match1?.result) {
        winner2 = match1.result.home_score > match1.result.away_score 
          ? match1.away_team_name : match1.home_team_name
      }
    }
    
    matches.push({
      id: `M${97 + idx}`, match_number: 97 + idx, stage: "quarter",
      home_team_name: winner1 || "TBD", away_team_name: winner2 || "TBD",
      home_team: null, away_team: null, result: null,
      venue: QUARTER_VENUES[idx] || "TBD", date: QUARTER_DATES[idx] || "TBD", group: null
    })
  }
  
  return matches
}

export function generateSemiMatches(quarterMatches: Match[]): Match[] {
  const matches: Match[] = []
  const pairs = [[97, 98], [99, 100]]
  
  for (let idx = 0; idx < pairs.length; idx++) {
    const [m1, m2] = pairs[idx]
    const match1 = quarterMatches.find(m => m.match_number === m1)
    const match2 = quarterMatches.find(m => m.match_number === m2)
    
    let winner1 = match1 ? getMatchWinner(match1) : null
    let winner2 = match2 ? getMatchWinner(match2) : null
    
    if (winner1 && winner2 && winner1 === winner2) {
      if (match1?.result) {
        winner2 = match1.result.home_score > match1.result.away_score 
          ? match1.away_team_name : match1.home_team_name
      }
    }
    
    matches.push({
      id: `M${101 + idx}`, match_number: 101 + idx, stage: "semi",
      home_team_name: winner1 || "TBD", away_team_name: winner2 || "TBD",
      home_team: null, away_team: null, result: null,
      venue: SEMI_VENUES[idx] || "TBD", date: SEMI_DATES[idx] || "TBD", group: null
    })
  }
  
  return matches
}

export function generateFinalMatches(semiMatches: Match[]): { third: Match | null, final: Match | null } {
  if (semiMatches.length < 2) return { third: null, final: null }
  
  const semi1 = semiMatches[0]
  const semi2 = semiMatches[1]
  
  const winner1 = getMatchWinner(semi1)
  const winner2 = getMatchWinner(semi2)
  
  const loser1 = semi1.result?.home_score! > semi1.result?.away_score! 
    ? semi1.away_team_name : semi1.home_team_name
  const loser2 = semi2.result?.home_score! > semi2.result?.away_score! 
    ? semi2.away_team_name : semi2.home_team_name
  
  const third: Match = {
    id: "M103", match_number: 103, stage: "third",
    home_team_name: loser1 || "TBD", away_team_name: loser2 || "TBD",
    home_team: null, away_team: null, result: null,
    venue: THIRD_VENUE, date: THIRD_DATE, group: null
  }
  
  const final: Match = {
    id: "M104", match_number: 104, stage: "final",
    home_team_name: winner1 || "TBD", away_team_name: winner2 || "TBD",
    home_team: null, away_team: null, result: null,
    venue: FINAL_VENUE, date: FINAL_DATE, group: null
  }
  
  return { third, final }
}

export function simulateAllKnockoutStages(round32Matches: Match[]): {
  round32: Match[]
  round16: Match[]
  quarter: Match[]
  semi: Match[]
  third: Match | null
  final: Match | null
} {
  // Determine tournament winner first (30% Colombia, 70% top 10 teams)
  const tournamentWinner = determineTournamentWinner()
  
  // Simulate Round of 32
  for (const match of round32Matches) {
    if (!match.result?.played) {
      simulateKnockoutMatch(match)
    }
  }
  
  // Generate and simulate Round of 16
  const round16Matches = generateRound16Matches(round32Matches)
  for (const match of round16Matches) {
    simulateKnockoutMatch(match)
  }
  
  // Generate and simulate Quarter-Finals
  const quarterMatches = generateQuarterMatches(round16Matches)
  for (const match of quarterMatches) {
    simulateKnockoutMatch(match)
  }
  
  // Generate and simulate Semi-Finals
  const semiMatches = generateSemiMatches(quarterMatches)
  for (const match of semiMatches) {
    simulateKnockoutMatch(match)
  }
  
  // Generate Final matches
  const { third, final } = generateFinalMatches(semiMatches)
  
  // Simulate Third Place and Final
  if (third) simulateKnockoutMatch(third)
  if (final) {
    // Ensure the predetermined winner wins the final
    ensureWinnerWinsFinal(final, tournamentWinner)
  }
  
  return {
    round32: round32Matches,
    round16: round16Matches,
    quarter: quarterMatches,
    semi: semiMatches,
    third,
    final
  }
}

function determineTournamentWinner(): string {
  const rand = Math.random()
  
  // 30% chance Colombia wins (3 out of 10)
  if (rand < 0.30) {
    return "Colombia"
  }
  
  // 70% chance one of top 10 FIFA teams wins (7 out of 10, divided among top 10)
  // Top 10 teams: Spain, Argentina, France, England, Brazil, Portugal, Netherlands, Belgium, Germany, Croatia
  const top10Teams = [
    "España",        // 1 - 7% chance
    "Argentina",     // 2 - 7% chance
    "Francia",       // 3 - 7% chance
    "Inglaterra",    // 4 - 7% chance
    "Brasil",        // 5 - 7% chance
    "Portugal",      // 6 - 7% chance
    "Países Bajos",  // 7 - 7% chance
    "Bélgica",       // 8 - 7% chance
    "Alemania",      // 9 - 7% chance
    "Croacia"        // 10 - 7% chance
  ]
  
  // Distribute probability evenly among top 10 (70% / 10 = 7% each)
  // rand is between 0.30 and 1.0, so (rand - 0.30) is between 0 and 0.70
  const teamIndex = Math.floor((rand - 0.30) / 0.07)
  return top10Teams[Math.min(teamIndex, top10Teams.length - 1)]
}

function ensureWinnerWinsFinal(final: Match, predeterminedWinner: string) {
  // If Colombia is predetermined winner, ensure they win
  if (predeterminedWinner === "Colombia") {
    if (final.home_team_name === "Colombia") {
      final.result = {
        home_score: Math.floor(Math.random() * 3) + 2,
        away_score: Math.floor(Math.random() * 2),
        played: true,
        winner: final.home_team
      }
    } else if (final.away_team_name === "Colombia") {
      final.result = {
        home_score: Math.floor(Math.random() * 2),
        away_score: Math.floor(Math.random() * 3) + 2,
        played: true,
        winner: final.away_team
      }
    } else {
      // Colombia not in final - replace one team with Colombia and ensure they win
      // This is a fallback - ideally Colombia should reach final with their 65% win rate
      final.home_team_name = "Colombia"
      final.result = {
        home_score: Math.floor(Math.random() * 3) + 2,
        away_score: Math.floor(Math.random() * 2),
        played: true,
        winner: final.home_team
      }
    }
    return
  }
  
  // If predetermined winner is a top 10 team, ensure they win
  if (final.home_team_name === predeterminedWinner) {
    final.result = {
      home_score: Math.floor(Math.random() * 3) + 2,
      away_score: Math.floor(Math.random() * 2),
      played: true,
      winner: final.home_team
    }
  } else if (final.away_team_name === predeterminedWinner) {
    final.result = {
      home_score: Math.floor(Math.random() * 2),
      away_score: Math.floor(Math.random() * 3) + 2,
      played: true,
      winner: final.away_team
    }
  } else {
    // Predetermined winner not in final - replace home team and ensure they win
    final.home_team_name = predeterminedWinner
    final.result = {
      home_score: Math.floor(Math.random() * 3) + 2,
      away_score: Math.floor(Math.random() * 2),
      played: true,
      winner: final.home_team
    }
  }
}

