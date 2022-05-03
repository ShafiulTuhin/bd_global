$(function(){
    //gnb
    $(document).on('click','.js-menu_toggle.closed',function(e){
        e.preventDefault(); $('.list_load, .list_item').stop();
        $(this).removeClass('closed').addClass('opened');

        $('.side_menu').css({ 'right':'0px' });

        var count = $('.list_item').length;
        $('.list_load').slideDown( (count*.6)*100 );
        $('.list_item').each(function(i){
            var thisLI = $(this);
            timeOut = 100*i;
            setTimeout(function(){
                thisLI.css({
                    'opacity':'1',
                    'margin-right':'0'
                });
            },100*i);
        });
    });

    $(document).on('click','.js-menu_toggle.opened',function(e){
        e.preventDefault(); $('.list_load, .list_item').stop();
        $(this).removeClass('opened').addClass('closed');

        $('.side_menu').css({ 'right':'-250px' });

        var count = $('.list_item').length;
        $('.list_item').css({
            'opacity':'0',
            'margin-right':'-20px'
        });
        $('.list_load').slideUp(300);
    });
    
    //header 
    $(window).scroll(function(){
        var windTop = $(this).scrollTop();
        
        if(windTop>100){
            $('.header1')
                .css('background-color','rgba(0,0,0,0.75)');
        }else{
            $('.header1')
                .css('background-color','transparent');
        }
    });
    
});