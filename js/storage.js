/* settings:
    1. panel sizes
    2. theme
    3. autosave, seconds
    4. console entries, number

    files
    file tree files and their contents
*/

function autosave() {
    localStorage.setItem("code", window.editor.getValue())
}

var counter = 0;
setInterval(function() {
    autosave();
}, 3000);

var holdingReset = false;
var interval = null;

document.getElementById("reset-all").onmousedown = () => {
    let index = 3;
    document.getElementById("reset-all").innerText = "hold " + index + "..."
    index--;
    interval = setInterval(function() {
        if (index == 0) {
            clearInterval(interval);
            document.getElementById("reset-all").innerText = "do reset"
        } else
            document.getElementById("reset-all").innerText = "hold " + index + "..."
        index--;
    }, 1000)
}


function stopReset() {
    clearInterval(interval);
    document.getElementById("reset-all").innerText = "do reset"
}

document.getElementById("reset-all").onmouseup = () => stopReset()
document.getElementById("reset-all").onmouseleave = () => stopReset()


document.getElementById("save-button").onclick = () => {
    autosave()
}

document.getElementById("theme-button").onclick = () => {
    if (document.documentElement.getAttribute('data-theme') == 'dark')
        changeTheme('light')
    else
        changeTheme('dark')
}

document.getElementById("save-seconds").onchange = (e) =>
    changeNumberInput(e.target, "autosaveSeconds", [0, 200])

document.getElementById("console-entries").onchange = (e) =>
    changeNumberInput(e.target, "consoleEntries", [0, 200])

function changeNumberInput(target, storageName, bounds) {
    let value = target.value
    if (value < bounds[0])
        value = bounds[0]
    else if (value > bounds[1])
        value = bounds[1]
    target.value = value
    localStorage.setItem(storageName, parseInt(value))
}

function setDefaults() {
    if (localStorage.getItem("firstTime") != null)
        return;
    localStorage.setItem("firstTime", false);
    localStorage.setItem('theme', 'light');
    localStorage.setItem('autosaveSeconds', 3);
    localStorage.setItem('consoleEntries', 100);
    localStorage.setItem('settingsSize', 48);
    localStorage.setItem('leftSize', 33);
    localStorage.setItem('rightSize', 33);
    localStorage.setItem('consoleSize', 48);
    localStorage.setItem('main.js', `
fun main() {
    log("Hello, World!")
}`);
}

function openSettings() {
    document.getElementById("save-seconds").value = localStorage.getItem("autosaveSeconds")
    document.getElementById("console-entries").value = localStorage.getItem("consoleEntries")
}

function changeTheme(themeName) {
    require(["vs/editor/editor.main"], function() {
        localStorage.setItem('theme', themeName)
        monaco.editor.setTheme("regina-" + themeName)
        document.documentElement.setAttribute('data-theme', themeName)
        document.getElementById("theme-button").innerText = themeName
    })
}

setDefaults()
changeTheme(localStorage.getItem('theme'))
openSettings();