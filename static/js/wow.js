(function ($) {
    'use strict';

    var $window = $(window);

    // :: Wow Active Code
    if ($window.width() > 0) {
        new WOW().init();
    }


})(jQuery);