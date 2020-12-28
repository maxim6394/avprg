import numpy as np
import cv2


originalImage = cv2.imread("test3.jpg")
height, width = originalImage.shape[:2]
grayscaleImage = cv2.bitwise_not(cv2.cvtColor(originalImage, cv2.COLOR_BGR2GRAY))
#contoursImage = np.ones(shape=(height,width,3), dtype=np.uint8) * 255


kernel = cv2.getStructuringElement(cv2.MORPH_RECT,(3,3))

grayscaleImage = cv2.GaussianBlur(grayscaleImage, (3,3), 0)
_, threshold = cv2.threshold(grayscaleImage, 150, 255, cv2.THRESH_BINARY)

opening = cv2.morphologyEx(threshold,cv2.MORPH_CLOSE, kernel)

contours, _ = cv2.findContours(opening, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE, )

font = cv2.FONT_HERSHEY_PLAIN

for cnt in contours:
    approx = cv2.approxPolyDP(cnt, 0.05 * cv2.arcLength(cnt, True), True)
    area = cv2.contourArea(cnt)
    x = approx.ravel()[0]
    y = approx.ravel()[1] -10

    cv2.drawContours(originalImage, [approx], 0, (0,255,0), 2)
    cv2.putText(originalImage, ""+str(len(approx))+"/"+str(round(area))+"px", (x,y), font, 1.2,(0), 2)

cv2.imshow("image", originalImage)
cv2.imshow("opening", opening)
cv2.imshow("grayscale", grayscaleImage)
cv2.waitKey(0)
cv2.destroyAllWindows()