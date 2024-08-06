import scrapy
from bs4 import BeautifulSoup
class YelpTestSpider(scrapy.Spider):
    name = 'yelp'  # Unique name for this spider

    start_urls = ['https://www.yelp.com/search?find_desc=Halal+Restaurant&find_loc=New+York%2C+NY']

    def parse(self, response):
        # Example parsing logic
        restrant_name = response.css('y-css-12ly5yx').extract()
        restrant_review = response.css('y-css-jf9frv').extract()

        for item in zip(restrant_name, restrant_review):
            all_items = {
                'restrant_name': BeautifulSoup(item[0]).text,
                'restrant_review': BeautifulSoup(item[1]).text
            }

            yield all_items
