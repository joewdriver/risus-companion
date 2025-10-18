import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './CampaignList.css'

interface Character {
  id: number
  name: string
}

interface Campaign {
  id: number
  name: string
  description?: string
  gm_name?: string
  characters: Character[]
  created_at: string
  updated_at: string
}

const CampaignList: React.FC = () => {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const campaignsPerPage = 10
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage)
  const startIndex = (currentPage - 1) * campaignsPerPage
  const endIndex = startIndex + campaignsPerPage
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    // Filter campaigns based on search term
    const filtered = campaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCampaigns(filtered)
    setCurrentPage(1) // Reset to first page when searching
  }, [campaigns, searchTerm])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch('apiEndpoints.campaigns')
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const data = await response.json()
      setCampaigns(data.campaigns || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      setError('Failed to load campaigns. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCharacters = (characters: Character[]) => {
    if (characters.length === 0) return 'No characters'
    return characters.map(char => char.name).join(', ')
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

  const handleCampaignClick = (campaignId: number) => {
    navigate(`/campaigns/${campaignId}`)
  }

  if (loading) {
    return (
      <div className="campaign-list">
        <div className="loading">Loading campaigns...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="campaign-list">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchCampaigns} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="campaign-list">
      <header className="campaign-list-header">
        <h1>Campaign List</h1>
        <button onClick={handleBackToHome} className="back-button">
          ← Back to Home
        </button>
      </header>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search campaigns by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="no-campaigns">
          {searchTerm ? (
            <p>No campaigns found matching "{searchTerm}"</p>
          ) : (
            <p>No campaigns created yet. <button onClick={() => navigate('/campaign')} className="link-button">Create your first campaign!</button></p>
          )}
        </div>
      ) : (
        <>
          <div className="campaign-table">
            <div className="table-header">
              <div className="header-cell">Campaign Name</div>
              <div className="header-cell">Characters</div>
            </div>
            
            {currentCampaigns.map((campaign) => (
              <div key={campaign.id} className="table-row">
                <div className="table-cell campaign-name">
                  <strong 
                    className="campaign-name-link"
                    onClick={() => handleCampaignClick(campaign.id)}
                  >
                    {campaign.name}
                  </strong>
                  {campaign.gm_name && (
                    <div className="campaign-gm">GM: {campaign.gm_name}</div>
                  )}
                  {campaign.description && (
                    <div className="campaign-description">{campaign.description}</div>
                  )}
                </div>
                <div className="table-cell campaign-characters">
                  {formatCharacters(campaign.characters)}
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
                Page {currentPage} of {totalPages} ({filteredCampaigns.length} campaigns)
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

export default CampaignList
