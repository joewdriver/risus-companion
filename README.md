# Risus RPG Companion

A web application for creating characters and managing campaigns for the Risus tabletop role playing game.

## About Risus

Risus is a simple, fun tabletop RPG system created by S. John Ross. It's known as "The Anything RPG" because it can handle any genre or setting with its flexible, cliché-based character system.

## Character Creation in Risus

### Core Concept: Clichés
Characters in Risus are defined by **Clichés** - stereotypical character types, professions, or roles that describe what your character is good at. Each Cliché has a die rating from 1 to 6 dice.

**Examples:**
- Grizzled Space Marine [4]
- Sneaky Thief [3] 
- Mad Scientist [2]
- Vampire Accountant [3]
- Ninja Librarian [4]

### Character Creation Steps

1. **Choose 3-4 Clichés** that describe different aspects of your character
2. **Distribute 10 dice** among your Clichés (minimum 1 die per Cliché, maximum 6 dice)
3. **Write a brief description** of your character's personality and background
4. **Optional**: Add a "Hook" - a character flaw, quirk, or complication that makes roleplaying more interesting

### Cliché Guidelines

- **Broad is better than narrow** - "Warrior" is more versatile than "Swordsman"
- **Be creative and fun** - Unusual combinations make memorable characters
- **Avoid overlap** - Don't choose Clichés that are too similar
- **Think about situations** - Consider what challenges your character might face

### Example Characters

**The Focused Specialist:**
- Mighty Barbarian [6] - Primary combat and strength
- Tracker [2] - Wilderness survival  
- Drinker [2] - Social situations in taverns

**The Balanced Adventurer:**
- Knight [3] - Combat and leadership
- Scholar [3] - Knowledge and research
- Diplomat [2] - Social interactions
- Horseman [2] - Mounted travel and care

**The Quirky Professional:**
- Master Thief [4] - Stealth and burglary
- Acrobat [3] - Physical agility and performance
- Lockpicker [3] - Technical security skills

### How Clichés Work in Play

- When attempting an action, roll dice equal to your relevant Cliché rating
- The GM determines which Cliché applies to each situation
- Higher dice totals generally indicate better success
- Multiple Clichés can sometimes combine for bonus dice

## Project Plan

### Phase 1: Setup & Basic Structure
- [x] Initialize project structure
- [x] Set up React frontend with Vite
- [x] Set up Flask backend
- [x] Create basic landing page
- [x] Implement health check endpoint

### Phase 2: Core Features
- [ ] User Authentication
  - User registration and login
  - Session management
- [ ] Character Management
  - Create/Edit/Delete characters
  - View character sheets
  - Save/load characters
- [ ] Campaign Management
  - Create/Join campaigns
  - Manage campaign sessions
  - Share character sheets

### Phase 3: Advanced Features
- [ ] Dice roller
- [ ] Character advancement tracking
- [ ] Campaign notes and journal
- [ ] Real-time updates for game sessions
- [ ] AI Image Generation
  - Integrate Hugging Face API for character portraits
  - Auto-generate campaign artwork
  - Create scene illustrations for RPG sessions

### Tech Stack
- Frontend: React 18, TypeScript, Vite, TailwindCSS
- Backend: Python 3.11, Flask, SQLAlchemy
- Database: SQLite (perfect for small groups)

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
flask run
```

## API Documentation

### Health Check
- `GET /api/health` - Check if the API is running
  - Response: `{ "status": "healthy", "timestamp": "2023-10-16T12:00:00Z" }`
