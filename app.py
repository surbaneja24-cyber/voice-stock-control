import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

# =========================
# CONFIGURACIÓN
# =========================
# Leemos la URL de la base de datos desde el entorno para producción (Render).
# Si no existe (entorno local), usa SQLite como respaldo temporal.
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///users.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Extensiones
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app)

# =========================
# MODELOS
# =========================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    location = db.Column(db.String(50))

class Movement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    movement_type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

# =========================
# RUTAS DE ESTADO
# =========================

@app.route("/")
def home():
    return jsonify({"msg": "Servidor API funcionando correctamente"})

# =========================
# AUTH
# =========================

@app.route("/api/registro", methods=["POST"])
def register():
    data = request.get_json()

    # 1. Validar que los datos existan
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña obligatorios"}), 400
    
    # 2. Asegurarnos de que el password sea un string
    if not isinstance(password, str):
        return jsonify({"msg": "Formato de contraseña inválido"}), 400

    # 3. Validación estricta del límite de Bcrypt (Evita el Error 500)
    if len(password) > 72:
        return jsonify({"msg": "La contraseña excede el límite máximo de 72 caracteres"}), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"msg": "El usuario ya existe"}), 400

    # 4. Encriptación segura corrigiendo el error de sintaxis anterior
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(
        email=email,
        password=hashed_password
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "Usuario registrado"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"msg": "Contraseña incorrecta"}), 401

    return jsonify({
        "msg": "Login correcto",
        "id": user.id,
        "email": user.email
    })

# =========================
# PRODUCTOS
# =========================

@app.route("/api/products", methods=["POST"])
def create_product():
    data = request.get_json()

    existing_product = Product.query.filter_by(
        sku=data["sku"]
    ).first()

    if existing_product:
        return jsonify({"msg": "SKU ya existente"}), 400

    product = Product(
        name=data["name"],
        sku=data["sku"],
        quantity=data["quantity"],
        location=data["location"]
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({"msg": "Producto creado"}), 201

@app.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.all()

    result = []
    for product in products:
        result.append({
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "quantity": product.quantity,
            "location": product.location
        })

    return jsonify(result)

@app.route("/api/products/<int:product_id>/add", methods=["PUT"])
def add_stock(product_id):
    data = request.get_json()
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"msg": "Producto no encontrado"}), 404

    quantity = data.get("quantity", 0)

    if quantity <= 0:
        return jsonify({"msg": "Cantidad inválida"}), 400

    product.quantity += quantity

    movement = Movement(
        product_id=product.id,
        movement_type="add",
        quantity=quantity
    )

    db.session.add(movement)
    db.session.commit()

    return jsonify({
        "msg": "Stock añadido",
        "new_quantity": product.quantity
    })

@app.route("/api/products/<int:product_id>/remove", methods=["PUT"])
def remove_stock(product_id):
    data = request.get_json()
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"msg": "Producto no encontrado"}), 404

    quantity = data.get("quantity", 0)

    if quantity <= 0:
        return jsonify({"msg": "Cantidad inválida"}), 400

    if product.quantity < quantity:
        return jsonify({"msg": "Stock insuficiente"}), 400

    product.quantity -= quantity

    movement = Movement(
        product_id=product.id,
        movement_type="remove",
        quantity=quantity
    )

    db.session.add(movement)
    db.session.commit()

    return jsonify({
        "msg": "Stock retirado",
        "new_quantity": product.quantity
    })

# =========================
# HISTORIAL
# =========================

@app.route("/api/movements", methods=["GET"])
def get_movements():
    movements = Movement.query.all()

    result = []
    for movement in movements:
        result.append({
            "id": movement.id,
            "product_id": movement.product_id,
            "movement_type": movement.movement_type,
            "quantity": movement.quantity,
            "timestamp": movement.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify(result)

# =========================
# INICIALIZACIÓN DB
# =========================

with app.app_context():
    db.create_all()

# =========================
# INICIO
# =========================

if __name__ == "__main__":
    app.run(debug=True)