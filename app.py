from flask import Flask, render_template, jsonify, request, redirect, session
from flask_session import Session
from cs50 import SQL
import os
import httpx
import json
from datetime import timedelta
from agent import main

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
    if request.method == "POST":
        q = request.json["q"]
        r = await main(q, "grindpa")
        return jsonify({"msg": r})
    return render_template("index.html", page="index")

# if __name__ == "__main__":
#     app.run(port=5000, debug=True, use_reloader=True, reloader_type="watchdog")