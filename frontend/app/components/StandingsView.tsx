'use client'

import { useState, useEffect } from 'react'
import { Match, calculateGroupStandings, Standing } from '../simulation'
import { GROUPS } from '../data'

export default function StandingsView() {
  const [matches, setMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<Record<string, Standing[]>>({})
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const openModal = (group: string) => {
    setSelectedGroup(group)
  }

  const closeModal = () => {
    setSelectedGroup(null)
  }

  return (
    <>
      <div style={{ width: '100%', color: '#fff', padding: '1rem' }}>
        <h2 style={{ color: '#667eea', marginBottom: '1.5rem', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>Group Standings</h2>
        <div className="groups-grid">
          {groups.map((group) => (
            <div 
              key={group} 
              className="group-card standings-card"
              onClick={() => openModal(group)}
            >
              <h3>Group {group}</h3>
              {standings[group] && standings[group].length > 0 ? (
                <>
                  {/* Desktop: Full table */}
                  {!isMobile && (
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
                  )}
                  {/* Mobile: Preview */}
                  {isMobile && (
                    <div className="standings-preview">
                      {standings[group].slice(0, 4).map((team, idx) => (
                        <div key={team.team} className="standings-preview-row">
                          <span className="preview-position">{idx + 1}</span>
                          <span className="preview-team">{team.team}</span>
                          <span className="preview-points"><strong>{team.points}</strong></span>
                        </div>
                      ))}
                      <div className="standings-preview-more">Tap to view full standings →</div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
                  No matches played yet
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedGroup && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Group {selectedGroup}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {standings[selectedGroup] && standings[selectedGroup].length > 0 ? (
                <div className="standings-modal-table">
                  <div className="standings-modal-header">
                    <div className="modal-col pos">Pos</div>
                    <div className="modal-col team">Team</div>
                    <div className="modal-col stat">P</div>
                    <div className="modal-col stat">W</div>
                    <div className="modal-col stat">D</div>
                    <div className="modal-col stat">L</div>
                    <div className="modal-col stat">GF</div>
                    <div className="modal-col stat">GA</div>
                    <div className="modal-col stat">GD</div>
                    <div className="modal-col points">Pts</div>
                  </div>
                  {standings[selectedGroup].map((team, idx) => (
                    <div key={team.team} className="standings-modal-row">
                      <div className="modal-col pos">{idx + 1}</div>
                      <div className="modal-col team">{team.team}</div>
                      <div className="modal-col stat">{team.played}</div>
                      <div className="modal-col stat">{team.won}</div>
                      <div className="modal-col stat">{team.drawn}</div>
                      <div className="modal-col stat">{team.lost}</div>
                      <div className="modal-col stat">{team.goals_for}</div>
                      <div className="modal-col stat">{team.goals_against}</div>
                      <div className="modal-col stat">{team.goal_difference > 0 ? '+' : ''}{team.goal_difference}</div>
                      <div className="modal-col points"><strong>{team.points}</strong></div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                  No matches played yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
