import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './CampaignCreation.css'

interface Character {
  id: number
  name: string
}

const CampaignCreation: React.FC = () => {
  const navigate = useNavigate()
  const [campaignName, setCampaignName] = useState('')
  const [gmName, setGmName] = useState('')
  const [description, setDescription] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredCharacters = allCharacters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedCharacters.some(selected => selected.id === character.id)
  )

  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://127.0.0.1:5000/api/characters')
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters')
      }

      const data = await response.json()
      // Extract just id and name for the character selection
      const characters = data.characters.map((char: any) => ({
        id: char.id,
        name: char.name
      }))
      setAllCharacters(characters)
      setError(null)
    } catch (err) {
      console.error('Error fetching characters:', err)
      setError('Failed to load characters. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCharacter = (character: Character) => {
    setSelectedCharacters([...selectedCharacters, character])
  }

  const handleRemoveCharacter = (characterId: number) => {
    setSelectedCharacters(selectedCharacters.filter(char => char.id !== characterId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!campaignName.trim()) {
      alert('Campaign name is required')
      return
    }

    try {
      setSaving(true)
      
      const campaignData = {
        name: campaignName.trim(),
        gm_name: gmName.trim(),
        description: description.trim(),
        character_ids: selectedCharacters.map(char => char.id)
      }

      const response = await fetch('http://127.0.0.1:5000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      })

      if (response.ok) {
        const result = await response.json()
        alert('Campaign created successfully!')
        console.log('Created campaign:', result)
        // TODO: Navigate to campaign detail page when implemented
        navigate('/')
      } else {
        const error = await response.json()
        alert(`Error creating campaign: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="campaign-creation">
        <div className="loading">Loading characters...</div>
      </div>
    )
  }

  return (
    <div className="campaign-creation">
      <header className="campaign-creation-header">
        <h1>Create New Campaign</h1>
        <button onClick={handleBackToHome} className="back-button">
          ← Back to Home
        </button>
      </header>

      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-section">
          <h2>Campaign Information</h2>
          
          <div className="form-group">
            <label htmlFor="campaignName">Campaign Name *</label>
            <input
              type="text"
              id="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gmName">Game Master</label>
            <input
              type="text"
              id="gmName"
              value={gmName}
              onChange={(e) => setGmName(e.target.value)}
              placeholder="Enter GM name (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the campaign setting and story"
              rows={4}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Add Characters</h2>
          
          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button type="button" onClick={fetchCharacters} className="retry-button">
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="character-search">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="character-selection">
                <div className="available-characters">
                  <h3>Available Characters ({filteredCharacters.length})</h3>
                  {filteredCharacters.length > 0 ? (
                    <div className="character-list">
                      {filteredCharacters.map((character) => (
                        <div key={character.id} className="character-item">
                          <span className="character-name">{character.name}</span>
                          <button
                            type="button"
                            onClick={() => handleAddCharacter(character)}
                            className="add-button"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-characters">
                      {searchTerm ? 'No characters match your search' : 'No characters available'}
                    </p>
                  )}
                </div>

                <div className="selected-characters">
                  <h3>Selected Characters ({selectedCharacters.length})</h3>
                  {selectedCharacters.length > 0 ? (
                    <div className="character-list">
                      {selectedCharacters.map((character) => (
                        <div key={character.id} className="character-item selected">
                          <span className="character-name">{character.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCharacter(character.id)}
                            className="remove-button"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-characters">No characters selected</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="create-button"
            disabled={saving || !campaignName.trim()}
          >
            {saving ? 'Creating...' : 'Create Campaign'}
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={handleBackToHome}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CampaignCreation
