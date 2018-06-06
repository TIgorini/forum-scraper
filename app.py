from flask import Flask
from pymongo import MongoClient

app = Flask(__name__)

url_for('static/js', filename='index.js')

client = MongoClient()
posts = client.forum_inf.posts
topics = client.forum_inf.topics


@app.route('/')
def index():
    return render_template('index.html')
