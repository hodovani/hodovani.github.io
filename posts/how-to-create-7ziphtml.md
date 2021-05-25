# [DRAFT]

Titles:
Clean Way on How to Unzip Your Archive with JavaScript in Browser


Cover image:
[backpack]



### Tl;DR

You want to go to [unzip](https://unzip.mpds.io) and play with it. You can use [this](https://unzip.mpds.io/?archiveUrl=https://mpds.io/calculations/NaCl_225_cF8.7z) example if you don't have a 7zip archive.

here is a short animation that shows you how to use this tool.
[PUT GIF HERE]

I'll show you how to build this tool.

### Intro

We would answer some questions first.

#### What is 7zip.html?

It is a tool to open archives in your browser. Your data wouldn't leave your machine.

#### Why do we need this?

Sometimes you just need to have a look at a specific file in your archive and you don't want to install additional software to do this.

#### How would we do this?

We would use a WebAssembly port of a tool. We would create a wrapper around it to make it easier for a user.

### Core

We would use libarchivejs to look inside archive. Let's try the code from their example.

We need to setup [libarchivejs](https://github.com/nika-begiashvili/libarchivejs) to run in browser.

1. Run libarchivejs in browser

Let us start with webpack environment that would pack everything for us. You can see details in webpack folder [here](https://github.com/mpds-io/7zip.html/tree/master/webpack).

We need to add an input to start working with files. 

```html
<input id="fileInput" type="file" />
```

Then we need to add libarchivejs and event listener.

```javascript
import {
    Archive
} from 'libarchive.js/main.js';

Archive.init({
    workerUrl: 'public/worker-bundle.js',
});

const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', async (e) => {
    const file = e.currentTarget.files[0];
    const archive = await Archive.open(file);
    let obj = await archive.extractFiles();

    console.log(obj);
});
```

As a result we would see similar output:

```
{
    ".gitignore": {File},
    "addon": {
        "addon.py": {File},
        "addon.xml": {File}
    },
    "README.md": {File}
}
```

Now we want to add functions and components to show folder tree and text file content.

We would have two columns element. It would show us folder tree on the left side and file conent on the right side.

```html
<div class="twoColumn">
  <div class="column">
    <ul id="treeView"><i>No archive chosen</i></ul>
  </div>
  <div class="column">
    <textarea id="fileOutput"></textarea>
  </div>
</div>
```

Last thing before we go back to JavaScript code is to add CSS.

```
body {
  font-size: 16px;
  font-family: Courier, sans-serif;
  margin-left: auto;
  margin-right: auto;
  background-color: #f6f6f6;
  width: 800px;
  height: 100%;
}

.twoColumn {
  margin-top: 3em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.column {
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  margin-right: 5px;
  padding: 5px;
  background-color: #d3d0ba;
}

/* Hide the nested list */
.nested {
  display: none;
}

/* Show the nested list when the user clicks on the caret/arrow (with JavaScript) */
.active {
  display: block;
}
```

Now we are ready to add functions to show folder tree.

We would add more const first.

```
const textarea = document.getElementById('fileOutput');
const fileInput = document.getElementById('fileInput');
const treeView = document.getElementById('treeView');
```

We need to add some helper functions before our next step.

We add uuid. We would use it to give tree nodes uniq ids.

```
import {
    v4 as uuidv4
} from 'uuid';
```

And we add `isASCII` to filter binary files.

```
function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}
```

Then we would work on a `walk` function that would go through the tree recursive and create html elements.

We receive node and check if it is file or folder. We add element to html in both cases. If it is file then we add and event listnere to open its content on the right side panel. If it is a folder then we add event listener to show/hide its content. Then we give a folder to a walk function to step into it and check its files. And we have nothing that we show `Empty folder`. 

```JavaScript
function walk({
    node,
    liId,
    name
}) {
    const root = document.getElementById(liId);
    if (!(node instanceof File)) {
        const newUlId = uuidv4();
        const newUl = document.createElement('ul');
        newUl.classList.add('nested');
        newUl.id = newUlId;
        const newLi = document.createElement('li');
        root.appendChild(newLi);
        newLi.classList.add('folder');
        newLi.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            newLi.childNodes.forEach(c => {
                if (c.classList.contains('nested')) {
                    c.classList.toggle("active");
                }
            });
        });

        const span = document.createElement('span');
        span.innerText = name;
        newLi.appendChild(span);
        newLi.appendChild(newUl);
        const keys = Object.keys(node);
        if (keys.length > 0) {
            keys.forEach((key) => {
                walk({
                    node: node[key],
                    liId: newUlId,
                    name: key
                });
            });
        } else {
            const span = document.createElement('span');
            span.innerHTML = '<i>Empty folder</i>';
            root.appendChild(span);
        }
    } else {
        const li = document.createElement('li');
        li.innerText = node.name;
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            const reader = new FileReader();
            reader.onload = function(event) {
                if (isASCII(event.target.result)){
                    textarea.textContent = event.target.result;    
                } else {
                    textarea.textContent = "Sorry, we cannot display binary files";
                }
            };
            reader.readAsText(node);
        });
        root.appendChild(li);
    }
}
```

Video should be like a presentation. Not live codding session.

CTA: Tweet to say thanks
