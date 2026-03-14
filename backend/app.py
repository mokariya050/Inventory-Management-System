import os
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.auth         import auth_bp
from routes.dashboard    import dashboard_bp
from routes.users        import users_bp
from routes.notifications import notifications_bp
from routes.messages     import messages_bp
from routes.products     import products_bp
from routes.categories   import categories_bp
from routes.suppliers    import suppliers_bp
from routes.warehouses   import warehouses_bp
from routes.receipts     import receipts_bp
from routes.deliveries   import deliveries_bp
from routes.transfers    import transfers_bp
from routes.adjustments  import adjustments_bp
from routes.stock        import stock_bp


def create_app():
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-change-me')

    JWTManager(app)
    CORS(app, resources={r'/api/*': {'origins': ['http://localhost:5173', 'http://127.0.0.1:5173']}},
         supports_credentials=True)

    app.register_blueprint(auth_bp,           url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp,      url_prefix='/api/dashboard')
    app.register_blueprint(users_bp,          url_prefix='/api/users')
    app.register_blueprint(notifications_bp,  url_prefix='/api')
    app.register_blueprint(messages_bp,       url_prefix='/api')
    app.register_blueprint(products_bp,       url_prefix='/api/products')
    app.register_blueprint(categories_bp,     url_prefix='/api/categories')
    app.register_blueprint(suppliers_bp,      url_prefix='/api/suppliers')
    app.register_blueprint(warehouses_bp,     url_prefix='/api/warehouses')
    app.register_blueprint(receipts_bp,       url_prefix='/api/receipts')
    app.register_blueprint(deliveries_bp,     url_prefix='/api/deliveries')
    app.register_blueprint(transfers_bp,      url_prefix='/api/transfers')
    app.register_blueprint(adjustments_bp,    url_prefix='/api/adjustments')
    app.register_blueprint(stock_bp,          url_prefix='/api/stock')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=os.environ.get('FLASK_DEBUG', 'true').lower() == 'true', port=3000)
