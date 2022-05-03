$(function(){
    $('#dashboard .dash_menu li').click(function(e){
        e.preventDefault();
       $(this)
                .addClass('on')
            .siblings()
                .removeClass('on');
    });
    
    $('#dashboard .date li').click(function(e){
        e.preventDefault();
       $(this)
                .addClass('on')
            .siblings()
                .removeClass('on');
    });
    
    $('#friendsList .friends_menu li').click(function(e){
        e.preventDefault();
       $(this)
                .addClass('on')
            .siblings()
                .removeClass('on');
    });
    
    $('#commission .commission_menu li').click(function(e){
        e.preventDefault();
       $(this)
                .addClass('on')
            .siblings()
                .removeClass('on');
    });
});