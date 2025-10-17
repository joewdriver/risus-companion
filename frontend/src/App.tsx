import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import CharacterCreation from './pages/CharacterCreation'
import CharacterList from './pages/CharacterList'
import CharacterDetail from './pages/CharacterDetail'
import CampaignCreation from './pages/CampaignCreation'
import CampaignList from './pages/CampaignList'
import CampaignDetail from './pages/CampaignDetail'
import './App.css'

function HomePage() {
  const navigate = useNavigate()

  const handleCreateCharacter = () => {
    navigate('/character')
  }

  const handleCreateCampaign = () => {
    navigate('/campaign')
  }

  const handleLoadCampaign = () => {
    navigate('/campaigns')
  }

  const handleCharacterList = () => {
    navigate('/characters')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="title">Risus</h1>
        <p className="subtitle">The Anything RPG Companion</p>
      </header>
      
      <main className="main-content">
        <nav className="menu">
          <button 
            className="menu-button" 
            onClick={handleCreateCharacter}
          >
            Create Character
          </button>
          <button 
            className="menu-button" 
            onClick={handleCreateCampaign}
          >
            Create Campaign
          </button>
          <button 
            className="menu-button" 
            onClick={handleLoadCampaign}
          >
            Campaigns
          </button>
          <button 
            className="menu-button" 
            onClick={handleCharacterList}
          >
            Character List
          </button>
        </nav>
        
        <div className="hero-image">
          <img 
            src="/images/home_image.png" 
            alt="Risus RPG Hero Image" 
            className="main-image"
          />
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/character" element={<CharacterCreation />} />
        <Route path="/characters" element={<CharacterList />} />
        <Route path="/characters/:id" element={<CharacterDetail />} />
        <Route path="/campaign" element={<CampaignCreation />} />
        <Route path="/campaigns" element={<CampaignList />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
      </Routes>
    </Router>
  )
}

export default App
