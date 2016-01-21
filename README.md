#### Open Graph

The Open Graph protocol can be used to identify meta data on a website.
This is commonly used on social media sites and messaging applications
such as slack to show rich embedded objects from url links. To read
more about Open Graph see here: [opg.me](http://ogp.me).

Common meta data are things such as title, type, image and url.

###### Installation

    npm install --save open-graph-collector

##### Usage

    var openGraph = require('open-graph-collector');

    openGraph('http://www.neogaf.com/forum/', (meta) => {
      console.log(meta);
    });

In the result that there is an error or no open graph found on the provided
url then an empty json literal object will be returned in the callback.

###### Response

A typical and basic response will look like this:

  {
    site_name: 'NeoGAF',
    type: 'website',
    image: 'http://www.neogaf.com/forum/images/neogaf2/icon_social.png',
    title: 'NeoGAF',
    url: 'http://www.neogaf.com/'
  }

However, object could also be embedded, depending on how much information
the html offers.  An embedded object may look like:

  {
    site_name: 'NeoGAF',
    type: 'website',
    image: {
      url: 'http://www.neogaf.com/forum/images/neogaf2/icon_social.png',
      width: '300',
      height: '300',
    },
    title: 'NeoGAF',
    url: 'http://www.neogaf.com/',
  }

