import { GROUPS, getTeamStrength, getColombiaWinProbability, FIFA_RANKINGS } from './data'

export interface MatchResult {
  home_score: number
  away_score: number
  winner: string | null
  played: boolean
}

export interface Match {
  id: string
  match_number: number
  stage: string
  home_team: string | null
  away_team: string | null
  home_team_name: string | null
  away_team_name: string | null
  result: MatchResult | null
  date: string | null
  venue: string | null
  group: string | null
}

export interface Standing {
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export function simulateMatch(homeTeam: string, awayTeam: string, stage: string = "group"): [number, number] {
  const isSemiOrFinal = stage === "semi" || stage === "final"
  const colombiaPlaying = homeTeam === "Colombia" || awayTeam === "Colombia"
  
  if (homeTeam === "Colombia") {
    const opponent = awayTeam
    const opponentRank = FIFA_RANKINGS[opponent] || 50
    
    if (isSemiOrFinal) {
      const rand = Math.random()
      if (rand < 0.15) {
        // 15% chance of draw - Colombia wins on penalties
        const goals = Math.floor(Math.random() * 2) + 1
        return [goals, goals]
      } else if (rand < 0.15 + getColombiaWinProbability(opponent)) {
        // Colombia wins in regulation
        return [Math.floor(Math.random() * 3) + 2, Math.floor(Math.random() * 2)]
      } else {
        // Opponent wins (only if top 12)
        return [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2) + 2]
      }
    } else {
      // Regular matches - no draws for Colombia
      const colombiaWins = Math.random() < getColombiaWinProbability(opponent)
      if (colombiaWins) {
        return [Math.floor(Math.random() * 3) + 2, Math.floor(Math.random() * 2)]
      } else {
        return [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2) + 2]
      }
    }
  } else if (awayTeam === "Colombia") {
    const opponent = homeTeam
    const opponentRank = FIFA_RANKINGS[opponent] || 50
    
    if (isSemiOrFinal) {
      const rand = Math.random()
      if (rand < 0.15) {
        // 15% chance of draw - Colombia wins on penalties
        const goals = Math.floor(Math.random() * 2) + 1
        return [goals, goals]
      } else if (rand < 0.15 + getColombiaWinProbability(opponent)) {
        // Colombia wins in regulation
        return [Math.floor(Math.random() * 2), Math.floor(Math.random() * 3) + 2]
      } else {
        // Opponent wins (only if top 12)
        return [Math.floor(Math.random() * 2) + 2, Math.floor(Math.random() * 2)]
      }
    } else {
      // Regular matches - no draws for Colombia
      const colombiaWins = Math.random() < getColombiaWinProbability(opponent)
      if (colombiaWins) {
        return [Math.floor(Math.random() * 2), Math.floor(Math.random() * 3) + 2]
      } else {
        return [Math.floor(Math.random() * 2) + 2, Math.floor(Math.random() * 2)]
      }
    }
  }
  
  // Normal simulation for other matches - based on FIFA rankings
  const homeStrength = getTeamStrength(homeTeam)
  const awayStrength = getTeamStrength(awayTeam)
  const homeAdvantage = 0.05
  const adjustedHomeStrength = homeStrength + homeAdvantage
  
  const totalStrength = adjustedHomeStrength + awayStrength
  const homeWinProb = adjustedHomeStrength / totalStrength
  
  const rand = Math.random()
  if (rand < homeWinProb) {
    // Home wins
    const homeGoals = Math.max(1, Math.floor(Math.random() * 3) + Math.floor(adjustedHomeStrength * 2))
    const awayGoals = Math.max(0, Math.floor(Math.random() * 2) + Math.floor(awayStrength * 1.5))
    return [homeGoals > awayGoals ? homeGoals : awayGoals + 1, awayGoals]
  } else if (rand < homeWinProb + (1 - homeWinProb) * 0.25) {
    // Draw
    const goals = Math.max(1, Math.floor((adjustedHomeStrength + awayStrength) * 1.0))
    return [goals, goals]
  } else {
    // Away wins
    const homeGoals = Math.max(0, Math.floor(Math.random() * 2) + Math.floor(adjustedHomeStrength * 1.5))
    const awayGoals = Math.max(1, Math.floor(Math.random() * 3) + Math.floor(awayStrength * 2))
    return [homeGoals, awayGoals > homeGoals ? awayGoals : homeGoals + 1]
  }
}

export function initializeGroupMatches(): Match[] {
  const matches: Match[] = []
  let matchNumber = 1
  
  for (const [groupId, teams] of Object.entries(GROUPS)) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: `G${groupId}_${matchNumber}`,
          match_number: matchNumber,
          stage: "group",
          home_team: `${groupId}${i+1}`,
          away_team: `${groupId}${j+1}`,
          home_team_name: teams[i],
          away_team_name: teams[j],
          result: null,
          date: null,
          venue: null,
          group: groupId
        })
        matchNumber++
      }
    }
  }
  
  return matches
}

export function calculateGroupStandings(groupMatches: Match[], teams: string[]): Standing[] {
  const standings: Record<string, Standing> = {}
  
  for (const team of teams) {
    standings[team] = {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0
    }
  }
  
  for (const match of groupMatches) {
    if (match.result?.played) {
      const home = match.home_team_name!
      const away = match.away_team_name!
      
      if (standings[home] && standings[away]) {
        const homeScore = match.result.home_score
        const awayScore = match.result.away_score
        
        standings[home].played++
        standings[away].played++
        standings[home].goals_for += homeScore
        standings[home].goals_against += awayScore
        standings[away].goals_for += awayScore
        standings[away].goals_against += homeScore
        
        if (homeScore > awayScore) {
          standings[home].won++
          standings[home].points += 3
          standings[away].lost++
        } else if (awayScore > homeScore) {
          standings[away].won++
          standings[away].points += 3
          standings[home].lost++
        } else {
          standings[home].drawn++
          standings[away].drawn++
          standings[home].points++
          standings[away].points++
        }
      }
    }
  }
  
  for (const team of Object.keys(standings)) {
    standings[team].goal_difference = standings[team].goals_for - standings[team].goals_against
  }
  
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
    return b.goals_for - a.goals_for
  })
}

