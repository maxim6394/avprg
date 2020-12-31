import numpy as np
import cv2
from shapeDetector import Shape
from shapeDetector import ShapeType
import winsound

class ImageProcessing:
               

    def __init__(self, xSegments = 6):

        self.xSegments = xSegments
        self.currentSegment = 0
        self.currentX = 0        

    def processImage(self, image):
        self.image = np.copy(image)        
        self.width = self.image.shape[:2][1]
        self.height = self.image.shape[:2][0]

        self.shapes = []

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT,(3,3))
        grayscaleImage = cv2.bitwise_not(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY))
        _, self.thresholdImage = cv2.threshold(grayscaleImage, 150, 255, cv2.THRESH_BINARY)
        self.thresholdImage = cv2.morphologyEx(self.thresholdImage,cv2.MORPH_CLOSE, kernel)

        self.addDetectedShapes(self.thresholdImage)
        self.detectGrid()


    def addDetectedShapes(self, processedImage):
        contours, _ = cv2.findContours(processedImage, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)        
        for cnt in contours:
            self.shapes.append(Shape(cnt))

    def detectGrid(self):
        bottomRight = (0,0)
        topLeft = (self.width-1, self.height-1)

        for shape in self.shapes:
            if shape.shapeType == ShapeType.TRIANGLE:                
                if(shape.x < topLeft[0]):
                    topLeft = (shape.x, topLeft[1])
                
                if(shape.y < topLeft[1]):
                    topLeft = (topLeft[0], shape.y)

                if(shape.x > bottomRight[0]):
                    bottomRight = (shape.x, bottomRight[1])

                if(shape.y > bottomRight[1]):
                    bottomRight = (bottomRight[0], shape.y)

        if(topLeft == bottomRight):
            topLeft = (0,0)
            bottomRight = (ip.width-1, ip.height-1)

        self.topLeft = topLeft
        self.bottomRight = bottomRight
        
        self.cellHeight = round((bottomRight[1] - topLeft[1]) / 10)
        self.cellWidth = round((bottomRight[0] - topLeft[0]) / self.xSegments)

    def drawGrid(self):                
        for x in range(self.topLeft[0], self.bottomRight[0], self.cellWidth):
            cv2.line(self.image, (x, self.topLeft[1]), (x, self.bottomRight[1]), (0))
        for y in range(self.topLeft[1], self.bottomRight[1], self.cellHeight):
            cv2.line(self.image, (self.topLeft[0], y), (self.bottomRight[0], y), (0))    

        for shape in self.shapes:
            shape.draw(self.image)
            if self.isShapeActive(shape):
                shape.drawActive(self.image)
        cv2.line(self.image, (self.currentX, self.topLeft[1]), (self.currentX, self.bottomRight[1]), (0), 3)
    

    def isShapeActive(self,shape):
        yTop = self.topLeft[1]
        yBottom = self.bottomRight[1]

        return shape.x >= self.currentX - self.cellWidth/2 and shape.x < self.currentX+self.cellWidth/2 and shape.y > yTop and shape.y < yBottom
    

    def nextSegment(self):
        self.currentX = self.topLeft[0] + self.currentSegment * self.cellWidth
        self.currentSegment = (self.currentSegment + 1) % (self.xSegments + 1)
    

    def getActiveShapes(self):
        """gibt alle shapes die im bereich des aktuellen segments liegen"""
        activeShapes = []

        for shape in self.shapes:
            if self.isShapeActive(shape):
                activeShapes.append(shape)

        return activeShapes


    def getRelativeShapePosition(self,shape):
        """relative position im grid-bereich zwischen 0 und 1"""
        return (shape.y - self.topLeft[1]) / (self.bottomRight[1] - self.topLeft[1])