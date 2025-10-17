from ..extensions import db

class Cliche(db.Model):
    """Risus cliché model."""
    __tablename__ = 'cliches'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dice_count = db.Column(db.Integer, nullable=False)  # 1-6 dice
    description = db.Column(db.Text)  # Optional description of what this cliché covers
    character_id = db.Column(db.Integer, db.ForeignKey('characters.id'), nullable=False)
    
    def to_dict(self):
        """Convert cliché to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'dice_count': self.dice_count,
            'description': self.description
        }
