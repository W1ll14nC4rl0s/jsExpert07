export default class Controller{
    #view
    #camera
    #worker
    #blinkCounter
    constructor({ view, camera, worker }){
        this.#camera = camera
        this.#view = view
        this.#view.configureOnBtnClick(this.onBtnStart.bind(this))
        this.#worker = this.#configureWorker(worker)
    }

    static async initialize(deps){
        const controller = new Controller(deps)
        controller.logger('not yet detecting eye blink! click in the button to start')
        return controller.init()
    }

    #configureWorker(worker){
        let ready = false;
        worker.onmessage = ({ data }) => {
            if('READY' === data){
                console.log('worker is ready!!!')
                this.#view.enableButton()
                ready = true;
                return;
            }

            const blinked = data.blinked
            this.#blinkCounter += blinked
            if(blinked){
                this.#view.togglePlayVideo()
                console.log('blinked', blinked)
            }
            
        }

        return {
            send (msg){
                if(ready){
                    worker.postMessage(msg)
                }
            }
        }
    }

    loop(){
        const video = this.#camera.video
        const img = this.#view.getVideoFrame(video)
        this.#worker.send(img)
        this.logger(`detecting eye blink...`)

        setTimeout( () => this.loop(), 100)
    }

    async init(){
        console.log('ok')
    }

    logger(text){
        const times = `      - blinked times: ${this.#blinkCounter}`
        this.#view.log(`status: ${text}`.concat(this.#blinkCounter ? times : ""))
    }

    onBtnStart(){
        this.logger('Initializing detection ...')
        this.#blinkCounter = 0
        this.loop()
    }
}