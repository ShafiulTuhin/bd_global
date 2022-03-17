$(function(){
    $('#lnb .option li').click(function(e){
        e.preventDefault();
       $(this)
                .addClass('on')
            .siblings()
                .removeClass('on');
    });    
});