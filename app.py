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
db_2 = SQL("sqlite:///chat_history.db")

app = Flask(__name__)
app.config["SESSION_TYPE"] = "filesystem"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=30)
Session(app)

@app.before_request
def static_session():
    session.permanent = True

@app.context_processor
def globals():
    if session.get("username"):
        userData = db.execute("SELECT * FROM userData WHERE username = ?", session.get("username"))
        for data in userData:
            if data.get("e_mail"):
                email = data.get("e_mail")
        else:
            email = "None"
    else:
            email = "None"
    return dict(email=email)

@app.route("/", methods=["GET", "POST"])
async def index():
    if not session.get("username") and not session.get("password"):
        return redirect("/signup")
    if request.method == "POST":
        chat = {}
        q = request.json["q"]
        r = await main(f"username: {session.get('username')}\nQuery: {q}", session.get("username"))
        chat[q] = r
        db.execute("INSERT INTO convos(username, chat) VALUES(?, ?)", session.get("username"), json.dumps(chat))
        return jsonify({"msg": r})
    return render_template("index.html", page="index")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        raw_username = request.get_json().get("username")
        password = request.get_json().get("password")
        first_name = request.get_json().get("first_name")
        surname = request.get_json().get("surname")
        e_mail = request.get_json().get("e_mail")
        # convert username to lowercase
        username = raw_username.lower()

        if session.get("validity") == False:
            return redirect("/signup_error")

        userData = db.execute("SELECT * FROM userData WHERE username = ?", username)
        for data in userData:
            if data["username"] == username and data["password"] == password:
                return jsonify({"msg": "This account already exists, try loging in."}), 409
            elif data["username"] == username:
                return jsonify({"msg": f"The username '{username}' is already claimed, try a different one."}), 409
            
        # session["username"] = username
        # session["password"] = password
        db.execute(
            "INSERT INTO userData(name, surname, username, password, e_mail, role) VALUES(?, ?, ?, ?, ?, ?)",
            first_name, surname, username, password, e_mail, "user"
            )
        return jsonify({"msg": "successful sign in"})
    return render_template("signup.html", page="signup")

@app.route("/signup_error")
def signup_error():
    return render_template("signupError.html", page="signup_error")

@app.route("/redirected")
def redirected():
    return render_template("not_found.html", page="not_found")

@app.errorhandler(404)
def error(e):
    return redirect("/redirected")

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
    
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        raw_username = request.get_json().get("username")
        password = request.get_json().get("password")
        # convert username to lowercase
        username = raw_username.lower()

        userData = db.execute("SELECT * FROM userData WHERE username = ?", username)
        for data in userData:
            if data["username"] == username and data["password"] == password:
                session["username"] = username
                session["password"] = password
                # return redirect("/")
                return jsonify({"msg": "login"})
        return jsonify({"msg": "This account does not exist, please check again or sign up."}), 409
    return render_template("login.html", page="login")

@app.route("/logout", methods=["GET", "POST"])
def logout():
    # session.pop("username", None)
    # session.pop("password", None)
    session["username"] = None
    session["password"] = None
    return redirect("/login")

@app.route("/get_chat")
def chat_history():
    chat = db.execute("SELECT chat FROM convos WHERE username = ?", session.get("username"))
    return jsonify({"msg": chat})

@app.route("/clear_memory")
def clear_memory():
    db_2.execute("DELETE FROM checkpoints WHERE thread_id = ?", session.get("username"))
    db_2.execute("DELETE FROM writes WHERE thread_id = ?", session.get("username"))
    return jsonify({"msg": "chatLMT memory successfully cleared"})
        
@app.route("/clear_chat")
def clear_chat():
    db.execute("DELETE FROM convos WHERE username = ?", session.get("username"))
    return jsonify({"msg": "UI chat text successfully cleared"})

# if __name__ == "__main__":
#     app.run(port=5000, debug=True, use_reloader=True, reloader_type="watchdog")
