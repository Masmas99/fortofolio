import './style/main.css'
import Application from './javascript/Application.js'
import QuickTravel from './javascript/QuickTravel.js'

window.application = new Application({
    $canvas: document.querySelector('.js-canvas'),
    useComposer: true
})

window.quickTravel = new QuickTravel()
