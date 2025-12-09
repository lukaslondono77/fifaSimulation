'use client'

import { useState, useEffect } from 'react'
import { Match, initializeGroupMatches, simulateMatch, calculateGroupStandings } from '../simulation'
import { GROUPS } from '../data'

export default function MatchesView() {
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const loadMatches = () => {
      // Load matches from localStorage or initialize
      const saved = localStorage.getItem('fifa_matches')
      if (saved) {
        try {
          setMatches(JSON.parse(saved))
        } catch (e) {
          console.error('Error parsing saved matches:', e)
          const initialMatches = initializeGroupMatches()
          setMatches(initialMatches)
          localStorage.setItem('fifa_matches', JSON.stringify(initialMatches))
        }
      } else {
        const initialMatches = initializeGroupMatches()
        setMatches(initialMatches)
        localStorage.setItem('fifa_matches', JSON.stringify(initialMatches))
      }
    }
    
    loadMatches()
    
    // Listen for reset events
    const handleReset = () => {
      loadMatches()
    }
    window.addEventListener('fifa-reset', handleReset)
    
    return () => {
      window.removeEventListener('fifa-reset', handleReset)
    }
  }, [])

  const saveMatches = (updatedMatches: Match[]) => {
    setMatches(updatedMatches)
    if (typeof window !== 'undefined') {
      localStorage.setItem('fifa_matches', JSON.stringify(updatedMatches))
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('fifa-matches-updated'))
    }
  }

  const simulateSingleMatch = (matchId: string) => {
    const updated = matches.map(m => {
      if (m.id === matchId && !m.result?.played) {
        const [homeScore, awayScore] = simulateMatch(m.home_team_name!, m.away_team_name!, m.stage)
        const result = {
          home_score: homeScore,
          away_score: awayScore,
          played: true,
          winner: homeScore > awayScore ? m.home_team_name : (awayScore > homeScore ? m.away_team_name : null)
        }
        return { ...m, result }
      }
      return m
    })
    saveMatches(updated)
  }

  const simulateGroup = (groupId: string) => {
    const updated = matches.map(m => {
      if (m.group === groupId && !m.result?.played) {
        const [homeScore, awayScore] = simulateMatch(m.home_team_name!, m.away_team_name!, m.stage)
        const result = {
          home_score: homeScore,
          away_score: awayScore,
          played: true,
          winner: homeScore > awayScore ? m.home_team_name : (awayScore > homeScore ? m.away_team_name : null)
        }
        return { ...m, result }
      }
      return m
    })
    saveMatches(updated)
  }

  const simulateAllGroups = () => {
    const updated = matches.map(m => {
      if (m.stage === "group" && !m.result?.played) {
        const [homeScore, awayScore] = simulateMatch(m.home_team_name!, m.away_team_name!, m.stage)
        const result = {
          home_score: homeScore,
          away_score: awayScore,
          played: true,
          winner: homeScore > awayScore ? m.home_team_name : (awayScore > homeScore ? m.away_team_name : null)
        }
        return { ...m, result }
      }
      return m
    })
    saveMatches(updated)
  }

  const matchesByGroup: Record<string, Match[]> = {}

  matches.forEach((match) => {
    const group = match.group || 'other'
    if (!matchesByGroup[group]) {
      matchesByGroup[group] = []
    }
    matchesByGroup[group].push(match)
  })

  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>
        <h2 style={{ color: '#667eea', marginBottom: '1rem' }}>Matches</h2>
        <p style={{ color: '#888' }}>Loading matches...</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', color: '#fff', padding: '1rem' }}>
      <h2 style={{ color: '#667eea', marginBottom: '1.5rem', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>Group Stage Matches</h2>
      <p style={{ color: '#888', marginBottom: '1rem', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>Total matches: {matches.length}</p>
      <div className="button-group">
        <button className="button" onClick={simulateAllGroups}>
          Simulate All Groups
        </button>
      </div>

      {Object.entries(matchesByGroup).map(([group, groupMatches]) => (
        <div key={group} className="matches-section">
          <h2 style={{ marginBottom: '1rem', color: '#667eea', fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)' }}>
            Group {group}
          </h2>
          <button
            className="button secondary"
            onClick={() => simulateGroup(group)}
            style={{ marginBottom: '1rem' }}
          >
            Simulate Group {group}
          </button>
          {groupMatches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-header">
                <span>Match #{match.match_number}</span>
                <span>{match.group}</span>
              </div>
              <div className="match-teams">
                <div className="team home">
                  {match.home_team_name || 'TBD'}
                </div>
                <div className={`score ${match.result?.played ? '' : 'vs'}`}>
                  {match.result?.played
                    ? `${match.result.home_score} - ${match.result.away_score}`
                    : 'vs'}
                </div>
                <div className="team away">
                  {match.away_team_name || 'TBD'}
                </div>
              </div>
              {!match.result?.played && (
                <div className="button-group">
                  <button
                    className="button"
                    onClick={() => simulateSingleMatch(match.id)}
                  >
                    Simulate Match
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
