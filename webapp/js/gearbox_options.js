$(document).ready(function(){

    $("input[type=radio][name=num_stages]").change(function(){
        switch ($("input[type=radio][name=num_stages]:checked").val()) {
            case "1":
                $("div.1stage").show();    
                $("div.2stage").hide();
                // $("div.row2").css("align-self", "center");
                break;
            case "2":
                $("div.1stage").hide();
                $("div.2stage").show();
                // $("div.row2").css("justify-self", "flex-end");
                break;
        }
    });
    $("input[type=radio][name=num_stages]").change();

});