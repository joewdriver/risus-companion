from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Character, Cliche

characters_bp = Blueprint('characters', __name__)

@characters_bp.route('/characters', methods=['POST'])
def create_character():
    """Create a new Risus character with clichés."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': 'Character name is required'}), 400
        
        description = data.get('description', '').strip()
        hook = data.get('hook', '').strip()
        cliches_data = data.get('cliches', [])
        
        if not cliches_data:
            return jsonify({'error': 'At least one cliché is required'}), 400
        
        # Validate dice budget
        total_dice = sum(cliche.get('dice', 0) for cliche in cliches_data)
        max_dice = 11 if hook else 10  # Extra die if hook is provided
        
        if total_dice > max_dice:
            return jsonify({
                'error': f'Too many dice! Maximum allowed: {max_dice}, used: {total_dice}'
            }), 400
        
        # Validate individual clichés
        for i, cliche_data in enumerate(cliches_data):
            cliche_name = cliche_data.get('name', '').strip()
            dice_count = cliche_data.get('dice', 0)
            
            if not cliche_name:
                return jsonify({'error': f'Cliché {i+1} name is required'}), 400
            
            if not isinstance(dice_count, int) or dice_count < 1 or dice_count > 6:
                return jsonify({
                    'error': f'Cliché "{cliche_name}" must have 1-6 dice, got: {dice_count}'
                }), 400
        
        # Create the character
        character = Character(
            name=name,
            description=description if description else None,
            hook=hook if hook else None
        )
        
        db.session.add(character)
        db.session.flush()  # Get the character ID
        
        # Create clichés
        for cliche_data in cliches_data:
            cliche = Cliche(
                name=cliche_data['name'].strip(),
                dice_count=cliche_data['dice'],
                character_id=character.id
            )
            db.session.add(cliche)
        
        # Create hook as a special cliché with -1 dice if provided
        if hook:
            hook_cliche = Cliche(
                name=f"Hook: {hook}",
                dice_count=-1,  # Special marker for hooks
                description="Character flaw or complication",
                character_id=character.id
            )
            db.session.add(hook_cliche)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Character created successfully',
            'character': character.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@characters_bp.route('/characters', methods=['GET'])
def get_characters():
    """Get all characters."""
    try:
        characters = Character.query.all()
        return jsonify({
            'characters': [character.to_dict() for character in characters]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@characters_bp.route('/characters/<int:character_id>', methods=['GET'])
def get_character(character_id):
    """Get a specific character by ID."""
    try:
        character = Character.query.get_or_404(character_id)
        return jsonify({
            'character': character.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@characters_bp.route('/characters/<int:character_id>', methods=['PUT'])
def update_character(character_id):
    """Update an existing character."""
    try:
        character = Character.query.get_or_404(character_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': 'Character name is required'}), 400
        
        description = data.get('description', '').strip()
        hook = data.get('hook', '').strip()
        cliches_data = data.get('cliches', [])
        
        if not cliches_data:
            return jsonify({'error': 'At least one cliché is required'}), 400
        
        # Validate dice budget
        total_dice = sum(cliche.get('dice', 0) for cliche in cliches_data)
        max_dice = 11 if hook else 10  # Extra die if hook is provided
        
        if total_dice > max_dice:
            return jsonify({
                'error': f'Too many dice! Maximum allowed: {max_dice}, used: {total_dice}'
            }), 400
        
        # Validate individual clichés
        for i, cliche_data in enumerate(cliches_data):
            cliche_name = cliche_data.get('name', '').strip()
            dice_count = cliche_data.get('dice', 0)
            
            if not cliche_name:
                return jsonify({'error': f'Cliché {i+1} name is required'}), 400
            
            if not isinstance(dice_count, int) or dice_count < 1 or dice_count > 6:
                return jsonify({
                    'error': f'Cliché "{cliche_name}" must have 1-6 dice, got: {dice_count}'
                }), 400
        
        # Update character basic info
        character.name = name
        character.description = description if description else None
        character.hook = hook if hook else None
        
        # Remove all existing clichés
        Cliche.query.filter_by(character_id=character.id).delete()
        
        # Add new clichés
        for cliche_data in cliches_data:
            cliche = Cliche(
                name=cliche_data['name'].strip(),
                dice_count=cliche_data['dice'],
                character_id=character.id
            )
            db.session.add(cliche)
        
        # Add hook as a special cliché with -1 dice if provided
        if hook:
            hook_cliche = Cliche(
                name=f"Hook: {hook}",
                dice_count=-1,  # Special marker for hooks
                description="Character flaw or complication",
                character_id=character.id
            )
            db.session.add(hook_cliche)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Character updated successfully',
            'character': character.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
