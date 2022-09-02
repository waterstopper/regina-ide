/**
 * name: name to display in tab
 * htmlElement: tab DOM element
 * state: editor breakpoints, caret position
 * model: editor undo/redo stack, code (non-null if DOM tab exists)
 * code: code (non-null if tab is closed and tab is for user file). Is needed not to reset undo/redo
 * and store plain text.
 * isLib: if file is library file
 */

class Tab {
    constructor(path) {
        this.createHTMLElement(path);
    }
    state = null;
    model = null;
    htmlElement = null;
    createHTMLElement(path) {
        let tabs = document.getElementsByClassName("tabs scrollable")[0];
        this.htmlElement = tabs
            .getElementsByClassName("tab")[1]
            .cloneNode(true);
        let pathElements = path.split("/");
        this.htmlElement.getElementsByTagName("p")[0].innerText =
            pathElements[pathElements.length - 1];
        tabs.appendChild(this.htmlElement);
        this.htmlElement.getElementsByClassName("close")[0].onclick = (e) => {
            this.htmlElement.remove();
            closeTab(this);
            e.stopPropagation();
        };
        this.htmlElement.onclick = () => {
            switchTab(this);
        };
        this.htmlElement.setAttribute("path", path);
        this.htmlElement.style.display = "flex";
        this.setHover();
    }

    setActive() {
        this.htmlElement.style.backgroundColor = "var(--bg-color)";
        this.htmlElement.getElementsByClassName(
            "close"
        )[0].style.backgroundColor = "var(--bg-color)";
    }

    setPassive() {
        this.state = window.editor.saveViewState();
        this.htmlElement.style.backgroundColor = "var(--light-gray)";
        this.htmlElement.getElementsByClassName(
            "close"
        )[0].style.backgroundColor = "var(--light-gray)";
    }

    setHover() {
        this.htmlElement.onmouseleave = () => {
            if (this == window.currentTab) return;
            this.htmlElement.style.backgroundColor = "var(--light-gray)";
            this.htmlElement.getElementsByClassName(
                "close"
            )[0].style.backgroundColor = "var(--light-gray)";
        };

        this.htmlElement.onmouseover = () => {
            if (this == window.currentTab) return;
            this.htmlElement.style.backgroundColor = "var(--bg-color)";
            this.htmlElement.getElementsByClassName(
                "close"
            )[0].style.backgroundColor = "var(--bg-color)";
        };
    }
}

async function openTab(path, isLib) {
    let found = window.tabs[path];
    if (found != null && typeof found != "string") {
        switchTab(found);
        return;
    }
    let code;
    if (isLib) {
        code = (
            await (
                await fetch("https://alex5041.github.io/reginafiles/" + path)
            ).text()
        ).toString();
    } else code = localStorage.getItem(path.code);
    if (
        code.includes(
            "Hey! You look a little lost. This page doesn't exist (or may be private)"
        )
    )
        code = "// Library file not found";
    let tab = new Tab(path, isLib);
    window.tabs[path] = tab;
    tab.path = path;
    tab.model = monaco.editor.createModel(code, "Regina");
    tab.state = window.editor.saveViewState();
    switchTab(tab);
}

function switchTab(tab) {
    if (window.currentTab != null) window.currentTab.setPassive();
    window.currentTab = tab;
    tab.setActive();
    window.editor.setModel(tab.model);
    window.editor.restoreViewState(tab.state);
    window.editor.focus();
}

function closeTab(tab) {
    delete window.tabs[tab.path];
    if (this == window.currentTab) {
        let openedTabs = Object.entries(window.tabs);
        if (openedTabs.length != 0) switchTab(openedTabs[0][1]);
        else {
            window.editor.setModel(null);
            window.currentTab = null;
        }
    }
    if (tab.isLib) return;

    tab.code = tab.model.getValue();
    delete tab.model;
    delete tab.htmlElement;
    localStorage.setItem(tab.path, JSON.stringify(tab));
}

function findTab(path) {
    let tabs = document.getElementsByClassName("tabs scrollable")[0];
    for (let tab of tabs.children)
        if (tab.getAttribute("path") == path) return tab;
    return null;
}

export default {};
export { openTab };
