// FIFA 2026 World Cup Data
export const GROUPS: Record<string, string[]> = {
  A: ["México", "Sudáfrica", "Corea del Sur", "UEFA_4"],
  B: ["Canadá", "UEFA_1", "Catar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haití", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "UEFA_3"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "UEFA_2", "Túnez"],
  G: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
  H: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"],
  I: ["Francia", "Senegal", "FIFA_2", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "FIFA_1", "Uzbekistán", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"]
}

// FIFA World Rankings
export const FIFA_RANKINGS: Record<string, number> = {
  "España": 1,
  "Argentina": 2,
  "Francia": 3,
  "Inglaterra": 4,
  "Brasil": 5,
  "Portugal": 6,
  "Países Bajos": 7,
  "Bélgica": 8,
  "Alemania": 9,
  "Croacia": 10,
  "Marruecos": 11,
  "Colombia": 13,
  "Estados Unidos": 14,
  "México": 15,
  "Uruguay": 16,
  "Suiza": 17,
  "Japón": 18,
  "Senegal": 19,
  "Irán": 20,
  "Corea del Sur": 22,
  "Ecuador": 23,
  "Austria": 24,
  "Australia": 26,
  "Canadá": 27,
  "Noruega": 29,
  "Panamá": 30,
  "Egipto": 34,
  "Argelia": 35,
  "Escocia": 36,
  "Paraguay": 39,
  "Túnez": 40,
  "Costa de Marfil": 42,
  "Uzbekistán": 50,
  "Catar": 51,
  "Arabia Saudita": 60,
  "Sudáfrica": 61,
  "Jordania": 66,
  "Cabo Verde": 68,
  "Ghana": 72,
  "Curazao": 82,
  "Haití": 84,
  "Nueva Zelanda": 86,
}

function calculateStrengthFromRank(rank: number): number {
  return Math.max(0.30, Math.min(0.95, 0.95 - ((rank - 1) / 99) * 0.65))
}

export function getTeamStrength(team: string): number {
  const rank = FIFA_RANKINGS[team] || 50
  return calculateStrengthFromRank(rank)
}

export function getColombiaWinProbability(opponent: string): number {
  const opponentRank = FIFA_RANKINGS[opponent] || 50
  const colombiaRank = 13
  
  if (opponentRank > colombiaRank) {
    return 1.0  // Always win against lower ranked teams
  } else if (opponentRank <= 12) {
    return 0.60  // 60% chance against top 12
  }
  return 0.60
}

