<!-- In the markdown template we wrap our meta-tags in this
		div so they can be cleanly separated from the actual content. -->
<div id="meta">
	<!--
	The ID is the only required meta-information for a fragment.
	It can be an arbitrary string and must be unique across all
	fragments.
	-->
	<meta name="id" content="unique-fragment-id" />
	
	
	
	<!-- #### Optional tags below  -->
	
	<!--
		The mime-type (if supplied) can be 'html', 'css', 'js' or 'text'.
		This influences how the content will be trusted.
	-->
	<meta name="mime" content="html" />
	
	<!--
		If this tag is present, the whole fragment will be embedded into
		the content.json rather than loading it at runtime with a separate
		request. You may do this for very tiny fragments.
	-->
	<meta name="embed" />
</div>

Instead of the &lt;fragment/&gt;-tag we just start writing our markdown here :)
