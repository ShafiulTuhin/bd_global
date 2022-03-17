$(function(){
    $('#lnb .buy_sell li').click(function(e){
        e.preventDefault();
       $(this)
                .addClass('on')
            .siblings()
                .removeClass('on');
    });
    
    $('#lnb .coin_name li').click(function(e){
        e.preventDefault();
       $(this)
                .addClass('on')
            .siblings()
                .removeClass('on');
    });
    
    $('#setting .indicator span').click(function(e){
        e.preventDefault();
       $(this)
                .addClass('on')
            .siblings()
                .removeClass('on');
    });
    
});