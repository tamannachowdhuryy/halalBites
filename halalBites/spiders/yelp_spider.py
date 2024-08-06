import scrapy

class YelpSpider(scrapy.Spider):
    name = 'yelp_spider'  # Unique name for this spider
    allowed_domains = ['yelp.com']
    start_urls = ['https://www.yelp.com/']

    def parse(self, response):
        # Example parsing logic
        for business in response.css('div.biz-listing-large'):
            yield {
                'name': business.css('a.biz-name::text').get(),
                'rating': business.css('div.i-stars::attr(title)').get(),
                'address': business.css('address::text').get(),
            }

        # Follow pagination links
        next_page = response.css('a.next::attr(href)').get()
        if next_page is not None:
            yield response.follow(next_page, self.parse)
