var toggler = document.getElementsByClassName("caret");
//console.log(toggler);
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
        .then(result => result.text()).then(text => JSON.parse(text)).then(layout => {
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


function createFile(fileName = "myFile.rgn", folderName = "") {
    let tree = getTree(folderName)
    let file = document.createElement("ul")
    let name = document.createElement("span")
    name.textContent = fileName
    name.className = "file-tree-element"
    file.appendChild(name);
    tree.appendChild(file);
    file.style.marginLeft = '-20px'
    file.style.padding = '0px'
    name.onclick = (e) => addFocusFunction(name)
    addHoverFunction(name);
    name.ondblclick = (e) => {
        console.log("open " + name.innerText)
    }
}

function getByInnerHtml(collection, searched) {
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].innerHTML == searched)
            return collection[i]
    }
}

function getTree(folderName) {
    return folderName == "" ?
        document.getElementById("file-tree") :
        (getByInnerHtml(document.getElementsByClassName("caret"), folderName)
            .parentNode.getElementsByClassName("nested")[0])
}

function createFolder(name = "myFolder", folderName = "") {
    let tree = getTree(folderName)
    let folder = document.createElement("li")
    let caret = document.createElement("span")
    caret.className = "caret file-tree-element"
    caret.textContent = name
    folder.appendChild(caret)

    let ul = document.createElement("ul")
    ul.className = "nested"
    folder.appendChild(ul)

    tree.appendChild(folder)
    caret.addEventListener("click", function() {
        this.parentElement.querySelector(".nested").classList.toggle("active");
        this.classList.toggle("caret-down");
        addFocusFunction(caret)
    });
    addHoverFunction(caret);
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

export { createFolder, createFile };