from datetime import datetime
from ..extensions import db

class Session(db.Model):
    """Session model for individual game sessions within a campaign."""
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    scenario_id = db.Column(db.Integer, db.ForeignKey('scenarios.id'), nullable=True)  # Link to scenario
    session_number = db.Column(db.Integer, nullable=False)  # Sequential session number within campaign
    title = db.Column(db.String(200))  # Optional session title
    description = db.Column(db.Text)  # Session summary/notes
    session_date = db.Column(db.DateTime)  # When the session was played
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    participants = db.relationship('SessionParticipant', backref='session', lazy=True, cascade='all, delete-orphan')
    scenario = db.relationship('Scenario', backref='sessions')
    
    def to_dict(self):
        """Convert session to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'session_number': self.session_number,
            'title': self.title,
            'description': self.description,
            'session_date': self.session_date.isoformat() if self.session_date else None,
            'scenario': self.scenario.to_dict() if self.scenario else None,
            'participants': [p.to_dict() for p in self.participants],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
