import numpy as np
import cv2
from shapeDetector import Shape
from shapeDetector import ShapeType
from imageProcessing import ImageProcessing
import winsound


#contoursImage = np.ones(shape=(height,width,3), dtype=np.uint8) * 255




minFrequency = 500
maxFrequency = 10000
duration = 200
timePerSegment = 200

imageHeight = 300

originalImage = cv2.imread("test3.jpg")
originalSize = originalImage.shape[:2]
ip = ImageProcessing()


while True:

    resizedImage = cv2.resize(originalImage, (round(imageHeight / originalSize[0] * originalSize[1]), imageHeight))
    ip.processImage(resizedImage)
    if cv2.waitKey(timePerSegment) != -1:
        break

    ip.drawGrid()
    ip.nextSegment()

    for shape in ip.getActiveShapes():
       winsound.Beep(int(minFrequency + ip.getRelativeShapePosition(shape) * (maxFrequency - minFrequency)), duration)   

    cv2.imshow("image", ip.image)
    cv2.imshow("threshold", ip.thresholdImage)
    #cv2.imshow("grayscale", grayscaleImage)
 

cv2.destroyAllWindows()