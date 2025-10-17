from datetime import datetime
from ..extensions import db

class CampaignCharacter(db.Model):
    """Association table for characters in campaigns."""
    __tablename__ = 'campaign_characters'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    character_id = db.Column(db.Integer, db.ForeignKey('characters.id'), nullable=False)
    player_name = db.Column(db.String(100))  # Name of the player controlling this character
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    character = db.relationship('Character', backref='campaign_memberships')
    
    def to_dict(self):
        """Convert campaign character to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'player_name': self.player_name,
            'character': self.character.to_dict(),
            'joined_at': self.joined_at.isoformat() if self.joined_at else None
        }
