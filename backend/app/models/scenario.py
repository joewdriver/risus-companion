from datetime import datetime
from ..extensions import db

class Scenario(db.Model):
    """Scenario model for describing places and events players can engage with."""
    __tablename__ = 'scenarios'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)  # Description of places and events
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert scenario to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
