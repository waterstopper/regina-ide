var worker;

function nextBreakpoint() {
    console.log("next")
}

function startExecution(withDebug) {
    breakpointsList = [];
    changeBreakpointColor();
    // allow only one instance running
    if (worker != null)
        return
    require(["vs/editor/editor.main"], function() {
        monaco.editor.setModelMarkers(window.editor.getModel(), 'owner', [])
    })
    let bodyStyles = window.getComputedStyle(document.body);
    let button = document.getElementById(withDebug ? "debug-button" : "start-button").getElementsByTagName("i")[0]
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
                if (withDebug)
                    return startDebugging()
            case "log":
                console.log(e.data.content)
                break;
            case "exception":
                showException(e.data.content)
                break;
            case "debug":
                let a = traverseMap(e.data.content)
                console.log(a)
                breakpointsList.push(a)
                break;
            case "breakpoint":
                changeBreakpointColor(parseInt(e.data.content.second_1) + 1)
                break;
        }
    }
}

function terminateExecution() {
    if (worker != null) {
        console.log("Stopped");
        worker.terminate()
        let bodyStyles = window.getComputedStyle(document.body);
        let button = document.getElementById("start-button").getElementsByTagName("i")[0]
        button.style["-webkit-text-fill-color"] = bodyStyles.getPropertyValue('--green')
        worker = null
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