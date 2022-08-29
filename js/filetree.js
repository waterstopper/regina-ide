var toggler = document.getElementsByClassName("caret");
let i;

function nextBreakpoint() {
    console.log("next")
}

for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
        this.parentElement.querySelector(".nested").classList.toggle("active");
        this.classList.toggle("caret-down");
    });
}

function createTree() {
    fetch("https://alex5041.github.io/reginafiles/layout.json")
        .then(function(response) {
            if (!response.ok)
                console.log("Could not load")
            else return response.text();
        }).then(text => JSON.parse(text)).then(layout => {
            let folders = layout.folders;
            let files = layout.files;
            folders.forEach(folder => {
                createFolder(folder.name, folder.parent == null ? "" : folder.parent)
            });
            files.forEach(file => {
                createFile(file.name, file.parent == null ? "" : file.parent)
            });
        })
}

var focusedFile = null;

function createLeaf(parent) {
    let leaf = document.createElement("ul")
    let text = document.createElement("span")
    text.classList.add("file-tree-element");

    leaf.appendChild(text);
    parent.appendChild(leaf);
    return text;
}

function createFile(
    fileName = "myFile.rgn",
    folderName = "") {
    let tree = getTree(folderName)
    let file = createLeaf(tree);
    tree.appendChild(file);
    file.textContent = fileName
    file.onclick = (e) => addFocusFunction(file)
    addHoverFunction(file);
    file.ondblclick = (e) => {
        console.log("open " + file.innerText)
    }
    if (folderName != "") {
        file.style.marginLeft = '-20px'
    }
    file.style.padding = '0px'
}

function createParent(parent) {
    let par = document.createElement("li");
    let caret = document.createElement("span");
    caret.classList.add("caret", "file-tree-element");
    let ul = document.createElement("ul")
    ul.className = "nested";

    par.appendChild(caret);
    par.appendChild(ul);
    parent.appendChild(par);

    caret.addEventListener("click", function() {
        this.parentElement.querySelector(".nested").classList.toggle("active");
        this.classList.toggle("caret-down");
    });
    return caret
}

function createFolder(name = "myFolder",
    folderName = "",
    parentElement = document.getElementById("file-tree")) {
    let tree = getTree(folderName)
    let folder = document.createElement("li")
    let caret = document.createElement("span")
    caret.className = "caret"
    folder.appendChild(caret)

    let ul = document.createElement("ul")
    ul.className = "nested"
    folder.appendChild(ul)

    addTextToTreeElement(name, caret)
    tree.appendChild(folder)
    caret.addEventListener("click", function() {
        this.parentElement.querySelector(".nested").classList.toggle("active");
        this.classList.toggle("caret-down");
        addFocusFunction(caret)
    });
    // addHoverFunction(caret);
}


function addTextToTreeElement(text, element) {
    if (text.includes(":")) {
        element.textContent = ":"
        let coloredName = document.createElement("span")
        coloredName.textContent = text.split(":")[0]
        coloredName.style.color = "var(--ident-color)"

        let remainder = document.createElement("span")
        remainder.textContent = text.substring(text.indexOf(":") + 1)
        element.appendChild(coloredName)
        element.appendChild(remainder)
        element.insertBefore(element.childNodes[0], remainder)
    } else {
        element.textContent = text
        element.classList.add("file-tree-element")
        element.onclick = (e) => addFocusFunction(element)
        addHoverFunction(element);
        element.ondblclick = (e) => {
            console.log("open " + element.innerText)
        }
    }
}

function getByInnerHtml(collection, searched) {
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].innerHTML == searched)
            return collection[i]
    }
}

function getTree(folderName) {
    let parentElement = document.getElementById("file-tree");
    return folderName == "" ?
        parentElement :
        (getByInnerHtml(parentElement.getElementsByClassName("caret"), folderName)
            .parentNode.getElementsByClassName("nested")[0])
}


function addHoverFunction(element) {
    element.onmouseenter = () => {
        if (element != focusedFile) {
            element.style.backgroundColor = "var(--light-gray)"
            element.style.color = "var(--bg-color)"
        }
    }
    element.onmouseleave = () => {
        if (element != focusedFile) {
            toDefaultStyle(element)
        }
    }
}

function addFocusFunction(element) {
    if (focusedFile != null)
        toDefaultStyle(focusedFile)
    focusedFile = element;
    element.style.backgroundColor = "var(--middle-color)"
    element.style.color = "var(--bg-color)"
}

function toDefaultStyle(element) {
    element.style.backgroundColor = "var(--bg-color)"
    element.style.color = "var(--main-color)"
}

createTree()

export { createLeaf, createParent };