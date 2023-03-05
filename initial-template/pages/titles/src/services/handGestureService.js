import { knownGestures, gestureStrings } from "../util/util.js"
export default class HandGestureService{
    #gestureEstimator
    #handPoseDetection
    #handsVersion
    #detector = null
    #knownGestures
    #gestureStrings
    constructor({fingerpose, handPoseDetection, handsVersion, knownGestures, gestureStrings}){
        this.#gestureEstimator = new fingerpose.GestureEstimator(knownGestures)
        this.#handPoseDetection = handPoseDetection
        this.#handsVersion = handsVersion
        this.#knownGestures = knownGestures
        this.#gestureStrings = gestureStrings
    }

    async estimate(key3d){
        const prediction = await this.#gestureEstimator.estimate(
            this.#getLandMarksFromKeyPoints(key3d),
            9
        )

        return prediction.gestures
    }

    async * detectGesture(prediction){
        for(const hand of prediction){
            if(hand.keypoints3D){
                const  resultGesture = await this.estimate(hand.keypoints3D)
                //console.log(gesture)
                if(resultGesture.length){
                    const gesture = resultGesture[(resultGesture.length - 1)]
                    if(gesture.score >= 9 && gesture.score <= 10){
                        //console.log(gesture)
                        
                         const result = gesture//.reduce(
                        //     (previous, current)=>(previous.score > current.score ) ? previous : current
                        //     )
                        const {x, y} = hand.keypoints.find( keypoint => keypoint.name === 'index_finger_tip')
                        yield{event: result.name, x,y}
                        //console.log('detected', gestureStrings[result.name])
                        
                    }
                }
                
            }
        }
    }

    #getLandMarksFromKeyPoints(key3d){
        return key3d.map( keypoint => [ keypoint.x, keypoint.y, keypoint.z] )
    }

    async estimateHands(video){
        return this.#detector.estimateHands(video,{
            flipHorizontal: true
        })
    }

    async initializeDetector(){
        if(this.#detector){
            return this.#detector
        }

       const detectorConfig = {
        runtime:'mediapipe',
        solutionPath:`https://cdn.jsdelivr.net/npm/@mediapipe/hands@${this.#handsVersion}`,
        modelType:'lite',
        maxHands:2
       }

       this.#detector = await this.#handPoseDetection.createDetector(
        this.#handPoseDetection.SupportedModels.MediaPipeHands,
        detectorConfig
       )

       return this.#detector
    }
}