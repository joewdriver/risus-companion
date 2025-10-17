import os
from flask import Flask
from flask_cors import CORS
from .extensions import db
from .config import config

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    
    # Import models to register them with SQLAlchemy
    from . import models
    
    # Register blueprints
    from .api import health_bp, characters_bp, campaigns_bp
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(characters_bp, url_prefix='/api')
    app.register_blueprint(campaigns_bp, url_prefix='/api')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
