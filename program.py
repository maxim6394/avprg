import numpy as np
import cv2
from shapeDetector import Shape
from shapeDetector import ShapeType
from imageProcessing import ImageProcessing
import rtmidi
import mido
import winsound


#contoursImage = np.ones(shape=(height,width,3), dtype=np.uint8) * 255

def sendNoteOn(note):
    message = mido.Message('note_on', note=note, velocity=127)
    sentOnNotes.append(note)
    midiOutput.send(message)

def sendNoteOff(note):
    message = mido.Message('note_off', note=note, velocity=127)
    midiOutput.send(message)

def sendControlChange(control, value):
    message = mido.Message('control_change', control=control, value=value)
    midiOutput.send(message)


def sendProgramChange(program, channel):
    message = mido.Message('program_change', program=program, channel=channel)
    midiOutput.send(message)

sentOnNotes = []

minFrequency = 500
maxFrequency = 7000
duration = 30

timePerLoop = 200
loopsPerImageProcessing = 5

imageHeight = 400

originalImage = cv2.imread("test4.jpg")
originalSize = originalImage.shape[:2]
ip = ImageProcessing()

loopsSinceImageProcessed = loopsPerImageProcessing

print("MIDI output ports: ", mido.get_output_names())

outputName = mido.get_output_names()[0]
midiOutput = mido.open_output("LoopBe Internal MIDI 1")

#exit()

resizedImage = cv2.resize(originalImage, (round(imageHeight / originalSize[0] * originalSize[1]), imageHeight))
ip.processImage(resizedImage)


drawing = False # true if mouse is pressed
erasing = False
ix,iy = -1,-1

cv2.namedWindow('image')

def on_trackbar(val):
    ip.xSegments = val
    ip.processImage(ip.image)

def on_speed_trackbar(val):
    global timePerLoop
    if val < 50:
        val = 50
    timePerLoop = val

cv2.createTrackbar("segments", "image" , 5, 30, on_trackbar)
cv2.createTrackbar("delay", "image" , 200, 500, on_speed_trackbar)

def freeDraw(event,x,y,flags,param):
    global drawing,erasing

    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        sendNoteOff(0)

    elif event == cv2.EVENT_MOUSEMOVE:
        if drawing == True:
            cv2.circle(ip.image,(x,y),4,(0,0,0),-1)
        elif erasing == True:
            cv2.circle(ip.image,(x,y),15,(255,255,255),-1)

    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False
        ip.processImage(ip.image)

    elif event == cv2.EVENT_RBUTTONDOWN:
        erasing = True
        sendNoteOff(0)

    elif event == cv2.EVENT_RBUTTONUP:
        erasing = False
        ip.processImage(ip.image)

cv2.setMouseCallback('image',freeDraw)
while True:

    
    if loopsSinceImageProcessed == loopsPerImageProcessing:
        ()
        cv2.imwrite('output.jpg', ip.outputImage, [cv2.IMWRITE_JPEG_QUALITY, 90])
        #resizedImage = cv2.resize(originalImage, (round(imageHeight / originalSize[0] * originalSize[1]), imageHeight))
        #ip.processImage(resizedImage)
        #loopsSinceImageProcessed = 0
    else:
        ()
        #loopsSinceImageProcessed += 1

    ip.resetOutputImage()
    
    

    if not drawing and not erasing:
        
        if cv2.waitKey(timePerLoop) != -1:
            break

        ip.nextSegment()            

        for note in sentOnNotes:        
            sendNoteOff(note)
            sentOnNotes = []  
            
        for shape in ip.getActiveShapes():
            ()
            if shape.shapeType == ShapeType.NONE or shape.shapeType == ShapeType.LINE:
                sendControlChange(1,3)
            elif shape.shapeType == ShapeType.CIRCLE:
                sendControlChange(1,2)
            elif shape.shapeType == ShapeType.TRIANGLE:
                sendControlChange(1,4)
            elif shape.shapeType == ShapeType.RECTANGLE:
                sendControlChange(1,1)            
                       
            #note = int(ip.getRelativeShapePosition(shape) * (72-48)) + 48
            note = int(ip.getRelativeShapePosition(shape) * 128)
            if shape.shapeType != ShapeType.TRIANGLE:
                sendNoteOn(note)
        # winsound.Beep(int(minFrequency + ip.getRelativeShapePosition(shape) * (maxFrequency - minFrequency)), duration)   
    
    else:
        cv2.waitKey(10)

    ip.drawGrid()

    cv2.imshow("image", ip.outputImage)
    cv2.imshow("threshold", ip.thresholdImage)
    cv2.imshow("red", ip.redMask)
    cv2.imshow("green", ip.greenMask)
    cv2.imshow("black", ip.blackMask)
    #cv2.imshow("grayscale", grayscaleImage)
    

cv2.destroyAllWindows()