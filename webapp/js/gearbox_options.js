var gears;

$(document).ready(function(){

    function load_gears(response){
        gears = JSON.parse(response);
        const shaft_types = Object.keys(gears);
        for (let i = shaft_types.length-1; i >= 0; i--) {
            $("select.gear-type").prepend("<option>" + shaft_types[i] + "</option>");
        }
        $("select.gear-type").val(shaft_types[0]);
    }

    $("select#gear-list").change(function(){
        
        if ($("select#gear-list").val() == "Custom"){
            $("input#gear-list-custom").click();
        } else {
            const request = new XMLHttpRequest();
            request.onload = function(){ load_gears(this.responseText); };
            request.open("GET", $("select#gear-list").val());
            request.send();
        }
        
    });
    $("select#gear-list").change();

    $("input#gear-list-custom").change(function(){
        var reader = new FileReader();
        reader.onload = function(){ load_gears(this.result); };
        reader.readAsText($("input#gear-list-custom")[0].files[0]);
    });

    $("input[type=radio][name=num_stages]").change(function(){
        switch ($("input[type=radio][name=num_stages]:checked").val()) {
            case "1":
                $("div.1stage").show();    
                $("div.2stage").hide();
                $("img#diagram").attr("src", "img/gear_options_1stage.png");
                break;
            case "2":
                $("div.1stage").hide();
                $("div.2stage").show();
                $("img#diagram").attr("src", "img/gear_options_2stage.png");
                break;
        }
    });
    $("input[type=radio][name=num_stages]").change();

    $("select#type2").change(function(){
        $("select#type3").val($("select#type2").val());
    })

    $("select#type3").change(function(){
        $("select#type2").val($("select#type3").val());
    })

    $("select#clearance1").change(function(){
        $("div#clearance div.field:has(input#clearance1custom)").css("visibility", ($("select#clearance1").val() == "Custom" ? "visible" : "hidden"));
    });

    $("select#clearance4").change(function(){
        $("div#clearance div.field:has(input#clearance4custom)").css("visibility", ($("select#clearance4").val() == "Custom" ? "visible" : "hidden"));
    });

});