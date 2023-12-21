from flask import Flask, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token
import os
from flask_cors import CORS;

app = Flask(__name__)
CORS(app, resources={r"/localhost:300": {"origins": "*"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'secret_key')
db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(50), default='angajat')


# Endpoint pentru înregistrare
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'angajat') 

    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password_hash=hashed_password, role=role)

    db.session.add(new_user)
    db.session.commit()


# Endpoint pentru autentificare
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password_hash, data['password']):
        token = create_access_token(identity=user.email)


# Definește o rută pentru a afișa conținutul întregii baze de date
@app.route('/show-database')
def show_database():
    with app.app_context():
        # Ia toate tabelele din bază
        metadata = db.metadata
        table_names = metadata.tables.keys()
        database_content = {}
        
        # Interoghează fiecare tabel și adaugă conținutul în dicționar
        for table_name in table_names:
            table = metadata.tables[table_name]
            rows = db.session.query(table).all()
            data = []
            for row in rows:
                row_dict = {column.name: getattr(row, column.name) for column in table.columns}
                data.append(row_dict)
            database_content[table_name] = data
        
        return database_content

def run():
    from waitress import serve
    serve(app, host="0.0.0.0", port=3000)



if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    if os.environ.get('FLASK_ENV') == 'development':
        app.run(debug=True, port=3000)  
    else:
        run()