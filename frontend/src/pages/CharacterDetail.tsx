import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './CharacterDetail.css'
import { apiEndpoints } from '../config/api'

interface Cliche {
  id: number
  name: string
  dice_count: number
  description?: string
}

interface Campaign {
  id: number
  name: string
  description?: string
  gm_name?: string
}

interface Character {
  id: number
  name: string
  description?: string
  hook?: string
  cliches: Cliche[]
  campaigns?: Campaign[]
  created_at: string
  updated_at: string
}

const CharacterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editHook, setEditHook] = useState('')
  const [editCliches, setEditCliches] = useState<Array<{name: string, dice: number}>>([])
  const [newCliches, setNewCliches] = useState<Array<{name: string, dice: number}>>([
    { name: '', dice: 0 }
  ])

  useEffect(() => {
    if (id) {
      fetchCharacter(parseInt(id))
    }
  }, [id])

  const fetchCharacter = async (characterId: number) => {
    try {
      setLoading(true)
      const response = await fetch(apiEndpoints.character(characterId))
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Character not found')
        }
        throw new Error('Failed to fetch character')
      }

      const data = await response.json()
      setCharacter(data.character)
      setError(null)
      
      // Initialize edit form with current data
      initializeEditForm(data.character)
    } catch (err) {
      console.error('Error fetching character:', err)
      setError(err instanceof Error ? err.message : 'Failed to load character')
    } finally {
      setLoading(false)
    }
  }

  const initializeEditForm = (char: Character) => {
    setEditName(char.name)
    setEditDescription(char.description || '')
    setEditHook(char.hook || '')
    
    const regularCliches = char.cliches.filter(c => c.dice_count > 0)
    setEditCliches(regularCliches.map(c => ({ name: c.name, dice: c.dice_count })))
    
    // Reset new cliches
    setNewCliches([{ name: '', dice: 0 }])
  }

  const handleStartEdit = () => {
    if (character) {
      initializeEditForm(character)
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (character) {
      initializeEditForm(character)
    }
  }

  const handleSaveEdit = async () => {
    if (!character) return

    try {
      setSaving(true)
      
      // Combine existing and new cliches
      const allCliches = [
        ...editCliches.filter(c => c.name.trim() && c.dice > 0),
        ...newCliches.filter(c => c.name.trim() && c.dice > 0)
      ]

      if (allCliches.length === 0) {
        alert('At least one cliché is required')
        return
      }

      const updateData = {
        name: editName.trim(),
        description: editDescription.trim(),
        hook: editHook.trim(),
        cliches: allCliches
      }

      const response = await fetch(apiEndpoints.character(character.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        setCharacter(result.character)
        setIsEditing(false)
        alert('Character updated successfully!')
      } else {
        const error = await response.json()
        alert(`Error updating character: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating character:', error)
      alert('Failed to update character. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEditCliqueChange = (index: number, field: 'name' | 'dice', value: string | number) => {
    const newEditCliches = [...editCliches]
    if (field === 'dice') {
      const diceValue = Math.max(0, Math.min(6, Number(value)))
      newEditCliches[index] = { ...newEditCliches[index], dice: diceValue }
    } else {
      newEditCliches[index] = { ...newEditCliches[index], name: value as string }
    }
    setEditCliches(newEditCliches)
  }

  const handleNewCliqueChange = (index: number, field: 'name' | 'dice', value: string | number) => {
    const newNewCliches = [...newCliches]
    if (field === 'dice') {
      const diceValue = Math.max(0, Math.min(6, Number(value)))
      newNewCliches[index] = { ...newNewCliches[index], dice: diceValue }
    } else {
      newNewCliches[index] = { ...newNewCliches[index], name: value as string }
    }
    setNewCliches(newNewCliches)
  }

  const addNewCliche = () => {
    setNewCliches([...newCliches, { name: '', dice: 0 }])
  }

  const removeEditCliche = (index: number) => {
    if (editCliches.length > 1) {
      setEditCliches(editCliches.filter((_, i) => i !== index))
    }
  }

  const removeNewCliche = (index: number) => {
    if (newCliches.length > 1) {
      setNewCliches(newCliches.filter((_, i) => i !== index))
    }
  }

  const getRegularCliches = (cliches: Cliche[]) => {
    return cliches.filter(cliche => cliche.dice_count > 0)
  }

  const getHookCliche = (cliches: Cliche[]) => {
    return cliches.find(cliche => cliche.dice_count === -1)
  }

  const getTotalDice = (cliches: Cliche[]) => {
    return cliches.filter(cliche => cliche.dice_count > 0)
                  .reduce((sum, cliche) => sum + cliche.dice_count, 0)
  }

  const handleBackToList = () => {
    navigate('/characters')
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="character-detail">
        <div className="loading">Loading character...</div>
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="character-detail">
        <div className="error">
          <h2>Error</h2>
          <p>{error || 'Character not found'}</p>
          <div className="error-actions">
            <button onClick={handleBackToList} className="back-button">
              ← Back to Character List
            </button>
            <button onClick={handleBackToHome} className="back-button">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const regularCliches = getRegularCliches(character.cliches)
  const hookCliche = getHookCliche(character.cliches)
  const totalDice = getTotalDice(character.cliches)

  return (
    <div className="character-detail">
      <header className="character-detail-header">
        <div className="header-content">
          <h1>{isEditing ? 'Edit Character' : character.name}</h1>
          <div className="header-actions">
            {!isEditing ? (
              <>
                <button onClick={handleStartEdit} className="edit-button">
                  ✏️ Edit
                </button>
                <button onClick={handleBackToList} className="back-button">
                  ← Character List
                </button>
                <button onClick={handleBackToHome} className="back-button">
                  ← Home
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSaveEdit} 
                  className="save-button"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : '💾 Save'}
                </button>
                <button onClick={handleCancelEdit} className="cancel-button">
                  ❌ Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="character-content">
        <div className="character-info-section">
          <h2>Character Information</h2>
          
          {!isEditing ? (
            // View Mode
            <>
              {character.description && (
                <div className="info-card">
                  <h3>Description</h3>
                  <p>{character.description}</p>
                </div>
              )}

              {hookCliche && (
                <div className="info-card hook-card">
                  <h3>Hook</h3>
                  <p>{hookCliche.name.replace('Hook: ', '')}</p>
                  <small>Character flaw or complication (+1 die bonus used)</small>
                </div>
              )}

              <div className="info-card">
                <h3>Clichés ({totalDice} dice total)</h3>
                {regularCliches.length > 0 ? (
                  <div className="cliches-grid">
                    {regularCliches.map((cliche) => (
                      <div key={cliche.id} className="cliche-item">
                        <div className="cliche-name">{cliche.name}</div>
                        <div className="cliche-dice">[{cliche.dice_count}]</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No clichés defined</p>
                )}
              </div>
            </>
          ) : (
            // Edit Mode
            <div className="edit-form">
              <div className="dice-counter">
                <h3>Dice Budget: {[...editCliches, ...newCliches].filter(c => c.name.trim() && c.dice > 0).reduce((sum, c) => sum + c.dice, 0)} / {editHook.trim() ? 11 : 10}</h3>
                {editHook.trim() && <small>+1 die bonus for having a hook</small>}
              </div>

              <div className="form-group">
                <label>Character Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter character name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe your character's background and personality"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Hook (Optional - grants +1 die)</label>
                <textarea
                  value={editHook}
                  onChange={(e) => setEditHook(e.target.value)}
                  placeholder="e.g., Afraid of heights, Compulsive liar, Haunted by past"
                  rows={2}
                />
              </div>

              <div className="cliches-section">
                <h3>Current Clichés</h3>
                {editCliches.map((cliche, index) => (
                  <div key={index} className="cliche-edit-row">
                    <input
                      type="text"
                      value={cliche.name}
                      onChange={(e) => handleEditCliqueChange(index, 'name', e.target.value)}
                      placeholder="Cliché name"
                    />
                    <input
                      type="number"
                      value={cliche.dice || ''}
                      onChange={(e) => handleEditCliqueChange(index, 'dice', e.target.value)}
                      min="1"
                      max="6"
                      placeholder="Dice"
                    />
                    <button
                      type="button"
                      onClick={() => removeEditCliche(index)}
                      className="remove-button"
                      disabled={editCliches.length <= 1}
                    >
                      ❌
                    </button>
                  </div>
                ))}

                <h3>Add New Clichés</h3>
                {newCliches.map((cliche, index) => (
                  <div key={index} className="cliche-edit-row">
                    <input
                      type="text"
                      value={cliche.name}
                      onChange={(e) => handleNewCliqueChange(index, 'name', e.target.value)}
                      placeholder="New cliché name"
                    />
                    <input
                      type="number"
                      value={cliche.dice || ''}
                      onChange={(e) => handleNewCliqueChange(index, 'dice', e.target.value)}
                      min="1"
                      max="6"
                      placeholder="Dice"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewCliche(index)}
                      className="remove-button"
                      disabled={newCliches.length <= 1}
                    >
                      ❌
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addNewCliche}
                  className="add-cliche-button"
                >
                  + Add Another Cliché
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="campaigns-section">
          <h2>Campaigns</h2>
          {character.campaigns && character.campaigns.length > 0 ? (
            <div className="campaigns-list">
              {character.campaigns.map((campaign) => (
                <div key={campaign.id} className="campaign-card">
                  <h3>{campaign.name}</h3>
                  {campaign.gm_name && (
                    <p className="gm-name">GM: {campaign.gm_name}</p>
                  )}
                  {campaign.description && (
                    <p className="campaign-description">{campaign.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-campaigns">
              <p>This character is not part of any campaigns yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="character-meta">
        <small>
          Created: {new Date(character.created_at).toLocaleDateString()} | 
          Last updated: {new Date(character.updated_at).toLocaleDateString()}
        </small>
      </div>
    </div>
  )
}

export default CharacterDetail
