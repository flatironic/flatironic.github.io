from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class AllHandler(webapp.RequestHandler):
    def get(self):
        self.redirect("https://www.christianmccarthy.com", True)

application = webapp.WSGIApplication([('/.*', AllHandler)])

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()