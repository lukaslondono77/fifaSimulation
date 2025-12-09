'use client'

import { useState, useEffect } from 'react'
import { Match } from '../simulation'
import { simulateAllKnockoutStages, generateRound32Matches, getMatchWinner } from '../bracket'
import { initializeGroupMatches } from '../simulation'

export default function BracketView() {
  const [matches, setMatches] = useState<Match[]>([])
  const [bracket, setBracket] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const saved = localStorage.getItem('fifa_matches')
    if (saved) {
      try {
        const allMatches = JSON.parse(saved)
        setMatches(allMatches)
      } catch (e) {
        console.error('Error parsing saved matches:', e)
        const initialMatches = initializeGroupMatches()
        setMatches(initialMatches)
        if (typeof window !== 'undefined') {
          localStorage.setItem('fifa_matches', JSON.stringify(initialMatches))
        }
      }
    } else {
      const initialMatches = initializeGroupMatches()
      setMatches(initialMatches)
      if (typeof window !== 'undefined') {
        localStorage.setItem('fifa_matches', JSON.stringify(initialMatches))
      }
    }
  }, [])

  const updateBracket = (allMatches: Match[]) => {
    const groupMatches = allMatches.filter(m => m.stage === 'group')
    const allPlayed = groupMatches.length > 0 && groupMatches.every(m => m.result?.played)
    
    if (!allPlayed) {
      setBracket({ ready: false })
      return
    }
    
    // Generate and simulate bracket
    const round32Matches = generateRound32Matches(groupMatches)
    const bracketData = simulateAllKnockoutStages(round32Matches)
    
    // Save knockout matches
    const allKnockout = [
      ...bracketData.round32,
      ...bracketData.round16,
      ...bracketData.quarter,
      ...bracketData.semi,
      ...(bracketData.third ? [bracketData.third] : []),
      ...(bracketData.final ? [bracketData.final] : [])
    ]
    
    const updatedMatches = [...groupMatches, ...allKnockout]
    setMatches(updatedMatches)
    if (typeof window !== 'undefined') {
      localStorage.setItem('fifa_matches', JSON.stringify(updatedMatches))
    }
    
    // Get winner
    let winner = null
    if (bracketData.final?.result?.played) {
      if (bracketData.final.result.home_score > bracketData.final.result.away_score) {
        winner = bracketData.final.home_team_name
      } else if (bracketData.final.result.away_score > bracketData.final.result.home_score) {
        winner = bracketData.final.away_team_name
      }
    }
    
    setBracket({
      ready: true,
      round32: bracketData.round32.map(m => ({
        id: m.id,
        match_number: m.match_number,
        stage: m.stage,
        home_team_name: m.home_team_name,
        away_team_name: m.away_team_name,
        result: m.result,
        venue: m.venue,
        date: m.date
      })),
      round16: bracketData.round16.map(m => ({
        id: m.id,
        match_number: m.match_number,
        stage: m.stage,
        home_team_name: m.home_team_name,
        away_team_name: m.away_team_name,
        result: m.result,
        venue: m.venue,
        date: m.date
      })),
      quarter: bracketData.quarter.map(m => ({
        id: m.id,
        match_number: m.match_number,
        stage: m.stage,
        home_team_name: m.home_team_name,
        away_team_name: m.away_team_name,
        result: m.result,
        venue: m.venue,
        date: m.date
      })),
      semi: bracketData.semi.map(m => ({
        id: m.id,
        match_number: m.match_number,
        stage: m.stage,
        home_team_name: m.home_team_name,
        away_team_name: m.away_team_name,
        result: m.result,
        venue: m.venue,
        date: m.date
      })),
      third: bracketData.third ? {
        id: bracketData.third.id,
        match_number: bracketData.third.match_number,
        stage: bracketData.third.stage,
        home_team_name: bracketData.third.home_team_name,
        away_team_name: bracketData.third.away_team_name,
        result: bracketData.third.result,
        venue: bracketData.third.venue,
        date: bracketData.third.date
      } : null,
      final: bracketData.final ? {
        id: bracketData.final.id,
        match_number: bracketData.final.match_number,
        stage: bracketData.final.stage,
        home_team_name: bracketData.final.home_team_name,
        away_team_name: bracketData.final.away_team_name,
        result: bracketData.final.result,
        venue: bracketData.final.venue,
        date: bracketData.final.date
      } : null,
      winner
    })
  }

  const resetBracket = () => {
    if (typeof window === 'undefined') return
    
    // Clear all data
    localStorage.removeItem('fifa_matches')
    
    // Initialize fresh matches
    const initialMatches = initializeGroupMatches()
    setMatches(initialMatches)
    localStorage.setItem('fifa_matches', JSON.stringify(initialMatches))
    setBracket({ ready: false })
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('fifa-reset'))
    
    // Force a page reload to ensure all components reset
    window.location.reload()
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleMatchUpdate = () => {
      const saved = localStorage.getItem('fifa_matches')
      if (saved) {
        try {
          const allMatches = JSON.parse(saved)
          setMatches(allMatches)
          updateBracket(allMatches)
        } catch (e) {
          console.error('Error parsing saved matches:', e)
        }
      }
    }
    
    if (matches.length > 0) {
      updateBracket(matches)
    }
    
    // Listen for match updates
    window.addEventListener('fifa-matches-updated', handleMatchUpdate)
    
    return () => {
      window.removeEventListener('fifa-matches-updated', handleMatchUpdate)
    }
  }, [matches.length])

  if (!bracket) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '3rem' }}>
        Loading bracket...
      </div>
    )
  }

  if (!bracket.ready) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', minHeight: '400px' }}>
        <h2 style={{ color: '#667eea', marginBottom: '1rem' }}>Complete Group Stage First</h2>
        <p style={{ color: '#888', marginBottom: '2rem' }}>
          Simulate all group stage matches to generate the knockout bracket
        </p>
      </div>
    )
  }

  const winner = bracket.winner
  const round32 = bracket.round32 || []
  const round16 = bracket.round16 || []
  const quarter = bracket.quarter || []
  const semi = bracket.semi || []
  const third = bracket.third
  const final = bracket.final

  // Pathway 1 matches
  const pathway1_r32 = ['M73', 'M74', 'M75', 'M77', 'M79', 'M81', 'M83', 'M84']
  const pathway1_r16 = ['M89', 'M90', 'M91', 'M92']
  const pathway1_quarter = ['M97', 'M98']
  const pathway1_semi = ['M101']
  
  // Pathway 2 matches
  const pathway2_r32 = ['M76', 'M78', 'M80', 'M82', 'M85', 'M86', 'M87', 'M88']
  const pathway2_r16 = ['M93', 'M94', 'M95', 'M96']
  const pathway2_quarter = ['M99', 'M100']
  const pathway2_semi = ['M102']
  
  const pathway1_r32_matches = pathway1_r32.map(id => round32.find((m: any) => m.id === id)).filter(Boolean)
  const pathway1_r16_matches = pathway1_r16.map(id => round16.find((m: any) => m.id === id)).filter(Boolean)
  const pathway1_quarter_matches = pathway1_quarter.map(id => quarter.find((m: any) => m.id === id)).filter(Boolean)
  const pathway1_semi_matches = pathway1_semi.map(id => semi.find((m: any) => m.id === id)).filter(Boolean)
  
  const pathway2_r32_matches = pathway2_r32.map(id => round32.find((m: any) => m.id === id)).filter(Boolean)
  const pathway2_r16_matches = pathway2_r16.map(id => round16.find((m: any) => m.id === id)).filter(Boolean)
  const pathway2_quarter_matches = pathway2_quarter.map(id => quarter.find((m: any) => m.id === id)).filter(Boolean)
  const pathway2_semi_matches = pathway2_semi.map(id => semi.find((m: any) => m.id === id)).filter(Boolean)

  return (
    <div className="bracket-wrapper" style={{ width: '100%', color: '#fff' }}>
      <div className="bracket-header">
        <div className="bracket-title">FIFA WORLD CUP 2026</div>
        {winner && (
          <div className="winner-announcement">
            🏆 CHAMPION: <span className="winner-name">{winner}</span> 🏆
          </div>
        )}
        <div className="bracket-rounds">
          <span className="round-label">R32</span>
          <span className="round-label">R16</span>
          <span className="round-label">QF</span>
          <span className="round-label">SF</span>
          <span className="round-label">FINAL</span>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="button secondary" onClick={resetBracket}>
            Reset & Re-simulate Bracket
          </button>
        </div>
      </div>

      <div className="bracket-main-organized">
        <div className="bracket-pathway-column">
          <div className="pathway-header">PATHWAY 1</div>
          
          <div className="round-section">
            <div className="round-title">Round of 32</div>
            <div className="matches-column">
              {pathway1_r32_matches.map((match: any) => (
                <MatchBox key={match.id} match={match} />
              ))}
            </div>
          </div>

          {pathway1_r16_matches.length > 0 && (
            <div className="round-section">
              <div className="round-title">Round of 16</div>
              <div className="matches-column">
                {pathway1_r16_matches.map((match: any) => (
                  <MatchBox key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          {pathway1_quarter_matches.length > 0 && (
            <div className="round-section">
              <div className="round-title">Quarter-Finals</div>
              <div className="matches-column">
                {pathway1_quarter_matches.map((match: any) => (
                  <MatchBox key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          {pathway1_semi_matches.length > 0 && (
            <div className="round-section">
              <div className="round-title">Semi-Finals</div>
              <div className="matches-column">
                {pathway1_semi_matches.map((match: any) => (
                  <MatchBox key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bracket-center-column">
          <div className="trophy-container">
            <div className="trophy">🏆</div>
          </div>
          <div className="final-matches-column">
            {third && <MatchBox match={third} />}
            {final && <MatchBox match={final} />}
            {!third && !final && (
              <>
                <div className="final-match bronze">
                  <div className="final-match-header">BRONZE FINAL</div>
                  <div className="final-match-id">M103 | MIA</div>
                  <div className="final-match-date">18 JULY 17:00</div>
                </div>
                <div className="final-match gold">
                  <div className="final-match-header">FINAL</div>
                  <div className="final-match-id">M104 | NVNJ</div>
                  <div className="final-match-date">19 JULY 15:00</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bracket-pathway-column">
          <div className="pathway-header">PATHWAY 2</div>
          
          <div className="round-section">
            <div className="round-title">Round of 32</div>
            <div className="matches-column">
              {pathway2_r32_matches.map((match: any) => (
                <MatchBox key={match.id} match={match} />
              ))}
            </div>
          </div>

          {pathway2_r16_matches.length > 0 && (
            <div className="round-section">
              <div className="round-title">Round of 16</div>
              <div className="matches-column">
                {pathway2_r16_matches.map((match: any) => (
                  <MatchBox key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          {pathway2_quarter_matches.length > 0 && (
            <div className="round-section">
              <div className="round-title">Quarter-Finals</div>
              <div className="matches-column">
                {pathway2_quarter_matches.map((match: any) => (
                  <MatchBox key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          {pathway2_semi_matches.length > 0 && (
            <div className="round-section">
              <div className="round-title">Semi-Finals</div>
              <div className="matches-column">
                {pathway2_semi_matches.map((match: any) => (
                  <MatchBox key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchBox({ match }: { match: any }) {
  const getMatchColor = (matchNum: number, stage: string) => {
    if (stage === 'final') return 'gold'
    if (stage === 'third') return 'bronze'
    if (stage === 'semi') return 'purple'
    if (stage === 'quarter') return 'light-blue'
    if (stage === 'round16') return 'light-blue'
    return 'dark-blue'
  }

  const color = getMatchColor(match.match_number, match.stage)
  const hasResult = match.result?.played
  const homeScore = match.result?.home_score ?? null
  const awayScore = match.result?.away_score ?? null
  
  // Format venue as "MXX/VENUE"
  const venueDisplay = match.venue ? `${match.id}/${match.venue}` : match.id

  return (
    <div className={`match-box ${color}`}>
      <div className="match-id">{match.id}</div>
      <div className="match-teams-bracket">
        <div className="match-team">
          {match.home_team_name || 'TBD'}
          {hasResult && <span className="match-score">{homeScore}</span>}
        </div>
        <div className="match-vs">v</div>
        <div className="match-team">
          {match.away_team_name || 'TBD'}
          {hasResult && <span className="match-score">{awayScore}</span>}
        </div>
      </div>
      <div className="match-venue">{venueDisplay}</div>
      <div className="match-date">{match.date || 'TBD'}</div>
    </div>
  )
}

function PlaceholderMatchBox({ matchId, round }: { matchId: string, round: string }) {
  const getColor = () => {
    if (round === 'SF') return 'purple'
    if (round === 'QF') return 'light-blue'
    return 'light-blue'
  }
  
  const getVenue = () => {
    const venues: Record<string, string> = {
      'M89': 'PHL', 'M90': 'HOU', 'M91': 'NVNJ', 'M92': 'CDMX',
      'M93': 'DAL', 'M94': 'SEA', 'M95': 'ATL', 'M96': 'VAN',
      'M97': 'BOS', 'M98': 'LA', 'M99': 'MIA', 'M100': 'KC',
      'M101': 'DAL', 'M102': 'ATL'
    }
    return venues[matchId] || 'TBD'
  }
  
  return (
    <div className={`match-box ${getColor()}`}>
      <div className="match-id">{matchId}</div>
      <div className="match-teams-bracket">
        <div className="match-team">TBD</div>
        <div className="match-vs">v</div>
        <div className="match-team">TBD</div>
      </div>
      <div className="match-venue">{matchId}/{getVenue()}</div>
      <div className="match-date">TBD</div>
    </div>
  )
}
