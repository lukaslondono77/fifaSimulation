'use client'

import { useState } from 'react'
import GroupsView from './components/GroupsView'
import MatchesView from './components/MatchesView'
import BracketView from './components/BracketView'
import StandingsView from './components/StandingsView'

export default function Home() {
  const [activeTab, setActiveTab] = useState('groups')

  return (
    <div className="container">
      <header className="header">
        <h1>FIFA 2026 World Cup Simulator</h1>
        <p>Simulate matches and track the tournament bracket</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Groups
        </button>
        <button
          className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button
          className={`tab ${activeTab === 'standings' ? 'active' : ''}`}
          onClick={() => setActiveTab('standings')}
        >
          Standings
        </button>
        <button
          className={`tab ${activeTab === 'bracket' ? 'active' : ''}`}
          onClick={() => setActiveTab('bracket')}
        >
          Bracket
        </button>
      </div>

      <div className="content-area">
        {activeTab === 'groups' && <GroupsView />}
        {activeTab === 'matches' && <MatchesView />}
        {activeTab === 'standings' && <StandingsView />}
        {activeTab === 'bracket' && <BracketView />}
      </div>
    </div>
  )
}
