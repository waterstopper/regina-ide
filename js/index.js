var worker;

document.getElementById("startButton").onclick = (e) => {
    // allow only one instance running
    if (worker != null)
        return
    require(["vs/editor/editor.main"], function() {
        monaco.editor.setModelMarkers(window.editor.getModel(), 'owner', [])
    })
    let bodyStyles = window.getComputedStyle(document.body);
    let button = document.getElementById("startButton").getElementsByTagName("i")[0]
    button.style["-webkit-text-fill-color"] = bodyStyles.getPropertyValue('--gray')
    worker = new Worker("js/regina_interpreter.js");
    worker.onmessage = e => {
        switch (e.data.type) {
            case "ready":
                worker.postMessage([window.editor.getValue(), ""])
                break;
            case "finished":
                worker = null
                button.style["-webkit-text-fill-color"] = bodyStyles.getPropertyValue('--green')
                break;
            case "log":
                console.log(e.data.content)
                break;
            case "exception":
                showException(e.data.content)
                break;
            case "debug":
                console.log(e.data.content)
                break;
        }
    }
}

function showException(exception) {
    require(["vs/editor/editor.main"], function() {
        let length;
        let position;
        console.log(exception)
        if (exception.node_1.symbol_1 != "") {
            length = exception.node_1.value_1.length;
            position = exception.node_1.position_1;

        } else {
            length = exception.length_1;
            position = exception.position_1;
        }
        console.log(position, length)
        monaco.editor.setModelMarkers(window.editor.getModel(), 'owner', [{
            message: exception.name == "NotFoundException" ? exception.node_1.value_1 + " not found" :
                (exception.errorMessage_1 == "" ? "ABC" : exception.errorMessage_1),
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: position.second_1 + 1,
            startColumn: position.first_1 + 1,
            endLineNumber: position.second_1 + 1,
            endColumn: position.first_1 + length + 1
        }])
    })

    console.log(exception)
}

document.getElementById("haltButton").onclick = () => {
    if (worker != null) {
        console.log("Stopped");
        worker.terminate()
        let bodyStyles = window.getComputedStyle(document.body);
        let button = document.getElementById("startButton").getElementsByTagName("i")[0]
        button.style["-webkit-text-fill-color"] = bodyStyles.getPropertyValue('--green')
        worker = null
    }
}


function setPanelWidth() {
    document.getElementsByClassName("container__left")[0].style.width = "30%";
    document.getElementsByClassName("container__middle")[0].style.width = "46%";
}
setPanelWidth();

document.getElementById("leftPanelButton").onclick = (e) => {
    e.stopPropagation()
}

document.getElementById("leftPanelButton").onmousedown = (e) => {
    let lPanel = document.getElementsByClassName("container__left")[0];
    let mPanel = document.getElementsByClassName("container__middle")[0];
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

/**
fun main() {
    a= 0
    while(a < 5) {
        log(a)
        a = a + 1
    }
}
     */

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
hookConsole();

class Tab {
    constructor(name) {
        this.name = name
        this.create()
    }
    state = null
    model = null
    htmlElement = null
    create() {
        this.model = window.editor.createModel()
        this.setActive()

        let tabs = document.getElementsByClassName("tabs")[0]
        this.htmlElement = tabs.getElementsByClassName("tab")[0].cloneNode(true)
        this.htmlElement.getElementsByTagName("p")[0].innerText = this.name
        tabs.appendChild(this.htmlElement)
    }
    setActive() {
        window.editor.setModel(this.model)
        window.editor.restoreViewState(this.state)
        window.editor.focus()

        this.htmlElement.style.background = getComputedStyle(document.body).getPropertyValue("---bg-color")
    }

    setPassive() {
        this.state = window.editor.saveViewState()
        this.htmlElement.style.background = getComputedStyle(document.body).getPropertyValue("--gray")
    }
}

function createTab(name) {
    let tab = new Tab(name)
}
//console.log(await (await fetch('copied.rgn')).text())
// .then(data => {
//     console.log(data.text())
// })
// .catch(error => console.error(error))

// document.getElementsByClassName("menu-button")[2].onclick = save

// document.getElementsByClassName("tab")[0].onclick = switchModel
// document.getElementsByClassName("tab")[1].onclick = () => createTab("d.pg")
// document.getElementsByClassName("close")[0].onclick = console.log("de")