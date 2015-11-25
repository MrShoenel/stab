#stab

***stab*** stands for **S**tatic **T**idy **A**ngular **B**log.

The current version is ***1.1.1***. Please refer to the [Changelog with milestones](/MrShoenel/stab/wiki/changelog) for details.



---

## What is stab?
***stab*** is a blogging system that allows you to blog off-line, generate your content and publish it onto static web hosts that do not support server-side scripting. It is therefore **ideal** for ***GitHub pages***.

## What is the purpose?
I wanted to start blogging on GitHub pages and found myself a little lost with the possibilities. Also, Jekyll was not really an option for me as it uses Ruby and is a big unflexible thing. ***Stab*** on the other hand has no special requirements (try run ruby gems under Windows :p) and offers a simple and feature-rich yet modern blogging platform. All requirements are totally cross-platform and thanks to npm no pain in the butt to install.

## How does it work?
The workflow can be described as follows:
* You start blogging by creating Html-fragments with meta-tags that specify the basics like the article's title, last modification, author etc. There is a fully-fledged template that you may use to create a new article.
	* You can add arbitrary meta-tags to your articles and override the default behavior of the rendering directive to fit ***stab*** to your needs.
* Once you save your content, *watch*-tasks will create a **content.json** which contains the meta-information for each article. This json is then retrieved during runtime through the frontend, so that we do not have to load all content and parse it. That way, even with throusands of articles, this json will allow ***stab*** to perform well.
* The frontend takes care of pagination, displaying and categorizing the content (and also some caching).

---

### Under the hood
***stab*** is quite modular using **TypeScript**, a **Grunt**-based build system, **angular** to show the content (**ui-router** for navigation, **ocLazyLoad** for lazy loading and **ui-bootstrap** for styling) and the gorgeous simple blogging template called [Clean Blog](http://startbootstrap.com/template-overviews/clean-blog/).

---

# stab: How-tos and features
Stab was implemented with a small but concise set of features that you should know about.

## Features
Stab is centered around the two most important features of a blog: *Showing articles* and *organizing them*. While the former is rather straight forward, the latter is a larger concept, as with many different kinds of users there come many different desired concepts. That's why this part was implemented in a flexible way.

In short that means the following:
* Stab is highly modularized, it uses states and views which are build on components such as directives (which you may alter).
* The set of states currently comprises
	* ***Home*** which has an overridable default view which displays the latest articles chronologically by default
		* [#!**/**](#)
	* ***Read*** to display an article with all its meta-information being applied to the document under the hood.
		* [#!**/read**/**&lt;article-url-name&gt;**](#)
	* ***List*** to show arbitrary lists of articles. This state may also use meta-data.
		* [#!**/list**/**&lt;list-type&gt;**&#91;/**&lt;page-index&gt;**&#93;](#)
	* ***Search*** to search through all the details of all meta-articles.
		* [#!**/search**&#91;/**&lt;page-index&gt;**&#93;?**q=&lt;query&gt;**](#)
* All kinds of lists of articles use a configurable ***pagination***, even the search.
* Stab supports ***markdown*** through a separate markdown-template (which you may extend of course). Write your articles in Html or markdown.
	* If using Html, you may as well use ***angular-flavored*** Html with directives, models etc.
* ***NEW*** in version *1.1.0*:
	* Fragments: Add custom fragments to your content or template. This feature allows you to add arbitrary content using *Html* **or** *markdown* to your blog. The **new directive** *&lt;app-fragment id=":ID:" /&gt;* accepts an ID and embeds whatever content you desire: (angular-flavored) Html, JavaScript, Css or just plain text! Actually, the *header* and *footer* have been refatored to be fragments now and a very simple *breadcrumb*-fragments has been added!
	


## How-to: Create your own blog with stab
* Clone the latest version from [https://github.com/MrShoenel/stab](https://github.com/MrShoenel/stab) into a local repository which then become your blog.
* Create articles by making a copy of the default ***Html- or markdown***-template [./resource/content/default.html](#) / [./resource/content/default-md.md](#)
	* The file name of the copy is not really important. I try to stick with something close to the URL-name. Avoid spaces and special chars.
	* The [grunt-markdown](https://github.com/treasonx/grunt-markdown) plug-in which we use supports also custom templates. It will pick up the file under [./resource/content/default-md.template.jst](#) for that purpose if you wish to edit it.
* Fill in all meta-tags. You must fill out the three required tags *lastmodified*, *title* and *url-name*, all other tags are optional. If you make manual modifications to ***stab*** then you might as well add more user-defined tags.
	* You can set *lastmodified* to *auto* to have the last modification date set to the file's last modification date.
* You may add images to your articles under [./resource/images/](#) and use the meta-tag *bgimage* to refer to them.

## How-to: Publish your blog
The first step is to build your blog and its content. When you later only edit the contents but not **stab** per se, it's enough to only build that.
* To build everything, run ***[./node_modules/.bin/grunt default](#)*** (where the default-parameter is optional)
	* Now upload everything from the directory ***[./public/](#)*** to your web-server's document-root, that's it!
* To only build the content, run ***[./node_modules/.bin/grunt make-content](#)***
	* If you only want to re-upload or overwrite the content, just replace the folder ***[./public/content/](#)*** on your webserver. Done!

There are more useful tasks you can run (such as *watch-content*); please refer to the tasks-section in this readme.

---

### Tasks and options
There is a bunch of useful tasks to aid the development or creation of content which you may run. The following table gives an overview.

|task name |	description	|	options	|	option desc	| comments |
|---	|---	|---	|---	|---	|
| ___default___	| The default task is run if you do not specify any task explicitly. It runs the complete build process: Clean, transform, process, build, copy. Everything. | - | - | You may use this task in case of doubt. Usually you want to use a more straightforward task though. |
| ___make-content___ | Does what it says: It builds all your articles from the content-directory. Creates the *content.json* which is picked up by the frontend. | - | - | - |
| ___watch-content___ | Watches for changes in the content-directory (add/remove/change etc.) and re-builds your content whenever necessary. Also, it comes with an ***http-server*** in the background that serves ***stab*** from port 80 so you can immediately review your content. | ___--port=&lt;int&gt;___ | Override the default port (80) where you can access the current build. | This is the most convenient task for when authoring content. |
| ___watch-all___ | Used during development. Employs concurrent watches on all resources and rebuilds them if necessary. Also copies over new files if required. Also watches content. | ___--port=&lt;int&gt;___ | *same as above* |The watch task is ideal during development as it keeps track of files and takes necessary actions if they change.|
| ___exec:changelog___ | Creates a nice, markdown-flavored changelog from all commits. | - | - | Is also run as part of the default-task. |

---

### Planned features
* **Sitemap-generation.**
	
	Since ***stab*** uses hashtag-navigation, we may increase the visibility of our content by creating sitemaps of the available content.
* **Provide content statically**
	
	Because of the hashtag-navigation, we may provide the content using google's recommended escaped-fragment url-scheme. The plan is to create static pages using phantom.js whenever the normal content-generation is going on.
