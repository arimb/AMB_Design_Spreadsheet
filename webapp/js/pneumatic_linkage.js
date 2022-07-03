// window.onbeforeunload = function() {
//     return "Refreshing or leaving this page will reset it. Are you sure you want to continue?";
// }

$(document).ready(function(){

    $("input[name=driven]").change(function(){
        $("div#piston, div#linkage").find("input[type=number]").prop("disabled", false);
        $(this).siblings().find("input[type=number]").prop("disabled", true);
    });

});