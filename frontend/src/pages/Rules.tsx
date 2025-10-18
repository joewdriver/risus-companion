import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Rules.css'

const Rules: React.FC = () => {
  const navigate = useNavigate()

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="rules-page">
      <header className="rules-header">
        <h1>Risus: The Anything RPG</h1>
        <p>Simple, fast, and flexible rules for any genre</p>
        <button onClick={handleBackToHome} className="back-button">
          ← Back to Home
        </button>
      </header>

      <div className="rules-content">
        <section className="rules-section">
          <h2>🎲 What is Risus?</h2>
          <p>
            Risus is a complete role-playing game designed to provide an "RPG Lite" for 
            those nights when the brain is too tired for exacting detail, but the game 
            must go on. It is especially valuable to GMs who want to be able to run 
            spontaneous games with very little preparation.
          </p>
        </section>

        <section className="rules-section">
          <h2>🎭 Character Creation</h2>
          <div className="rule-block">
            <h3>Clichés</h3>
            <p>
              Characters are defined by <strong>Clichés</strong> - stereotypical character types, 
              professions, or roles. Each Cliché has a die rating from 1 to 6 dice.
            </p>
            <ul>
              <li>Choose 3-4 Clichés that describe different aspects of your character</li>
              <li>Distribute 10 dice among your Clichés (minimum 1 die, maximum 6 dice per Cliché)</li>
              <li>Examples: "Grizzled Space Marine [4]", "Sneaky Thief [3]", "Mad Scientist [2]"</li>
            </ul>
          </div>

          <div className="rule-block">
            <h3>Hooks (Optional)</h3>
            <p>
              A <strong>Hook</strong> is a character flaw, fear, or disadvantage that makes 
              roleplaying more interesting. Adding a Hook gives you +1 die to distribute 
              (11 total instead of 10).
            </p>
            <ul>
              <li>Examples: "Afraid of heights", "Compulsive liar", "Haunted by the past"</li>
              <li>Should create interesting story complications</li>
            </ul>
          </div>
        </section>

        <section className="rules-section">
          <h2>⚔️ Task Resolution</h2>
          <div className="rule-block">
            <h3>Basic Roll</h3>
            <p>
              When attempting an action, roll dice equal to your relevant Cliché rating. 
              The GM sets a Target Number based on difficulty.
            </p>
            <ul>
              <li><strong>Easy:</strong> Target Number 5</li>
              <li><strong>Moderate:</strong> Target Number 10</li>
              <li><strong>Hard:</strong> Target Number 15</li>
              <li><strong>Extreme:</strong> Target Number 20+</li>
            </ul>
          </div>

          <div className="rule-block">
            <h3>Inappropriate Clichés</h3>
            <p>
              When using a Cliché for something it wasn't designed for, you roll only 
              half the dice (rounded down, minimum 1).
            </p>
          </div>
        </section>

        <section className="rules-section">
          <h2>⚡ Combat</h2>
          <div className="rule-block">
            <h3>Combat Rounds</h3>
            <p>
              Combat is resolved through opposed rolls. Both sides roll their relevant 
              Clichés, and the higher total wins the round.
            </p>
            <ul>
              <li>Winner describes the outcome of their success</li>
              <li>Loser loses one die from the Cliché they used</li>
              <li>When a Cliché reaches 0 dice, the character is out of the fight</li>
            </ul>
          </div>

          <div className="rule-block">
            <h3>Team Combat</h3>
            <p>
              Multiple characters can team up against a single opponent. Each additional 
              teammate adds +1 die to the lead character's roll.
            </p>
          </div>
        </section>

        <section className="rules-section">
          <h2>🎯 Advanced Rules</h2>
          <div className="rule-block">
            <h3>Lucky Shots & Pumps</h3>
            <ul>
              <li><strong>Lucky Shot:</strong> Rolling all 6s on your dice deals double damage</li>
              <li><strong>Pump:</strong> Voluntarily reduce your dice pool to add to damage</li>
            </ul>
          </div>

          <div className="rule-block">
            <h3>Funky Dice</h3>
            <p>
              For special situations, the GM might call for different die types:
            </p>
            <ul>
              <li><strong>d4s:</strong> When seriously impaired or using broken equipment</li>
              <li><strong>d8s, d10s, d12s:</strong> When using exceptional equipment or in ideal conditions</li>
              <li><strong>d20s:</strong> For legendary artifacts or divine intervention</li>
            </ul>
          </div>
        </section>

        <section className="rules-section">
          <h2>🏥 Recovery</h2>
          <div className="rule-block">
            <p>
              Lost dice return at different rates depending on the situation:
            </p>
            <ul>
              <li><strong>After combat:</strong> 1 die per Cliché</li>
              <li><strong>After good night's rest:</strong> All dice return</li>
              <li><strong>Medical attention:</strong> May restore dice faster (GM's discretion)</li>
            </ul>
          </div>
        </section>

        <section className="rules-section">
          <h2>🎮 Game Master Tips</h2>
          <div className="rule-block">
            <ul>
              <li>Keep the game fast and loose - don't get bogged down in details</li>
              <li>Encourage creative use of Clichés</li>
              <li>Let players describe their successes</li>
              <li>Use Hooks to create story complications</li>
              <li>Don't be afraid to make up rules on the spot</li>
              <li>The most important rule: Have fun!</li>
            </ul>
          </div>
        </section>

        <footer className="rules-footer">
          <p>
            <em>
              Risus was created by S. John Ross and is available for free at 
              <a href="http://www.risusiverse.com/" target="_blank" rel="noopener noreferrer">
                www.risusiverse.com
              </a>
            </em>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default Rules