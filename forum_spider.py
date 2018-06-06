import scrapy

from pymongo import MongoClient


client = MongoClient()
posts = client.forum_inf.posts
topics = client.forum_inf.topics


class ForumSpider(scrapy.Spider):
    name = 'forumspider'
    start_urls = ['http://polycount.com/categories/general-discussion']

    def parse(self, response):
        # follow links to pages
        for href in response.css('a.EntryLink::attr(href)'):
            yield response.follow(href, self.parse_post)

        yield response.follow(response.css('a.Next::attr(href)').extract_first(), self.parse)

    def parse_post(self, response):
        topic = response.css('h1::text').extract_first()
        if topics.find({'name': topic}).count() == 0:
            topics.insert_one({'name': topic})

        for post in response.css('.Item-Inner'):
            post = {
                'topic': topic,
                'author': post.css('a.Username::text').extract_first(),
                'datetime': post.css('time::attr(datetime)').extract_first(),
                'text': ' '.join(post.css('.Message').css('::text').extract()),
            }
            if posts.find({'datetime': post['datetime'], 'topic': post['topic']}).count() == 0:
                posts.insert_one(post)
            yield post

        yield response.follow(response.css('a.Next::attr(href)').extract_first(), self.parse_post)

