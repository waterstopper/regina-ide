import { openTab } from "./tab.js";

function getPath(fileElement) {
    let res = [];
    let parent = fileElement.parentElement;
    let filetree = document.getElementById("file-tree");
    while (parent != filetree && parent != filetree.parentElement) {
        res.push(parent.getElementsByTagName("span")[0].innerText);
        parent = parent.parentElement.parentElement;
    }
    return res.reverse().join("/");
}

function createTree() {
    fetch("https://alex5041.github.io/reginafiles/layout.json")
        .then(function (response) {
            return response.text();
        })
        .then((text) => JSON.parse(text))
        .then((layout) => {
            let folders = layout.folders;
            let files = layout.files;
            folders.forEach((folder) => {
                createFolder(
                    folder.name,
                    folder.parent == null ? "" : folder.parent
                );
            });
            files.forEach((file) => {
                let htmlElement = createFile(
                    file.name,
                    file.parent == null ? "" : file.parent
                );
                htmlElement.setAttribute("lib", "true");
            });
        })
        .catch((_) => {
            console.log("Could not load");
        });
    createFolder("example", "");
    createFolder("e", "example");
    createFile("file.rgn", "e");
}

function createLeaf(parent) {
    let leaf = document.createElement("ul");
    let text = document.createElement("span");
    text.classList.add("file-tree-element");

    parent.appendChild(leaf);
    leaf.appendChild(text);
    return text;
}

function createFile(fileName = "myFile.rgn", folderName = "", parent) {
    let tree = parent == null ? getTree(folderName) : parent;
    let file = createLeaf(tree);
    tree.appendChild(file.parentElement);
    file.textContent = fileName;
    file.onclick = () => addFocusFunction(file);
    addHoverFunction(file);

    file.ondblclick = () => {
        console.log("open " + file.innerText);
        openTab(file.getAttribute("path"), file.getAttribute("lib"));
    };
    if (folderName != "") file.parentElement.style.marginLeft = "-20px";

    file.parentElement.style.padding = "0px";
    let path = getPath(file);
    console.log(path);
    file.setAttribute("path", path);
    return file;
}

function createParent(parent) {
    let par = document.createElement("li");
    let caret = document.createElement("span");
    caret.classList.add("caret", "file-tree-element");
    let ul = document.createElement("ul");
    ul.className = "nested";

    par.appendChild(caret);
    par.appendChild(ul);
    parent.appendChild(par);

    caret.addEventListener("click", function () {
        this.parentElement.querySelector(".nested").classList.toggle("active");
        this.classList.toggle("caret-down");
    });
    return caret;
}

function createFolder(name = "myFolder", folderName = "", parent) {
    let tree = parent == null ? getTree(folderName) : parent;
    let folder = createParent(tree);
    folder.innerText = name;
    folder.onclick = () => addFocusFunction(folder);
    return folder
}

function getByInnerHtml(collection, searched) {
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].innerHTML == searched) return collection[i];
    }
}

function getTree(folderName) {
    let parentElement = document.getElementById("file-tree");
    return folderName == ""
        ? parentElement
        : getByInnerHtml(
              parentElement.getElementsByClassName("caret"),
              folderName
          ).parentNode.getElementsByClassName("nested")[0];
}

function addHoverFunction(element) {
    element.onmouseenter = () => {
        if (element != window.currentFile) {
            element.style.backgroundColor = "var(--light-gray)";
        }
    };
    element.onmouseleave = () => {
        if (element != window.currentFile) {
            toDefaultStyle(element);
        }
    };
}

function addFocusFunction(element) {
    if (window.currentFile != null) toDefaultStyle(window.currentFile);
    window.currentFile = element;
    element.style.backgroundColor = "var(--middle-color)";
    element.style.color = "var(--bg-color)";
}

function toDefaultStyle(element) {
    element.style.backgroundColor = "var(--bg-color)";
    element.style.color = "var(--main-color)";
}

function addTreeElement(
    parent = document.getElementById("file-tree"),
    isFolder
) {
    let divInput = document.createElement("div");
    if (parent != document.getElementById("file-tree"))
        divInput.style.marginLeft = "-20px";
    let input = document.createElement("input");
    input.style.borderWidth = "0px";
    input.style.outline = "none";
    input.style.width = "1px";
    input.style.padding = "0px";
    input.style.fontSize = "medium";

    console.log(isFolder);
    divInput.appendChild(input);
    if (!isFolder) {
        let format = document.createElement("span");
        format.innerText = ".rgn";
        divInput.appendChild(format);
    }
    parent.appendChild(divInput);

    input.oninput = () => {
        input.style.width = input.value.length + "ch";
    };
    input.onblur = () => {
        let name = fixFileName(input.value) + (isFolder ? "" : ".rgn");
        let element = isFolder
            ? createFolder(
                  name,
                  parent == document.getElementById("file-tree") ? "" : "a",
                  parent
              )
            : createFile(
                  name,
                  parent == document.getElementById("file-tree") ? "" : "a",
                  parent
              );
        divInput.insertAdjacentElement("afterend", element.parentElement);
        divInput.remove();
    };
    input.focus();
}

function fixFileName(name) {
    let res = name.replace(/[^\w]/gi, "").replace(/^[0-9]+/g, "");
    if (res == "") return "unnamed";
    return res;
}

function checkFileNames(folder) {}

createTree();
addTreeElement();

export { createLeaf, createParent, addTreeElement };
