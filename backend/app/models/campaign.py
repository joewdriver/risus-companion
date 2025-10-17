from datetime import datetime
from ..extensions import db

class Campaign(db.Model):
    """Campaign model for organizing game sessions."""
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    gm_name = db.Column(db.String(100))  # Game Master name
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    campaign_characters = db.relationship('CampaignCharacter', backref='campaign', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert campaign to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'gm_name': self.gm_name,
            'characters': [cc.character.to_dict() for cc in self.campaign_characters],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
