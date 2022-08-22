var toggler = document.getElementsByClassName("caret");
//console.log(toggler);
let i;

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




function createFile(fileName = "myFile.rgn", folderName = "") {
    let tree = getTree(folderName)
    let file = document.createElement("ul")
    file.textContent = fileName
    tree.appendChild(file);
    file.style.marginLeft = '-20px'
    file.style.padding = '0px'
}

function getByInnerHtml(collection, searched) {
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].innerHTML == searched)
            return collection[i]
    }
}

function getTree(folderName) {
    return folderName == "" ?
        document.getElementById("filetree") :
        (getByInnerHtml(document.getElementsByClassName("caret"), folderName)
            .parentNode.getElementsByClassName("nested")[0])
}

function createFolder(name = "myFolder", folderName = "") {
    let tree = getTree(folderName)
    let folder = document.createElement("li")
    let caret = document.createElement("span")
    caret.className = "caret"
    caret.textContent = name
    folder.appendChild(caret)

    let ul = document.createElement("ul")
    ul.className = "nested"
    folder.appendChild(ul)

    tree.appendChild(folder)
    caret.addEventListener("click", function() {
        this.parentElement.querySelector(".nested").classList.toggle("active");
        this.classList.toggle("caret-down");
    });
}

// createFile()
// createFile("EFfde", "std")
// createFolder()
// createFile("er", "myFolder")
// createFolder("myFold")
// createFile("er", "myFold")

createTree()