function supportWorkType(){
    let support = false;

    const test = {
        get type(){
            support = true
        }
    }

    try {
        new Worker('blob://', test).terminate()
    } finally {
        return support
    }
}

function prepareRunChecker({ timerDelay }) {
    let lastEvent = Date.now()
    return {
      shouldRun() {
        const result = (Date.now() - lastEvent) > timerDelay
        if(result) lastEvent = Date.now()
  
        return result
      }
    }
  }

export {
    prepareRunChecker,
    supportWorkType
}