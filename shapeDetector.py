import numpy as np
import cv2
from enum import Enum


class ShapeType(Enum):
    NONE = 1
    LINE = 2
    TRIANGLE = 3
    RECTANGLE = 4
    CIRCLE = 5

class Shape:
    
    boundsColor = (0,255,255)
    centerMarkerColor = (0,255,0)
    contourColor = (0,255,0)
    textColor = (0,0,0)
    activeColor = (255,255,0)
    
    def __init__(self, contour):
        self.contour = contour
        self.approx = cv2.approxPolyDP(contour, 0.03 * cv2.arcLength(contour, True), True)
        self.corners = len(self.approx)
        self.area = round(cv2.contourArea(self.approx))
        self.boundingRect = cv2.boundingRect(self.approx)

        M = cv2.moments(contour)
        if M["m00"] == 0:
            self.x = 0
            self.y = 0
        else: 
            self.x = int(M["m10"] / M["m00"])
            self.y = int(M["m01"] / M["m00"])


        if self.corners == 0 or self.corners == 1:
            self.shapeType = ShapeType.NONE
        elif self.corners == 2:
            self.shapeType = ShapeType.LINE
        elif self.corners == 3:
            self.shapeType = ShapeType.TRIANGLE
        elif self.corners == 4:
            self.shapeType = ShapeType.RECTANGLE
        else:
            self.shapeType = ShapeType.CIRCLE

    def getShapeName(self):
        t = self.shapeType

        if t == ShapeType.NONE:
            return "?"
        elif t == ShapeType.LINE:
            return "line"
        elif t == ShapeType.TRIANGLE:
            return "triangle"
        elif t == ShapeType.RECTANGLE:
            return "rectangle"
        elif t == ShapeType.CIRCLE:
            return "circle"

   

    def drawActive(self, img):
        r = self.boundingRect
        #cv2.rectangle(img, (r[0], r[1]), (r[0]+r[2], r[1]+r[3]), Shape.activeColor, 2)
        cv2.drawContours(img, [self.approx], 0, Shape.activeColor, 2)

    def draw(self, img): 
        cv2.drawContours(img, [self.approx], 0, Shape.contourColor, 1)
        cv2.drawMarker(img, (self.x, self.y), Shape.centerMarkerColor, cv2.MARKER_CROSS)
        r = self.boundingRect
       # cv2.rectangle(img, (r[0], r[1]), (r[0]+r[2], r[1]+r[3]), Shape.boundsColor)

        #cv2.putText(img, ""+str(self.corners)+"/"+str(self.area)+"px", (self.x,self.y), cv2.FONT_HERSHEY_PLAIN, 1.2, Shape.textColor, 2)
        cv2.putText(img, ""+self.getShapeName(), (r[0],r[1]), cv2.FONT_HERSHEY_PLAIN, 1.2, Shape.textColor, 1)

