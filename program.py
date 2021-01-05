import numpy as np
import cv2
from shapeDetector import Shape
from shapeDetector import ShapeType
from imageProcessing import ImageProcessing
import winsound


#contoursImage = np.ones(shape=(height,width,3), dtype=np.uint8) * 255




minFrequency = 500
maxFrequency = 7000
duration = 30

timePerLoop = 200
loopsPerImageProcessing = 5

imageHeight = 300

originalImage = cv2.imread("test3.jpg")
originalSize = originalImage.shape[:2]
ip = ImageProcessing()

loopsSinceImageProcessed = loopsPerImageProcessing

while True:

    if loopsSinceImageProcessed == loopsPerImageProcessing:
        resizedImage = cv2.resize(originalImage, (round(imageHeight / originalSize[0] * originalSize[1]), imageHeight))
        ip.processImage(resizedImage)
        loopsSinceImageProcessed = 0
    else:
        loopsSinceImageProcessed += 1

    if cv2.waitKey(timePerLoop) != -1:
        break

    ip.resetOutputImage()
    ip.nextSegment()    
    ip.drawGrid()

    for shape in ip.getActiveShapes():
        ()
        winsound.Beep(int(minFrequency + ip.getRelativeShapePosition(shape) * (maxFrequency - minFrequency)), duration)   


    cv2.imshow("image", ip.outputImage)
    cv2.imshow("threshold", ip.thresholdImage)
    cv2.imshow("red", ip.redMask)
    cv2.imshow("green", ip.greenMask)
    cv2.imshow("black", ip.blackMask)
    #cv2.imshow("grayscale", grayscaleImage)
 

cv2.destroyAllWindows()