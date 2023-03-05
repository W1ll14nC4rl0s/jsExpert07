onmessage = ({ data }) => {
    
    let counter = 0
    console.log('activating blocking operation...', data.maxItens)
    console.time('blocking-op')
        // blocking function
        // 1e5 = 100.000
    for (; counter < data.maxItens; counter++) console.log('.')
    console.timeEnd('blocking-op')

    postMessage({ response: counter })
}