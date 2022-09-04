import startExecution from "./execution.js";
import {
    nextBreakpoint,
    previousBreakpoint,
    toCaretBreakpoint,
} from "./debug.js";
import { addTreeElement, deleteFile } from "./filetree.js";

window.tabs = {};

let fileMenu = document
    .getElementById("file-tree-menu")
    .getElementsByTagName("p");

fileMenu[0].onclick = () => addElement(false);
fileMenu[1].onclick = () => addElement(true);

function addElement(isFolder) {
    if (window.currentFile == null){
        addTreeElement(document.getElementById("file-tree"), isFolder, "");
        return
    }
    if (
        window.currentFile.getAttribute("lib") != null &&
        (window.currentFile.parentElement.parentElement !=
            document.getElementById("file-tree") ||
            window.currentFile.parentElement.tagName == "LI")
    ) {
        const span = document.getElementById("add-library-folders");
        span.style.display = "block";
        setTimeout(() => {
            span.style.display = "none";
        }, 1500);
    }
    else {
        if (window.currentFile.parentElement.tagName == "LI") {
            let nested =
                window.currentFile.parentElement.getElementsByClassName(
                    "nested"
                )[0];
            nested.classList.add("active");
            addTreeElement(nested, isFolder, window.currentFile.innerText);
        } else
            addTreeElement(
                window.currentFile.parentElement.parentElement,
                isFolder,
                window.currentFile.innerText
            );
    }
}

fileMenu[2].onclick = () => {
    if (window.currentFile == null) return;
    if (window.currentFile.getAttribute("lib") != null) {
        const span = document.getElementById("delete-library-files");
        span.style.display = "block";
        setTimeout(() => {
            span.style.display = "none";
        }, 1500);
        return;
    }
    let tab = window.tabs[window.currentFile.getAttribute("path")];
    if (tab != null && window.currentFile.getAttribute("lib") == null);
    delete window.tabs[window.currentFile.getAttribute("path")];
    let path = window.currentFile.getAttribute("path");
    deleteFile(path.split("/"));
    window.currentFile.parentElement.remove();
};

document.getElementById("show-settings").onclick = (e) => {
    document.getElementById("debug-panel").style.display = "none";
    document.getElementById("settings-panel").style.display = "block";
    e.stopPropagation();
};

document.getElementById("show-debug").onclick = (e) => {
    document.getElementById("settings-panel").style.display = "none";
    document.getElementById("debug-panel").style.display = "block";
    e.stopPropagation();
};

document.getElementById("show-settings").onmousedown = () =>  e.stopPropagation();
document.getElementById("show-debug").onmousedown = (e) => e.stopPropagation();
document.getElementById("left-panel-button").onclick = (e) => e.stopPropagation();
document.getElementById("clear-console").onmousedown = (e) => e.stopPropagation();
document.getElementById("hide-console").onmousedown = (e) => e.stopPropagation();

let debugArrows = document
.getElementById("debug-button-panel")
.getElementsByTagName("button");

debugArrows[0].onclick = () => previousBreakpoint();
debugArrows[1].onclick = () => nextBreakpoint();
debugArrows[2].onclick = () => toCaretBreakpoint();

document.getElementById("start-button").onclick = () => startExecution(false);
document.getElementById("debug-button").onclick = () => startExecution(true);

oncontextmenu = (event) => {
    let fileMenu = document.getElementById("file-tree-menu");
    fileMenu.style.display = "none";
    if (mouseInTree) {
        event.preventDefault();
        fileMenu.style.left = event.pageX + "px";
        fileMenu.style.top = event.pageY + "px";
        fileMenu.style.display = "block";
    }
};

onclick = () => {
    let fileMenu = document.getElementById("file-tree-menu");
    fileMenu.style.display = "none";
};

var mouseInTree = false;

let fileTree = document.getElementById("file-tree");
fileTree.onmouseenter = () => mouseInTree = true;

fileTree.onmouseleave = () => mouseInTree = false;

function setPanelWidth() {
    document.getElementsByClassName("container-left")[0].style.width = "30%";
    document.getElementsByClassName("container-middle")[0].style.width = "46%";
}

setPanelWidth();

document.getElementById("left-panel-button").onmousedown = (e) => {
    let lPanel = document.getElementsByClassName("container-left")[0];
    let mPanel = document.getElementsByClassName("container-middle")[0];
    if (lPanel.style.display == "none") {
        lPanel.style.display = "block";
        lPanel.style.width = 20 + "%";
        mPanel.style.width =
            parseFloat(
                mPanel.style.width.substring(0, mPanel.style.width.length - 1)
            ) -
            20 +
            "%";
    } else {
        lPanel.style.display = "none";
        let added = parseFloat(
            lPanel.style.width.substring(0, lPanel.style.width.length - 1)
        );
        mPanel.style.width =
            parseFloat(
                mPanel.style.width.substring(0, mPanel.style.width.length - 1)
            ) +
            added +
            "%";
        lPanel.style.width = "0%";
    }
    e.stopPropagation();
};

document.getElementById("clear-console").onclick = (e) => {
    let console = document.getElementById("console");
    let template = console
        .getElementsByClassName("console-record")[0]
        .cloneNode(true);
    console.innerHTML = "";
    console.appendChild(template);
};

document.getElementById("hide-console").onclick = () => {
    let upArrow = document
        .getElementById("hide-console")
        .getElementsByClassName("fa-arrow-up")[0];
    let downArrow = document
        .getElementById("hide-console")
        .getElementsByClassName("fa-arrow-down")[0];
    let consoleOutput = document.getElementById("console");
    if (consoleOutput.style.display == "none") {
        consoleOutput.style.display = "block";
        document.getElementById("svg-result").style.height = "48%";
        upArrow.style.display = "none";
        downArrow.style.display = "inherit";
        return;
    }
    consoleOutput.style.display = "none";
    document.getElementById("svg-result").style.height = "98%";
    upArrow.style.display = "inherit";
    downArrow.style.display = "none";
};

function hookConsole() {
    console.stdlog = console.log;
    console.stderror = console.error;
    console.error = function () {
        console.stdlog.apply(console, arguments);
    };
    console.log = function () {
        let output = document
            .getElementsByClassName("console-record")[0]
            .cloneNode(true);
        output.style = "display:block;";
        output.getElementsByTagName("p")[0].innerText = Array.from(arguments);
        document.getElementById("console").appendChild(output);
        console.stdlog.apply(console, arguments);
    };
}
//hookConsole();
