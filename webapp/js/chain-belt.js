$(document).ready(function(){

    $("input[type=radio][name=units]").change(function(){
        const tmp = JSON.parse($("input[type=radio][name=units]:checked").val());
        $("span.dist_unit").html(tmp[0]);
        $("span.force_unit").html(tmp[2]);
        $("span.weight_unit").html(tmp[4])
        $("select#type").change();
    });
    $("input[type=radio][name=units]").change();

    var dimensions;
    $("select#type").change(function(){
        if($("select#type").val() == "Custom"){
            $("input#pitch_dist").prop("disabled", false);
            $("div#dimensions input").val("");
        }else{
            const tmp = JSON.parse($("input[type=radio][name=units]:checked").val());
            $("input#pitch").val((dimensions[$("select#type").val()][0] / tmp[1]).toFixed(3));
            $("input#width").val((dimensions[$("select#type").val()][1] / tmp[1]).toFixed(3));
            $("input#thickness").val((dimensions[$("select#type").val()][2] / tmp[1]).toFixed(3));
            $("input#adder").val((dimensions[$("select#type").val()][3] / tmp[1]).toFixed(3));
            $("input#weight").val((dimensions[$("select#type").val()][4] / tmp[5]).toFixed(3));
            $("input#load_rating").val((dimensions[$("select#type").val()][5] / tmp[3]).toFixed(0));
            $("input#pitch_dist").prop("disabled", true);
        }
    });

    // Load motor properties
    const request = new XMLHttpRequest();
    request.onload = function() {
        dimensions = JSON.parse(this.responseText);
        const types = Object.keys(dimensions);
        for (let i = types.length-1; i >= 0; i--) {
            $("select#type").prepend("<option>" + types[i] + "</option>");
        }
        $("select#type").val(types[0]);
        $("select#type").change();
    };
    request.open("GET", "ref/chain-belt.json");
    request.send();

});