import { createFolder, createFile } from "./filetree.js";

function setPanelWidth() {
    document.getElementsByClassName("container-left")[0].style.width = "30%";
    document.getElementsByClassName("container-middle")[0].style.width = "46%";
}
setPanelWidth();

document.getElementById("left-panel-button").onclick = (e) => {
    e.stopPropagation()
}

document.getElementById("left-panel-button").onmousedown = (e) => {
    let lPanel = document.getElementsByClassName("container-left")[0];
    let mPanel = document.getElementsByClassName("container-middle")[0];
    if (lPanel.style.display == "none") {
        lPanel.style.display = "block";
        lPanel.style.width = 20 + "%";
        mPanel.style.width = (parseFloat(mPanel.style.width.substring(0, mPanel.style.width.length - 1)) - 20) + "%"
    } else {
        lPanel.style.display = "none";
        let added = parseFloat(lPanel.style.width.substring(0, lPanel.style.width.length - 1))
        mPanel.style.width = (parseFloat(mPanel.style.width.substring(0, mPanel.style.width.length - 1)) + added) + "%"
        lPanel.style.width = "0%";
    }
    e.stopPropagation()
}

document.getElementById("clear-console").onclick = (e) => {
    let console = document.getElementById("console");
    let template = console.getElementsByClassName("console-record")[0].cloneNode(true);
    console.innerHTML = "";
    console.appendChild(template);
}

document.getElementById("clear-console").onmousedown = (e) => {
    e.stopPropagation()
}

document.getElementById("hide-console").onmousedown = (e) => {
    e.stopPropagation()
}

document.getElementById("hide-console").onclick = () => {
    let consol = document.getElementById("console");
    if (consol.style.display == "none") {
        consol.style.display = "block";
        document.getElementById("svg-result").style.height = "48%";
        return
    }
    consol.style.display = "none";
    document.getElementById("svg-result").style.height = "98%";

}

function hookConsole() {
    console.stdlog = console.log;
    console.stderror = console.error;
    console.error = function() {
        console.stdlog.apply(console, arguments)
    }
    console.log = function() {
        let output = document.getElementsByClassName("console-record")[0].cloneNode(true);
        output.style = "display:block;"
        output.getElementsByTagName("p")[0].innerText = Array.from(arguments)
        document.getElementById("console").appendChild(output)
        console.stdlog.apply(console, arguments);
    }
}
//hookConsole();