'use client'

import { useState } from 'react'
import { GROUPS } from '../data'

interface Team {
  id: string
  name: string
  code: string
  group: string
  position: number
}

export default function GroupsView() {
  const groups: Record<string, { id: string; teams: Team[] }> = {}
  
  for (const [groupId, teamNames] of Object.entries(GROUPS)) {
    const teams: Team[] = []
    for (let idx = 0; idx < teamNames.length; idx++) {
      teams.push({
        id: `${groupId}${idx+1}`,
        name: teamNames[idx],
        code: teamNames[idx].substring(0, 3).toUpperCase(),
        group: groupId,
        position: idx + 1
      })
    }
    groups[groupId] = { id: groupId, teams }
  }

  return (
    <div>
      <div className="groups-grid">
        {Object.values(groups).map((group) => (
          <div key={group.id} className="group-card">
            <h3>Group {group.id}</h3>
            <ul className="team-list">
              {group.teams.map((team) => (
                <li key={team.id} className="team-item">
                  <span className="team-name">{team.name}</span>
                  <span className="team-code">{team.code}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
