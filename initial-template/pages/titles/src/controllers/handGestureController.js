import { prepareRunChecker } from '../../../../lib/shared/util.js'

const { shouldRun: scrollShouldRun } = prepareRunChecker({timerDelay:250})
const { shouldRun: clickShouldRun } = prepareRunChecker({timerDelay:450})
export default class HandGestureController{
    #view
    #service
    #camera
    #lastDirection = {
        direction:'',
        y:0
    }
    constructor({ view, service, camera }){
        this.#view = view
        this.#service = service
        this.#camera = camera
    }

    async init(){
       return this.#loop()
    }

    #scrollPage(direction){
        const pixelScroll = 100
        if(this.#lastDirection.direction === direction){
            this.#lastDirection.y = (
                direction === 'scroll-down'?
                this.#lastDirection.y + pixelScroll :
                this.#lastDirection.y - pixelScroll
            )
        }else{
            this.#lastDirection.direction = direction
        }
        console.log(this.#lastDirection.y)
        console.log(this.#lastDirection.direction)
        
        if(this.#lastDirection.y < 0){
            this.#lastDirection.y = 0
        }

        if(this.#lastDirection.y > 2500){
            this.#lastDirection.y = 2500
        }

        this.#view.scrollPage(this.#lastDirection.y)
    }

    async #estimateHands(){
        try {
            const hands = await this.#service.estimateHands(this.#camera.video)
           
            this.#view.clear()

            if(hands && hands.length){
                this.#view.drawResult(hands)
            }

            for await (const {event, x, y} of this.#service.detectGesture(hands)){
                if(event === 'click'){
                    if(clickShouldRun()){
                        this.#view.clickOnElement(x,y)
                        continue
                    }
                }
                if(event.includes('scroll')){
                    if(scrollShouldRun()){
                        this.#scrollPage(event)
                    }
                    
                }
            }
        } catch (error) {
            console.error('error', error)
        }
    }

    async #loop(){
        await this.#service.initializeDetector()
        await this.#estimateHands()
        this.#view.loop(this.#loop.bind(this))
    }

    static async initialize(deps){
        const controller = new HandGestureController(deps)
        return controller.init()
    }
}