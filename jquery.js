(function() {
    $(document).ready(function() {
      var is_dragging;
      is_dragging = false;
      $(document).on("mousedown touchstart", ".roundSlider", function(e) {
        return is_dragging = true;
      });
      $(document).on("mouseup touchend", function(e) {
        return is_dragging = false;
      });
      return $(window).on("mousemove touchmove", function(e) {
        var angle, center_x, center_y, circle, delta_x, delta_y, pos_x, pos_y, touch;
        if (is_dragging) {
          circle = $(".roundSlider");
          touch = void 0;
          if (e.originalEvent.touches) {
            touch = e.originalEvent.touches[0];
          }
          center_x = ($(circle).outerWidth() / 2) + $(circle).offset().left;
          center_y = ($(circle).outerHeight() / 2) + $(circle).offset().top;
          pos_x = e.pageX || touch.pageX;
          pos_y = e.pageY || touch.pageY;
          delta_y = center_y - pos_y;
          delta_x = center_x - pos_x;
          angle = Math.atan2(delta_y, delta_x) * (180 / Math.PI);
          angle -= 90;
          if (angle < 0) {
            angle = 360 + angle;
          }
          angle = Math.round(angle);
          $(".roundSlider::-webkit-slider-thumb").css("transform", "rotate(" + angle + "deg)");
          return $(".debug").html(angle + "deg");
        }
      });
    });
  
  }).call(this);