import os
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.employees import employees_bp
from routes.projects import projects_bp
from routes.tasks import tasks_bp
from routes.users import users_bp
from routes.notifications import notifications_bp
from routes.messages import messages_bp


def create_app():
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-change-me')

    JWTManager(app)
    CORS(app, resources={r'/api/*': {'origins': ['http://localhost:5173', 'http://127.0.0.1:5173']}},
         supports_credentials=True)

    app.register_blueprint(auth_bp,          url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp,     url_prefix='/api/dashboard')
    app.register_blueprint(employees_bp,     url_prefix='/api')
    app.register_blueprint(projects_bp,      url_prefix='/api')
    app.register_blueprint(tasks_bp,         url_prefix='/api')
    app.register_blueprint(users_bp,         url_prefix='/api/users')
    app.register_blueprint(notifications_bp, url_prefix='/api')
    app.register_blueprint(messages_bp,      url_prefix='/api')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=os.environ.get('FLASK_DEBUG', 'true').lower() == 'true', port=3000)
