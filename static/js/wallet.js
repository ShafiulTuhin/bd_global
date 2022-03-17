$(function(){
    $('#asset .clear li').click(function(e){
        e.preventDefault();
       $(this)
                .addClass('on')
            .siblings()
                .removeClass('on');
    });    
});