import {
    addBreakpoint,
    changeBreakpointColor,
    startDebugging,
    addConsoleOutput,
} from "./debug.js";

var worker;

function addBreakpointsToCode() {
    let code = window.editor.getValue().split("\n");
    let i = 0;
    let breakpoints = window.editor.getBreakpoints();
    breakpoints.sort(
        (a, b) =>
            parseInt(a.range.startLineNumber) -
            parseInt(b.range.startLineNumber)
    );
    breakpoints.forEach((point) => {
        code[point.range.startLineNumber - 1] =
            "#stop; " + code[point.range.startLineNumber - 1];
    });
    return code.join("\n");
}

function startExecution(withDebug) {
    if (withDebug) changeBreakpointColor();
    // allow only one instance running
    if (worker != null) return;
    require(["vs/editor/editor.main"], function () {
        monaco.editor.setModelMarkers(window.editor.getModel(), "owner", []);
    });
    let bodyStyles = window.getComputedStyle(document.body);
    let button = document
        .getElementById(withDebug ? "debug-button" : "start-button")
        .getElementsByTagName("i")[0];
    button.style["-webkit-text-fill-color"] =
        bodyStyles.getPropertyValue("--gray");
    worker = new Worker("js/external/regina_interpreter.js");
    worker.onmessage = (e) => {
        switch (e.data.type) {
            case "ready":
                worker.postMessage([addBreakpointsToCode(), ""]);
                break;
            case "finished":
                worker = null;
                button.style["-webkit-text-fill-color"] =
                    bodyStyles.getPropertyValue("--green");
                if (withDebug) return startDebugging();
                break;
            case "log":
                console.log(e.data.content);
                if (withDebug) addConsoleOutput(e.data.content);
                break;
            case "exception":
                showException(e.data.content);
                break;
            case "debug":
                addBreakpoint(e.data.content);
                break;
            case "breakpoint":
                changeBreakpointColor(parseInt(e.data.content.second_1) + 1);
                break;
        }
    };
}

function showLog(content) {
    let output = document
        .getElementsByClassName("console-record")[0]
        .cloneNode(true);
    output.style = "display:block;";
    output.getElementsByTagName("p")[0].innerText = content;
    document.getElementById("console").appendChild(output);
}

function terminateExecution() {
    if (worker != null) {
        console.log("Stopped");
        worker.terminate();
        let bodyStyles = window.getComputedStyle(document.body);
        let button = document
            .getElementById("start-button")
            .getElementsByTagName("i")[0];
        button.style["-webkit-text-fill-color"] =
            bodyStyles.getPropertyValue("--green");
        worker = null;
    }
}

function showException(exception) {
    require(["vs/editor/editor.main"], function () {
        monaco.editor.setModelMarkers(window.editor.getModel(), "owner", [
            {
                message: exception.message,
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: exception.position.y,
                startColumn: exception.position.x,
                endLineNumber: exception.position.y,
                endColumn: exception.position.x + exception.length,
            },
        ]);
    });
}

export default startExecution;
export { showLog };
