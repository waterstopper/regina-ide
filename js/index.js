var worker;
var breakpointsList = [];
var currentBreakpointIndex = 0;

document.getElementById("startButton").onclick = (e) => {
    console.log(breakpointsList)
    breakpointsList = [];
    changeBreakpointColor();
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
                worker.postMessage([addBreakpointsToCode(), ""])
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
                //console.log(e.data.content)
                console.log(convertLinkedHashMap(e.data.content))
                breakpointsList.push(e.data.content)
                break;
            case "breakpoint":
                changeBreakpointColor(parseInt(e.data.content.second_1) + 1)
                break;
        }
    }
}

function showBreakpointInfo() {

}

function changeBreakpointColor(lineNumber) {
    let breakpoints = window.editor.getBreakpoints()
    if (lineNumber == null) {
        breakpoints.forEach(point => {
            point.options.glyphMarginClassName = "fas fa-ban inactive-breakpoint"
        })
    } else
        breakpoints.forEach(point => {
            if (point.range.startLineNumber == lineNumber) {
                point.options.glyphMarginClassName = "fas fa-circle"
            }
        })
    window.editor.setBreakpoints(breakpoints)
}

function convertLinkedHashMap(map, root = true) {
    return traverseMap(map)
        // if (root) {
        //     console.log(map)
        //     return map
        // }
        // if (map == null) {
        //     return map
        // }
        // let res = {}
        // let next = map.head_1
        // if (next == null && map.equality_1 == null) {
        //     res = map
        //     if (typeof res === 'object') {
        //         for (const [key, value] of Object.entries(res)) {
        //             res[key] = convertLinkedHashMap(value, false)
        //         }
        //     }
        //     return res
        // }
        // if (next == null)
        //     return {}
        // let index = 0
        // while (res[next.key_1] == null) {
        //     if (typeof next.key_1 == 'object') {
        //         res["@entry" + index] = {}
        //         res["@entry" + index].key = next.key_1
        //         res["@entry" + index].value = next._value_1
        //         index++
        //         console.log(index)
        //     }
        //     res[next.key_1] = next._value_1
        //     next = next.next_1
        //     if (index == 1)
        //         console.log(next, typeof next.key_1, res)
        // }
        // if (root) {
        //     delete res.queue_1
        // }
        // // if (root) {
        // //     res["@references"].types_1 = convertLinkedHashMap(res["@references"].types_1, false)
        // //     res["@references"].dictionaries_1 = convertLinkedHashMap(res["@references"].dictionaries_1, false)
        // //     res["@references"].arrays_1 = convertLinkedHashMap(res["@references"].arrays_1, false)
        // // }
        // for (const [key, value] of Object.entries(res)) {
        //     res[key] = convertLinkedHashMap(value, false)
        // }
        // return res;
}

function traverseMap(map) {
    // console.log(map)
    // non-map
    if (typeof map != 'object')
        return map
    if (isLinkedHashMap(map))
        map = transformLinkedHashMap(map)
        // normal map
    for (const [key, value] of Object.entries(map)) {
        map[key] = traverseMap(value)
    }
    return map
}

function isLinkedHashMap(map) {
    return map.equality_1 != null &&
        map.map_1 != null &&
        map.isReadOnly_1 != null &&
        map.internalMap_1 != null
}

function transformLinkedHashMap(map) {
    let res = {}
    let entry = map.head_1
    if (entry == null)
        return res
    let firstObject = null
    let index = 0
    while (res[entry.key_1] == null && entry.key_1 != firstObject) {
        if (typeof entry.key_1 == 'object') {
            if (firstObject == null)
                firstObject = entry.key_1
            res["@entry_" + index] = {}
            res["@entry_" + index].key = entry.key_1
            res["@entry_" + index].value = entry._value_1
            index++
        } else
            res[entry.key_1] = entry._value_1
        entry = entry.next_1
    }
    return res
}


function addBreakpointsToCode() {
    let code = window.editor.getValue().split("\n")
    let i = 0;
    let breakpoints = window.editor.getBreakpoints()
    breakpoints.sort((a, b) => parseInt(a.range.startLineNumber) - parseInt(b.range.startLineNumber))
    breakpoints.forEach(point => {
        code[point.range.startLineNumber - 1] = "#stop; " + code[point.range.startLineNumber - 1]
    });
    return code.join("\n")
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
//hookConsole();

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