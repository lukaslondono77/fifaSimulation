'use client'

import { useState, useEffect } from 'react'
import { Match, calculateGroupStandings, Standing } from '../simulation'
import { GROUPS } from '../data'

export default function StandingsView() {
  const [matches, setMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<Record<string, Standing[]>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const loadMatches = () => {
      const saved = localStorage.getItem('fifa_matches')
      if (saved) {
        try {
          const allMatches = JSON.parse(saved)
          setMatches(allMatches)
          calculateAllStandings(allMatches)
        } catch (e) {
          console.error('Error parsing saved matches:', e)
          setMatches([])
          setStandings({})
        }
      } else {
        setMatches([])
        setStandings({})
      }
    }
    
    loadMatches()
    
    // Listen for reset events
    const handleReset = () => {
      loadMatches()
    }
    
    // Listen for match updates
    const handleMatchUpdate = () => {
      loadMatches()
    }
    
    window.addEventListener('fifa-reset', handleReset)
    window.addEventListener('fifa-matches-updated', handleMatchUpdate)
    
    return () => {
      window.removeEventListener('fifa-reset', handleReset)
      window.removeEventListener('fifa-matches-updated', handleMatchUpdate)
    }
  }, [])

  const calculateAllStandings = (allMatches: Match[]) => {
    const groupMatches = allMatches.filter(m => m.stage === 'group')
    const allStandings: Record<string, Standing[]> = {}
    
    for (const groupId of Object.keys(GROUPS)) {
      const groupM = groupMatches.filter(m => m.group === groupId)
      const teamNames = Array.from(new Set([
        ...groupM.map(m => m.home_team_name!),
        ...groupM.map(m => m.away_team_name!)
      ]))
      const groupStandings = calculateGroupStandings(groupM, teamNames)
      allStandings[groupId] = groupStandings
    }
    
    setStandings(allStandings)
  }

  useEffect(() => {
    calculateAllStandings(matches)
  }, [matches])

  const groups = Object.keys(GROUPS)

  if (Object.keys(standings).length === 0 && matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>
        <h2 style={{ color: '#667eea', marginBottom: '1rem' }}>Standings</h2>
        <p style={{ color: '#888' }}>No matches played yet. Go to Matches tab to simulate games.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', color: '#fff', padding: '1rem' }}>
      <h2 style={{ color: '#667eea', marginBottom: '1.5rem', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>Group Standings</h2>
      <div className="groups-grid">
        {groups.map((group) => (
          <div key={group} className="group-card">
            <h3>Group {group}</h3>
            {standings[group] && standings[group].length > 0 ? (
              <table className="standings-table">
                <thead>
                  <tr>
                    <th className="position">Pos</th>
                    <th>Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings[group].map((team, idx) => (
                    <tr key={team.team}>
                      <td className="position">{idx + 1}</td>
                      <td>{team.team}</td>
                      <td>{team.played}</td>
                      <td>{team.won}</td>
                      <td>{team.drawn}</td>
                      <td>{team.lost}</td>
                      <td>{team.goals_for}</td>
                      <td>{team.goals_against}</td>
                      <td>{team.goal_difference > 0 ? '+' : ''}{team.goal_difference}</td>
                      <td><strong>{team.points}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
                No matches played yet
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
