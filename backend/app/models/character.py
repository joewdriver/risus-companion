from datetime import datetime
from ..extensions import db

class Character(db.Model):
    """Risus character model."""
    __tablename__ = 'characters'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    hook = db.Column(db.Text)  # Character flaw or complication
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to clichés
    cliches = db.relationship('Cliche', backref='character', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert character to dictionary for JSON serialization."""
        # Get campaigns this character is part of
        campaigns = []
        for membership in self.campaign_memberships:
            campaign = membership.campaign
            campaigns.append({
                'id': campaign.id,
                'name': campaign.name,
                'description': campaign.description,
                'gm_name': campaign.gm_name
            })
        
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'hook': self.hook,
            'cliches': [cliche.to_dict() for cliche in self.cliches],
            'campaigns': campaigns,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
