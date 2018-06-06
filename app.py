from flask import Flask
from flask import render_template
from flask import url_for
from flask import jsonify
from pymongo import MongoClient

app = Flask(__name__)
app.config.from_pyfile('config.py')


client = MongoClient()
posts = client.forum_inf.posts
topics = client.forum_inf.topics


@app.route('/')
def index():
    return render_template('index.html', topic='{{topic}}')


@app.route('/get_topics')
def get_topics():
    data = []
    for topic in topics.find():
        data.append(topic['name'])
    return jsonify(data)


@app.route('/get_posts/<topic>')
def get_posts(topic):
    data = {}
    data['topic'] = topic

    tposts = posts.find({'topic': topic})
    authors = []
    data['posts'] = []
    for post in tposts:
        data['posts'].append({
            'author': post['author'],
            'datetime': post['datetime'],
            'text': post['text'] 
        })
        if post['author'] not in authors:
            authors.append(post['author'])

    data['authors'] = []
    for auth in authors:
        data['authors'].append([auth, posts.find({'topic': topic, 'author': auth}).count()])
    return jsonify(data)
