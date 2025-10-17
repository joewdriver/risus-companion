from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Campaign, Character, CampaignCharacter
from datetime import datetime
from ..models.session import Session
from ..models.session_participant import SessionParticipant

campaigns_bp = Blueprint('campaigns', __name__)

@campaigns_bp.route('/campaigns', methods=['POST'])
def create_campaign():
    """Create a new campaign with initial characters."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': 'Campaign name is required'}), 400
        
        gm_name = data.get('gm_name', '').strip()
        description = data.get('description', '').strip()
        character_ids = data.get('character_ids', [])
        
        # Validate character IDs if provided
        if character_ids:
            # Check that all character IDs exist
            existing_characters = Character.query.filter(Character.id.in_(character_ids)).all()
            existing_ids = [char.id for char in existing_characters]
            
            missing_ids = set(character_ids) - set(existing_ids)
            if missing_ids:
                return jsonify({
                    'error': f'Characters not found: {list(missing_ids)}'
                }), 400
        
        # Create the campaign
        campaign = Campaign(
            name=name,
            gm_name=gm_name if gm_name else None,
            description=description if description else None
        )
        
        db.session.add(campaign)
        db.session.flush()  # Get the campaign ID
        
        # Add characters to campaign
        for character_id in character_ids:
            campaign_character = CampaignCharacter(
                campaign_id=campaign.id,
                character_id=character_id
            )
            db.session.add(campaign_character)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Campaign created successfully',
            'campaign': campaign.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@campaigns_bp.route('/sessions/<int:session_id>', methods=['PATCH'])
def update_session(session_id: int):
    """Update a session's details and participants.

    Parameters:
    - session_id (int): Path parameter. The ID of the session to update.
    - body.title (str): JSON body. New title. Optional (non-empty if provided).
    - body.description (str): JSON body. New description. Optional.
    - body.participant_ids (List[int]): JSON body. New participant character IDs. Optional.
    - body.session_date (str): JSON body. Optional ISO datetime for the session.
    """
    try:
        session = Session.query.get_or_404(session_id)
        campaign = Campaign.query.get_or_404(session.campaign_id)

        payload = request.get_json(silent=True) or {}

        # Update primitives
        if 'title' in payload:
            new_title = (payload.get('title') or '').strip()
            if not new_title:
                return jsonify({'error': 'title cannot be empty'}), 400
            session.title = new_title

        if 'description' in payload:
            new_desc = (payload.get('description') or '').strip()
            session.description = new_desc or None

        if 'session_date' in payload:
            raw = payload.get('session_date')
            if raw:
                try:
                    session.session_date = datetime.fromisoformat(raw)
                except Exception:
                    return jsonify({'error': 'session_date must be ISO format'}), 400
            else:
                session.session_date = None

        # Update participants (replace with provided set)
        if 'participant_ids' in payload:
            ids = payload.get('participant_ids') or []
            if not isinstance(ids, list):
                return jsonify({'error': 'participant_ids must be a list of integers'}), 400
            for cid in ids:
                if not isinstance(cid, int):
                    return jsonify({'error': 'participant_ids must be a list of integers'}), 400
            # Validate characters belong to this campaign
            valid_ids = set(cc.character_id for cc in campaign.campaign_characters)
            for cid in ids:
                if cid not in valid_ids:
                    return jsonify({'error': f'Character {cid} is not part of this campaign'}), 400
            # Sync participants
            current = SessionParticipant.query.filter_by(session_id=session.id).all()
            current_ids = {sp.character_id for sp in current}
            new_ids = set(ids)
            # Remove extras
            for sp in current:
                if sp.character_id not in new_ids:
                    db.session.delete(sp)
            # Add missing
            for cid in new_ids - current_ids:
                db.session.add(SessionParticipant(session_id=session.id, character_id=cid))

        db.session.commit()

        # Return updated campaign with sessions
        sessions = Session.query.filter_by(campaign_id=campaign.id).order_by(Session.created_at.desc()).all()
        data = campaign.to_dict()
        data['sessions'] = [s.to_dict() for s in sessions]
        return jsonify({'message': 'Session updated', 'campaign': data}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@campaigns_bp.route('/campaigns/<int:campaign_id>/sessions', methods=['POST'])
def create_session_for_campaign(campaign_id: int):
    """Create a session for a campaign and optionally add participants.

    Parameters:
    - campaign_id (int): Path parameter. The target campaign ID.
    - body.title (str): JSON body. Session title/name. Required, non-empty.
    - body.description (str): JSON body. Session description/details. Optional.
    - body.participant_ids (List[int]): JSON body. Character IDs participating. Optional.
    - body.session_date (str): JSON body. Optional ISO date/time for the session.
    """
    try:
        campaign = Campaign.query.get_or_404(campaign_id)

        payload = request.get_json(silent=True) or {}
        title = (payload.get('title') or '').strip()
        description = (payload.get('description') or '').strip() or None
        participant_ids = payload.get('participant_ids') or []
        session_date_raw = payload.get('session_date')

        if not title:
            return jsonify({'error': 'title is required'}), 400

        # Compute next session_number within campaign
        existing_numbers = [row[0] for row in db.session.query(Session.session_number)
                            .filter(Session.campaign_id == campaign.id, Session.session_number.isnot(None)).all()]
        next_number = (max(existing_numbers) + 1) if existing_numbers else 1

        # Parse optional session_date
        session_date = None
        if session_date_raw:
            try:
                session_date = datetime.fromisoformat(session_date_raw)
            except Exception:
                return jsonify({'error': 'session_date must be ISO format'}), 400

        new_session = Session(
            campaign_id=campaign.id,
            session_number=next_number,
            title=title,
            description=description,
            session_date=session_date,
        )
        db.session.add(new_session)
        db.session.flush()

        # Validate and add participants if provided
        valid_ids = set(cc.character_id for cc in campaign.campaign_characters)
        for cid in participant_ids:
            if not isinstance(cid, int):
                db.session.rollback()
                return jsonify({'error': 'All participant_ids must be integers'}), 400
            if cid not in valid_ids:
                db.session.rollback()
                return jsonify({'error': f'Character {cid} is not part of this campaign'}), 400
            db.session.add(SessionParticipant(session_id=new_session.id, character_id=cid))

        db.session.commit()

        # Build response with sessions fetched by campaign_id
        sessions = Session.query.filter_by(campaign_id=campaign.id).order_by(Session.created_at.desc()).all()
        data = campaign.to_dict()
        data['sessions'] = [s.to_dict() for s in sessions]

        return jsonify({'message': 'Session created', 'campaign': data}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@campaigns_bp.route('/campaigns/<int:campaign_id>/characters/<int:character_id>', methods=['DELETE'])
def remove_character_from_campaign(campaign_id: int, character_id: int):
    """Remove a character from a campaign.

    Parameters:
    - campaign_id (int): Path parameter. The ID of the campaign to modify.
    - character_id (int): Path parameter. The ID of the character to remove.
    """
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        # ensure character exists to give a better error message
        _ = Character.query.get_or_404(character_id)

        assoc = CampaignCharacter.query.filter_by(
            campaign_id=campaign.id,
            character_id=character_id,
        ).first()
        if not assoc:
            return jsonify({'error': 'Character is not part of this campaign'}), 404

        db.session.delete(assoc)
        db.session.commit()

        # Include sessions in response for UI consistency
        sessions = Session.query.filter_by(campaign_id=campaign.id).order_by(Session.created_at.desc()).all()
        data = campaign.to_dict()
        data['sessions'] = [s.to_dict() for s in sessions]

        return jsonify({'message': 'Character removed', 'campaign': data}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@campaigns_bp.route('/campaigns', methods=['GET'])
def get_campaigns():
    """Get all campaigns."""
    try:
        campaigns = Campaign.query.all()
        return jsonify({
            'campaigns': [campaign.to_dict() for campaign in campaigns]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@campaigns_bp.route('/campaigns/<int:campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    """Get a specific campaign by ID."""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        return jsonify({
            'campaign': campaign.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@campaigns_bp.route('/campaign', methods=['GET'])
def get_campaign_by_query():
    """Get a specific campaign by query parameter and sort sessions by creation date.

    Parameters:
    - id (int): The ID of the campaign to retrieve (required)
    """
    try:
        campaign_id = request.args.get('id', type=int)
        if not campaign_id:
            return jsonify({'error': 'Query parameter "id" is required and must be an integer'}), 400

        campaign = Campaign.query.get_or_404(campaign_id)

        # Fetch sessions by campaign_id, newest first
        sessions = Session.query.filter_by(campaign_id=campaign.id).order_by(Session.created_at.desc()).all()
        data = campaign.to_dict()
        data['sessions'] = [s.to_dict() for s in sessions]

        return jsonify({'campaign': data}), 200
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@campaigns_bp.route('/campaigns/<int:campaign_id>/characters', methods=['POST'])
def add_character_to_campaign(campaign_id: int):
    """Add a character to a campaign.

    Parameters:
    - campaign_id (int): Path parameter. The ID of the campaign to modify.
    - body.character_id (int): JSON body. The ID of the character to add (required).
    - body.player_name (str): JSON body. Optional player name to associate.
    """
    try:
        payload = request.get_json(silent=True) or {}
        character_id = payload.get('character_id')
        player_name = payload.get('player_name')

        if not isinstance(character_id, int):
            return jsonify({'error': 'character_id is required and must be an integer'}), 400

        campaign = Campaign.query.get_or_404(campaign_id)
        character = Character.query.get_or_404(character_id)

        # Ensure character not already in campaign
        existing = CampaignCharacter.query.filter_by(
            campaign_id=campaign.id, character_id=character.id
        ).first()
        if existing:
            return jsonify({'error': 'Character is already part of this campaign'}), 409

        assoc = CampaignCharacter(
            campaign_id=campaign.id,
            character_id=character.id,
            player_name=player_name if player_name else None,
        )
        db.session.add(assoc)
        db.session.commit()

        # Include sessions in response for UI consistency
        sessions = Session.query.filter_by(campaign_id=campaign.id).order_by(Session.created_at.desc()).all()
        data = campaign.to_dict()
        data['sessions'] = [s.to_dict() for s in sessions]

        return jsonify({'message': 'Character added', 'campaign': data}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
