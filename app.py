from flask import Flask, render_template, jsonify, request, redirect, session
from flask_session import Session
from cs50 import SQL
import os
import httpx
import json
from datetime import timedelta
from agent import main
from random_functions import check_password

db = SQL("sqlite:///lmt.db")

app = Flask(__name__)
app.config["SESSION_TYPE"] = "filesystem"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=30)
Session(app)

@app.before_request
def static_session():
    session.permanent = True

@app.route("/", methods=["GET", "POST"])
async def index():
    if not session.get("username") and not session.get("password"):
        return redirect("/signup")
    if request.method == "POST":
        q = request.json["q"]
        r = await main(q, "grindpa")
        return jsonify({"msg": r})
    return render_template("index.html", page="index")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        first_name = request.form.get("first_name")
        surname = request.form.get("surname")
        e_mail = request.form.get("e_mail", None)

        if session.get("validity") == False:
            return redirect("/signup_error")

        userData = db.execute("SELECT * FROM userData WHERE username = ?", username)
        for data in userData:
            if data["username"] == username and data["password"] == password:
                return jsonify({"msg": "This account already exists, try loging in."})
            
        session["username"] = username
        session["password"] = password
        db.execute(
            "INSERT INTO userData(name, surname, username, password, e_mail, role) VALUES(?, ?, ?, ?, ?, ?)",
            first_name, surname, username, password, e_mail, "user"
            )
        return redirect("/login")
    return render_template("signup.html", page="signup")

@app.route("/signup_error")
def signup_error():
    return render_template("signupError.html", page="signup_error")

@app.route("/check_password")
def password_checker():
    password = request.args.get("q")
    result = check_password(password)
    if result == "valid password":
        session["validity"] = True
        return jsonify({"msg": result, "session": session.get("validity")})
    else:
        session["validity"] = False
        return jsonify({"msg": result, "session": session.get("validity")})
    
@app.route("/login")
def login():
    return render_template("login.html", page="login")
            
        

# if __name__ == "__main__":
#     app.run(port=5000, debug=True, use_reloader=True, reloader_type="watchdog")