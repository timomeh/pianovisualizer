// This code is so bad. I warned you.


var context = new (AudioContext || webkitAudioContext)()
var analyser = context.createAnalyser()
var sourceNode = context.createBufferSource()
sourceNode.connect(analyser)
sourceNode.connect(context.destination)


// Download file as mp3 from archive.org

var request = new XMLHttpRequest()
request.open('GET', 'https://archive.org/download/ClairDeLunedebussy/2009-03-30-clairdelune.mp3', true)
request.responseType = 'arraybuffer'

request.onload = () => {
  context.decodeAudioData(request.response, buffer => {
    document.querySelector('#msg').innerHTML = ''
    sourceNode.buffer = buffer
    sourceNode.start(0)
  }, e => {
    console.log(e);
  })
}

request.send()

var stage = new createjs.Stage('piano')
var keyWidth = 28

function currentBins() {
  var array = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(array)

  drawPiano(array)

  requestAnimationFrame(currentBins)
}

currentBins()

function drawPiano(array) {
  stage.removeAllChildren()

  // Check which piano keys were pressed an how hard they were pressed.

  var pressedKeys = new Array(87)

  // Threshold of volume of a frequency to count as pressed.
  var threshold = 0

  var maxBinCount = array.length
  for (var i = 0; i < maxBinCount; i++) {
    var value = array[i]
    if (value > threshold) {
      // Calculate frequency from fft bin
      var freq = context.sampleRate / analyser.fftSize * i

      // Only start with a frequency ~27hz. Piano starts at 27Hz.
      if (freq > 27) {
        var noteNum = Math.round(12 * (Math.log2(freq/442))) + 49 -1

        if (!pressedKeys[noteNum]) pressedKeys[noteNum] = 0
        pressedKeys[noteNum] = value
      }
    }
  }

  // Draw all white keys
  var nextKey = 0
  for (var k = 0; k < 88; k++) {

    var fill = "#ffffff"
    if (pressedKeys[k] > 0) {
      fill = `rgba(255,0,0,${pressedKeys[k]/255})`
    }
    var shape = new createjs.Shape()
    if (k%12 == 1 || k%12 == 4 || k%12 == 6 || k%12 == 9 || k%12 == 11) {
      // intentionally left blank.
    } else {
      shape.graphics.beginStroke("#000000").setStrokeStyle(1).beginFill(fill).drawRect(nextKey*keyWidth, 0, keyWidth, 200)
      nextKey++
    }
    stage.addChild(shape)
  }

  // Draw all black keys
  var nextKey = 0
  for (var k = 0; k < 88; k++) {
    var fill = "#000000"
    if (pressedKeys[k] > 0) {
      fill = `rgba(255,0,0,${pressedKeys[k]/255})`
    }
    var shape = new createjs.Shape()
    if (k%12 == 1 || k%12 == 4 || k%12 == 6 || k%12 == 9 || k%12 == 11) {
      shape.graphics.beginStroke("#000000").setStrokeStyle(1).beginFill(fill).drawRect(nextKey*keyWidth + keyWidth/2 + keyWidth/4, 0, keyWidth/2, 100);
    } else {
      nextKey++
    }
    stage.addChild(shape)
  }
  stage.update()
}