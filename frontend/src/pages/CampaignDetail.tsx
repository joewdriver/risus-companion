import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './CampaignDetail.css'

interface Character {
  id: number
  name: string
}

interface SessionItem {
  id: number
  session_number?: number
  title?: string
  description?: string
  session_date?: string | null
  created_at: string
}

interface SessionParticipantDTO {
  id?: number
  character: Character
  notes?: string
}

interface Campaign {
  id: number
  name: string
  description?: string
  gm_name?: string
  characters: Character[]
  sessions: SessionItem[]
  created_at: string
  updated_at: string
}

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddCharacter, setShowAddCharacter] = useState(false)
  const [characterSearch, setCharacterSearch] = useState('')
  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [addingId, setAddingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [showAddSession, setShowAddSession] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<number>>(new Set())
  const [submittingSession, setSubmittingSession] = useState(false)
  const [showEditSession, setShowEditSession] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionItem & { participants?: SessionParticipantDTO[] } | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSelectedIds, setEditSelectedIds] = useState<Set<number>>(new Set())
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCampaign(parseInt(id, 10))
    }
  }, [id])

  const fetchCampaign = async (campaignId: number) => {
    try {
      setLoading(true)
      const res = await fetch(`http://127.0.0.1:5000/api/campaign?id=${campaignId}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Campaign not found')
        throw new Error('Failed to load campaign')
      }
      const data = await res.json()
      setCampaign(data.campaign)
      setError(null)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllCharacters = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/characters')
      if (!res.ok) throw new Error('Failed to load characters')
      const data = await res.json()
      const chars = (data.characters || []).map((c: any) => ({ id: c.id, name: c.name }))
      setAllCharacters(chars)
    } catch (e) {
      console.error(e)
    }
  }

  const sortedSessions = useMemo(() => {
    if (!campaign) return []
    return [...(campaign.sessions || [])].sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0
      const db = b.created_at ? new Date(b.created_at).getTime() : 0
      return db - da
    })
  }, [campaign])

  const campaignCharacterIds = useMemo(() => {
    return new Set((campaign?.characters || []).map(c => c.id))
  }, [campaign])

  const availableCharacters = useMemo(() => {
    const term = characterSearch.toLowerCase()
    return allCharacters
      .filter(c => !campaignCharacterIds.has(c.id))
      .filter(c => c.name.toLowerCase().includes(term))
  }, [allCharacters, campaignCharacterIds, characterSearch])

  const handleAddCharacter = () => {
    const next = !showAddCharacter
    setShowAddCharacter(next)
    if (next && allCharacters.length === 0) {
      fetchAllCharacters()
    }
  }

  const handleAddSession = () => {
    const next = !showAddSession
    setShowAddSession(next)
    setActionError(null)
    if (next) {
      setSessionTitle('')
      setSessionDescription('')
      setSelectedParticipantIds(new Set())
    }
  }

  const toggleParticipant = (id: number) => {
    setSelectedParticipantIds(prev => {
      const copy = new Set(prev)
      if (copy.has(id)) copy.delete(id)
      else copy.add(id)
      return copy
    })
  }

  const submitSession = async () => {
    if (!campaign) return
    const title = sessionTitle.trim()
    if (!title) {
      setActionError('Session name is required')
      return
    }
    try {
      setSubmittingSession(true)
      setActionError(null)
      const res = await fetch(`http://127.0.0.1:5000/api/campaigns/${campaign.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: sessionDescription.trim() || undefined,
          participant_ids: Array.from(selectedParticipantIds),
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to create session')
      }
      const data = await res.json()
      setCampaign(data.campaign)
      setShowAddSession(false)
    } catch (e) {
      console.error(e)
      setActionError(e instanceof Error ? e.message : 'Failed to create session')
    } finally {
      setSubmittingSession(false)
    }
  }

  const openEditSession = (s: SessionItem & { participants?: SessionParticipantDTO[] }) => {
    setEditingSession(s)
    setEditTitle(s.title || '')
    setEditDescription(s.description || '')
    const ids = new Set<number>((s.participants || []).map(p => p.character.id))
    setEditSelectedIds(ids)
    setShowEditSession(true)
    setActionError(null)
  }

  const toggleEditParticipant = (id: number) => {
    setEditSelectedIds(prev => {
      const copy = new Set(prev)
      if (copy.has(id)) copy.delete(id)
      else copy.add(id)
      return copy
    })
  }

  const submitEditSession = async () => {
    if (!editingSession) return
    const title = editTitle.trim()
    if (!title) {
      setActionError('Session name is required')
      return
    }
    try {
      setSavingEdit(true)
      setActionError(null)
      const res = await fetch(`http://127.0.0.1:5000/api/sessions/${editingSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: editDescription.trim() || undefined,
          participant_ids: Array.from(editSelectedIds),
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to update session')
      }
      const data = await res.json()
      setCampaign(data.campaign)
      setShowEditSession(false)
      setEditingSession(null)
    } catch (e) {
      console.error(e)
      setActionError(e instanceof Error ? e.message : 'Failed to update session')
    } finally {
      setSavingEdit(false)
    }
  }

  const addCharacterToCampaign = async (charId: number) => {
    if (!campaign) return
    try {
      setAddingId(charId)
      setActionError(null)
      const res = await fetch(`http://127.0.0.1:5000/api/campaigns/${campaign.id}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character_id: charId })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to add character')
      }
      const data = await res.json()
      setCampaign(data.campaign)
    } catch (e) {
      console.error(e)
      setActionError(e instanceof Error ? e.message : 'Failed to add character')
    } finally {
      setAddingId(null)
    }
  }

  const removeCharacterFromCampaign = async (charId: number) => {
    if (!campaign) return
    try {
      setRemovingId(charId)
      setActionError(null)
      const res = await fetch(`http://127.0.0.1:5000/api/campaigns/${campaign.id}/characters/${charId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to remove character')
      }
      const data = await res.json()
      setCampaign(data.campaign)
    } catch (e) {
      console.error(e)
      setActionError(e instanceof Error ? e.message : 'Failed to remove character')
    } finally {
      setRemovingId(null)
    }
  }

  const handleBack = () => navigate('/campaigns')

  if (loading) {
    return (
      <div className="campaign-detail">
        <div className="loading">Loading campaign...</div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="campaign-detail">
        <div className="error">
          <h2>Error</h2>
          <p>{error || 'Campaign not found'}</p>
          <button onClick={handleBack} className="back-button">← Back to Campaigns</button>
        </div>
      </div>
    )
  }

  return (
    <div className="campaign-detail">
      <header className="campaign-header">
        <div className="header-top">
          <h1>{campaign.name}</h1>
          <div className="header-actions">
            <button onClick={handleBack} className="back-button">← Campaigns</button>
          </div>
        </div>
        <div className="meta">
          {campaign.gm_name && (
            <div className="meta-item"><strong>GM:</strong> {campaign.gm_name}</div>
          )}

      {showEditSession && editingSession && (
        <div className="modal-overlay" onClick={() => setShowEditSession(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title">Edit Session</div>
              <button className="panel-close" onClick={() => setShowEditSession(false)}>✕</button>
            </div>
            {actionError && (
              <div className="inline-error">{actionError}</div>
            )}
            <div className="session-form">
              <div className="session-fields">
                <input
                  type="text"
                  className="session-title-input"
                  placeholder="Session name"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="session-description-input"
                  placeholder="Session details"
                  rows={20}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <aside className="participant-picker">
                <div className="picker-title">Participants</div>
                <div className="picker-list">
                  {(campaign.characters || []).map((c) => (
                    <label key={c.id} className="picker-item">
                      <input
                        type="checkbox"
                        checked={editSelectedIds.has(c.id)}
                        onChange={() => toggleEditParticipant(c.id)}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </aside>
            </div>
            <div className="panel-actions">
              <button
                className="add-button"
                onClick={submitEditSession}
                disabled={savingEdit || !editTitle.trim()}
              >
                {savingEdit ? 'Saving…' : 'Save'}
              </button>
              <button className="back-button" onClick={() => setShowEditSession(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
        </div>
        {campaign.description && (
          <p className="campaign-description">{campaign.description}</p>
        )}
      </header>

      <div className="actions-row">
        <div className="left-actions">
          <button className="add-button" onClick={handleAddCharacter}>+ Add Character</button>
        </div>
        <div className="right-actions">
          <button className="add-button" onClick={handleAddSession}>+ Add Session</button>
        </div>
      </div>

      {showAddSession && (
        <div className="add-session-panel">
          <div className="panel-header">
            <div className="panel-title">Add Session</div>
            <button className="panel-close" onClick={() => setShowAddSession(false)}>✕</button>
          </div>
          {actionError && (
            <div className="inline-error">{actionError}</div>
          )}
          <div className="session-form">
            <div className="session-fields">
              <input
                type="text"
                className="session-title-input"
                placeholder="Session name"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />
              <textarea
                className="session-description-input"
                placeholder="Session details"
                rows={20}
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
              />
            </div>
            <aside className="participant-picker">
              <div className="picker-title">Participants</div>
              <div className="picker-list">
                {(campaign.characters || []).map((c) => (
                  <label key={c.id} className="picker-item">
                    <input
                      type="checkbox"
                      checked={selectedParticipantIds.has(c.id)}
                      onChange={() => toggleParticipant(c.id)}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </aside>
          </div>
          <div className="panel-actions">
            <button
              className="add-button"
              onClick={submitSession}
              disabled={submittingSession || !sessionTitle.trim()}
            >
              {submittingSession ? 'Adding…' : 'Add'}
            </button>
            <button className="back-button" onClick={() => setShowAddSession(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showAddCharacter && (
        <div className="add-character-panel">
          <div className="panel-header">
            <div className="panel-title">Add Character</div>
            <button className="panel-close" onClick={() => setShowAddCharacter(false)}>✕</button>
          </div>
          {actionError && (
            <div className="error" style={{padding: '0.5rem 1rem'}}>{actionError}</div>
          )}
          <div className="character-search-row">
            <input
              type="text"
              className="character-search-input"
              placeholder="Search characters by name..."
              value={characterSearch}
              onChange={(e) => setCharacterSearch(e.target.value)}
            />
          </div>
          <div className="available-characters-list">
            {availableCharacters.length > 0 ? (
              availableCharacters.map((c) => (
                <div key={c.id} className="available-character-item">
                  <span className="available-character-name">{c.name}</span>
                  <button
                    className="small-add-button"
                    onClick={() => addCharacterToCampaign(c.id)}
                    disabled={addingId === c.id}
                  >
                    {addingId === c.id ? 'Adding...' : 'Add'}
                  </button>
                </div>
              ))
            ) : (
              <div className="no-data">No matching characters available</div>
            )}
          </div>
        </div>
      )}

      <div className="columns">
        <aside className="left-col">
          <h2>Characters ({campaign.characters?.length || 0})</h2>
          {actionError && !showAddCharacter && (
            <div className="inline-error">{actionError}</div>
          )}
          {campaign.characters && campaign.characters.length > 0 ? (
            <ul className="character-list">
              {campaign.characters.map((c) => (
                <li key={c.id} className="character-item">
                  <span className="character-name">{c.name}</span>
                  <button
                    className="remove-char-button"
                    onClick={() => removeCharacterFromCampaign(c.id)}
                    aria-label={`Remove ${c.name}`}
                    title="Remove from campaign"
                    disabled={removingId === c.id}
                  >
                    {removingId === c.id ? '…' : '×'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No characters in this campaign yet.</p>
          )}
        </aside>

        <section className="right-col">
          <h2>Sessions ({sortedSessions.length})</h2>
          {sortedSessions.length > 0 ? (
            <div className="sessions-list">
              {sortedSessions.map((s: any) => (
                <div key={s.id} className="session-card" onClick={() => openEditSession(s)}>
                  <div className="session-header">
                    <div className="session-title">
                      {s.title || `Session #${s.session_number ?? s.id}`}
                    </div>
                    <div className="session-meta">
                      {s.created_at && (
                        <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  {s.description && (
                    <p className="session-description">{s.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No sessions yet. Click "Add Session" to create one.</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default CampaignDetail
