import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CharacterCreation.css'
import { apiEndpoints } from '../config/api'

interface Cliche {
  name: string
  dice: number
}

const CharacterCreation: React.FC = () => {
  const navigate = useNavigate()
  const [characterName, setCharacterName] = useState('')
  const [description, setDescription] = useState('')
  const [hook, setHook] = useState('')
  const [cliches, setCliches] = useState<Cliche[]>([
    { name: '', dice: 0 },
    { name: '', dice: 0 },
    { name: '', dice: 0 },
    { name: '', dice: 0 },
    { name: '', dice: 0 }
  ])

  const totalDice = cliches.reduce((sum, cliche) => sum + cliche.dice, 0)
  const maxDice = hook.trim() ? 11 : 10 // Extra die if hook is provided
  const remainingDice = maxDice - totalDice

  const handleCliqueChange = (index: number, field: 'name' | 'dice', value: string | number) => {
    const newCliches = [...cliches]
    if (field === 'dice') {
      const diceValue = Math.max(0, Math.min(6, Number(value))) // Clamp between 0-6
      newCliches[index] = { ...newCliches[index], dice: diceValue }
    } else {
      newCliches[index] = { ...newCliches[index], name: value as string }
    }
    setCliches(newCliches)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!characterName.trim()) {
      alert('Character name is required')
      return
    }

    if (totalDice > maxDice) {
      alert(`Too many dice! You can only use ${maxDice} dice total.`)
      return
    }

    // Filter out empty cliches
    const validCliches = cliches.filter(cliche => cliche.name.trim() && cliche.dice > 0)
    
    if (validCliches.length === 0) {
      alert('At least one cliché is required')
      return
    }

    const characterData = {
      name: characterName.trim(),
      description: description.trim(),
      hook: hook.trim(),
      cliches: validCliches
    }

    try {
      const response = await fetch(apiEndpoints.characters, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData)
      })

      if (response.ok) {
        const result = await response.json()
        alert('Character created successfully!')
        console.log('Created character:', result)
        // Navigate to the character detail page
        navigate(`/characters/${result.character.id}`)
      } else {
        const error = await response.json()
        alert(`Error creating character: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating character:', error)
      alert('Failed to create character. Please try again.')
    }
  }

  return (
    <div className="character-creation">
      <header className="character-header">
        <h1>Create Your Risus Character</h1>
        <p>Build your character with clichés and dice</p>
      </header>

      <form onSubmit={handleSubmit} className="character-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="characterName">Character Name *</label>
            <input
              type="text"
              id="characterName"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Enter character name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your character's background and personality"
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Clichés</h2>
          <p className="dice-budget">
            Dice Used: <span className={totalDice > maxDice ? 'over-budget' : ''}>{totalDice}</span> / {maxDice}
            {remainingDice > 0 && <span className="remaining"> ({remainingDice} remaining)</span>}
          </p>

          {cliches.map((cliche, index) => (
            <div key={index} className="cliche-row">
              <div className="form-group cliche-name">
                <label htmlFor={`cliche-${index}`}>Cliché {index + 1}</label>
                <input
                  type="text"
                  id={`cliche-${index}`}
                  value={cliche.name}
                  onChange={(e) => handleCliqueChange(index, 'name', e.target.value)}
                  placeholder="e.g., Grizzled Space Marine, Sneaky Thief"
                />
              </div>
              <div className="form-group cliche-dice">
                <label htmlFor={`dice-${index}`}>Dice</label>
                <input
                  type="number"
                  id={`dice-${index}`}
                  value={cliche.dice || ''}
                  onChange={(e) => handleCliqueChange(index, 'dice', e.target.value)}
                  min="0"
                  max="6"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <h2>Hook (Optional)</h2>
          <p className="hook-info">
            Add a character flaw or complication to get +1 die for your budget!
          </p>
          
          <div className="form-group">
            <label htmlFor="hook">Character Hook</label>
            <textarea
              id="hook"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="e.g., Afraid of heights, Compulsive liar, Haunted by past"
              rows={2}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="create-button"
            disabled={totalDice > maxDice || totalDice === 0}
          >
            Create Character
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CharacterCreation
