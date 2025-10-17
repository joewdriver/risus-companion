from ..extensions import db

class SessionParticipant(db.Model):
    """Association table for characters that participated in a session."""
    __tablename__ = 'session_participants'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    character_id = db.Column(db.Integer, db.ForeignKey('characters.id'), nullable=False)
    notes = db.Column(db.Text)  # Optional notes about this character's participation
    
    # Relationships
    character = db.relationship('Character', backref='session_participations')
    
    def to_dict(self):
        """Convert session participant to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'character': self.character.to_dict(),
            'notes': self.notes
        }
