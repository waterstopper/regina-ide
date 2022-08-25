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