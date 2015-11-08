#stab

***stab*** stands for **S**tatic **T**idy **A**ngular **B**log

---

## What is stab?
***stab*** is a blogging system that allows you to blog off-line, generate your content and publish it onto static web hosts that do not support server-side scripting. It is therefore **ideal** for *GitHub pages*.

## What is the purpose?
I wanted to start blogging on GitHub pages and found myself a little lost with the possibilities. Also, Jekyll was not really an option for me as it uses Ruby and is a big unflexible thing. ***Stab*** on the other hand has no special requirements (try run ruby gems under Windows :p) and offers a simple and feature-rich yet modern blogging platform. All requirements are totally cross-platform and thanks to npm no pain in the butt to install.

## How does it work?
The workflow can be described as follows:
* You start blogging by creating Html-fragments with meta-tags that specify the basics like the article's title, last modification, author etc.
	* You can add arbitrary meta-tags to your articles and override the default behavior of the rendering directive to fit ***stab*** to your needs.
* Once you save your content, *watch*-tasks will create a **content.json** which contains the meta-information for each article. This json is then retrieved during runtime through the frontend, so that we do not have to load all content and parse it. That way, even with throusands of articles, this json will allow ***stab*** to perform well.
* The frontend takes care of pagination, displaying and categorizing the content (and also some caching).

---

### Under the hood
***stab*** is quite modular using **TypeScript**, a **Grunt**-based build system, **angular** to show the content (**ui-router** for navigation, **ocLazyLoad** for lazy loading and **ui-bootstrap** for styling) and the gorgeous simple blogging template called [Clean Blog](http://startbootstrap.com/template-overviews/clean-blog/).

### Planned features
* #### Sitemap-generation.
	Since ***stab*** uses hashtag-navigation, we may increase the visibility of our content by creating sitemaps of the available content.
* #### Provide content statically
	Because of the hashtag-navigation, we may provide the content using google's recommended escaped-fragment url-scheme. The plan is to create static pages using phantom.js whenever the normal content-generation is going on.