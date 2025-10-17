import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './CharacterList.css'

interface Cliche {
  id: number
  name: string
  dice_count: number
  description?: string
}

interface Character {
  id: number
  name: string
  description?: string
  hook?: string
  cliches: Cliche[]
  created_at: string
  updated_at: string
}

const CharacterList: React.FC = () => {
  const navigate = useNavigate()
  const [characters, setCharacters] = useState<Character[]>([])
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const charactersPerPage = 10
  const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage)
  const startIndex = (currentPage - 1) * charactersPerPage
  const endIndex = startIndex + charactersPerPage
  const currentCharacters = filteredCharacters.slice(startIndex, endIndex)

  useEffect(() => {
    fetchCharacters()
  }, [])

  useEffect(() => {
    // Filter characters based on search term
    const filtered = characters.filter(character =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCharacters(filtered)
    setCurrentPage(1) // Reset to first page when searching
  }, [characters, searchTerm])

  const fetchCharacters = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://127.0.0.1:5000/api/characters')
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters')
      }

      const data = await response.json()
      setCharacters(data.characters || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching characters:', err)
      setError('Failed to load characters. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCliches = (cliches: Cliche[]) => {
    // Filter out hook cliches (dice_count = -1) and format regular cliches
    const regularCliches = cliches.filter(cliche => cliche.dice_count > 0)
    return regularCliches.map(cliche => `${cliche.name} [${cliche.dice_count}]`).join(', ')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="character-list">
        <div className="loading">Loading characters...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="character-list">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchCharacters} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="character-list">
      <header className="character-list-header">
        <h1>Character List</h1>
        <button onClick={handleBackToHome} className="back-button">
          ← Back to Home
        </button>
      </header>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search characters by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {filteredCharacters.length === 0 ? (
        <div className="no-characters">
          {searchTerm ? (
            <p>No characters found matching "{searchTerm}"</p>
          ) : (
            <p>No characters created yet. <button onClick={() => navigate('/character')} className="link-button">Create your first character!</button></p>
          )}
        </div>
      ) : (
        <>
          <div className="character-table">
            <div className="table-header">
              <div className="header-cell">Character Name</div>
              <div className="header-cell">Clichés</div>
            </div>
            
            {currentCharacters.map((character) => (
              <div key={character.id} className="table-row">
                <div className="table-cell character-name">
                  <strong 
                    className="character-name-link"
                    onClick={() => navigate(`/characters/${character.id}`)}
                  >
                    {character.name}
                  </strong>
                  {character.hook && (
                    <div className="character-hook">Hook: {character.hook}</div>
                  )}
                </div>
                <div className="table-cell character-cliches">
                  {formatCliches(character.cliches) || 'No clichés'}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              
              <div className="page-info">
                Page {currentPage} of {totalPages} ({filteredCharacters.length} characters)
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CharacterList
