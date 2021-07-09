# Scripts used in Webflow

HTML dumps are stored in this folder for testing scripts.

Should have the same naming as the corresponding `.js` file.

## Folder structure

```
pages
└── pagename
    ├── pagename.html
    ├── pagename.js
    └── extra.css

```

`pagename.html` - the HTML dump.

`pagename.js` - page spesific JavaScript file to run on the page.

`extra.css` - page spesific CSS. Inserted into webflow in the custom code `<head>` section.

## Add / update HTML dumps

1. Copy `<body>` tag of document from web inspector. Duplicate the template folder and replace existing `<body>`-tag within the document..

2. Add `action="/"` on all `<form>`-tags. This is due to the WF form handling.

3. Replace CDN script tag with path to script in parent folder.

## Serve to Webflow

We use JsDelivr to serve content to Webflow. The CDN url follows the convention

```
https://cdn.jsdelivr.net/gh/user/repo@version/file
```

which in our case is something like

```
https://cdn.jsdelivr.net/gh/lovsang-no/webflow-scripts@v1.0.0/{path}{filename}
```
