export default class HandGestureView{
    #canvas = document.querySelector("#hands")
    #contextCanvas = this.#canvas.getContext('2d')
    #fingerLookupIndexes
    #style

    constructor({fingerLookupIndexes, style}){
        this.#canvas.width = globalThis.screen.availWidth
        this.#canvas.height = globalThis.screen.availHeight
        this.#fingerLookupIndexes = fingerLookupIndexes
        this.#style = style

        setTimeout(() => this.#style.loadDocumentStyles(), 200)
    }

    clear(){
        this.#contextCanvas.clearRect(0,0,this.#canvas.width, this.#canvas.height)
    }

    drawResult(hands){
       for(const {keypoints, handedness} of hands){
            if(keypoints){
                this.#contextCanvas.fillStyle  = handedness === "Left" ? "red" : "rgb(44,212,103)"
                this.#contextCanvas.strokeStyle  = "white"
                this.#contextCanvas.lineWidth = 8
                this.#contextCanvas.lineJoin = "round"

                this.#drawJoients(keypoints)
                this.#drawFingersAndHoverElements(keypoints)
            }
       }
    }

    clickOnElement(x, y){
        const element = document.elementFromPoint(x, y)
        if(element){
            const rect = element.getBoundingClientRect()
            const event = new MouseEvent('click', {
                view:window,
                bubbles: true,
                cancelable: true,
                clientX: rect.left + x,
                clientY: rect.top + y
            })

            element.dispatchEvent(event)
        }
    }

    #drawJoients(keypoints){
        for(const {x, y} of keypoints){
            this.#contextCanvas.beginPath()
            const newX = x - 2
            const newY = y - 2
            const radius = 3
            const startAngle = 0
            const endAngle = 2 * Math.PI


            this.#contextCanvas.arc(newX, newY, radius, startAngle, endAngle)
            this.#contextCanvas.fill()
        }
    }

    #drawFingersAndHoverElements(keypoints){
        const fingers = Object.keys(this.#fingerLookupIndexes)

        for(const finger of fingers){
            const points = this.#fingerLookupIndexes[finger].map(
                index => keypoints[index]
            )
            const region = new Path2D()
            
            const[{x, y}] = points

            region.moveTo(x, y)

            for(const point of points){
                region.lineTo(point.x, point.y)
            }

            this.#contextCanvas.stroke(region)
            this.#hoverElement(finger, points)
        }
    }

    #hoverElement(finger, points){
        if(finger === "indexFinger"){
            const tip = points.find( item => item.name === "index_finger_tip")
            const element = document.elementFromPoint(tip.x, tip.y)

            if(element){
                const fn = () => this.#style.toggleStyle(element, ':hover')
                fn()
                setTimeout( ()=>fn(),400 )
            }
        }
    }

    loop(fn){
        requestAnimationFrame(fn)
    }

    scrollPage(top){
        scroll({
            top,
            behavior:'smooth'
        })
    }
}