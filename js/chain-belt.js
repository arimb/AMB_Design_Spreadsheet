var dist_decimals = 2;

var pitch, diam1, diam2;

$(document).ready(function(){

    // Load belt/chain types
    const request = new XMLHttpRequest();
    request.onload = function() {
        dimensions = JSON.parse(this.responseText);
        const types = Object.keys(dimensions);
        for (let i = types.length-1; i >= 0; i--) {
            $("select#type").prepend("<option>" + types[i] + "</option>");
        }
        $("select#type").val(types[0]).change();
    };
    request.open("GET", "ref/chain-belt.json");
    request.send();

    // Update belt/chain type
    var dimensions;
    $("select#type").change(() => {
        if($("select#type").val() == "Custom"){
            $("input#pitch").prop("disabled", false);
            $("div#dimensions input").val("");
        }else{
            const tmp = JSON.parse($("input[type=radio][name=units]:checked").val());
            pitch = dimensions[$("select#type").val()][0] / tmp[1];
            $("input#pitch").val(+(pitch.toFixed(dist_decimals)));
            $("input#width").val(+((dimensions[$("select#type").val()][1] / tmp[1]).toFixed(dist_decimals)));
            $("input#thickness").val(+((dimensions[$("select#type").val()][2] / tmp[1]).toFixed(dist_decimals)));
            $("input#adder").val(+((dimensions[$("select#type").val()][3] / tmp[1]).toFixed(dist_decimals)));
            $("input#weight").val(+((dimensions[$("select#type").val()][4] / tmp[5]).toFixed(3)));
            $("input#load_rating").val(+((dimensions[$("select#type").val()][5] / tmp[3]).toFixed(0)));
            $("input#pitch").prop("disabled", true);
        }
        $("input#teeth1, input#teeth2").change();
    });
    $("input#pitch").change(() => pitch = $("input#pitch").val() );

    // Update pitch diameters
    $("input#teeth1").change(function(){
        diam1 = $("input#teeth1").val() * pitch / Math.PI;
        $("input#diam1").val(+(diam1.toFixed(dist_decimals)));
    });
    $("input#teeth2").change(function(){
        diam2 = $("input#teeth2").val() * pitch / Math.PI;
        $("input#diam2").val(+(diam2.toFixed(dist_decimals)));
    });

    // Switch units
    $("input[type=radio][name=units]").change(function(){
        const tmp = JSON.parse($("input[type=radio][name=units]:checked").val());
        dist_decimals = tmp[0]=="in" ? 3 : 2;
        $("span.dist_unit").html(tmp[0]);
        $("span.force_unit").html(tmp[2]);
        $("span.weight_unit").html(tmp[4])
        $("select#type").change();
        if ($("input#approx_dist").val()!="")   $("input#approx_dist").val(+(($("input#approx_dist").val() * 25.4**(tmp[0]=="in"?-1:1)).toFixed(dist_decimals)));
    });
    $("input[type=radio][name=units]").change();
    
    // Switch forward/backward calculation
    $("input[type=radio][name=driving]").change(function(){
        $("div.geometry div.field").hide();
        switch( $("input[type=radio][name=driving]:checked").attr("id") ){
            case "by_links":
                $("div.bylinks-in, div.bylinks-out").show();
                $("div.bylinks-in input").prop("disabled", false);
                $("div.bylinks-out input").prop("disabled", true);
                break;
            case "by_dist":
                $("div.bydist-in, div.bydist-out").show();
                $("div.bydist-in input").prop("disabled", false);
                $("div.bydist-out input").prop("disabled", true);
                $("input#approx_dist").val($("input#dist").val());
                break;
        }
    });

    // Run calculation
    $("input, select").change(function(){
        switch( $("input[type=radio][name=driving]:checked").attr("id") ){
            case "by_links":
                var target = parseInt($("input#links").val());
                var D = target*pitch/2;
                var lastD, lastD2, alpha, L, current = NaN, last, dydx;
                do {
                    lastD2 = lastD;
                    lastD = D;
                    if (Number.isNaN(current)) {}
                    else if (Number.isNaN(last)) { D = D + pitch/10*Math.sign(target-current); }
                    else { dydx = (current-last)/(lastD-lastD2); D = D - (current-target)/dydx; }
                    alpha = Math.acos((diam2 - diam1) / (2*D));
                    L = Math.sqrt(D**2 - (diam1/2 - diam2/2)**2);
                    last = current;
                    current = (2*L + diam1*alpha + diam2*(Math.PI-alpha))/pitch;
                } while (Math.abs(target - current) > 0.001);
                break;
            case "by_dist":
                var D = parseFloat($("input#approx_dist").val());
                var mod = parseInt($("input#round_to").val()=="" ? 1 : $("input#round_to").val());
                var lastD = NaN, lastD2, alpha, L, current, last, target = NaN, dydx;
                do {
                    alpha = Math.acos((diam2 - diam1) / (2*D));
                    L = Math.sqrt(D**2 - (diam1/2 - diam2/2)**2);
                    last = current;
                    current = (2*L + diam1*alpha + diam2*(Math.PI-alpha))/pitch;
                    lastD2 = lastD;
                    lastD = D;
                    if (Number.isNaN(target)) {
                        switch ($("select#round").val()) {
                            case "Nearest":
                                target = Math.round(current / mod) * mod;
                                break;
                            case "Up":
                                target = Math.ceil(current / mod) * mod;
                                break;
                            case "Down":
                                target = Math.floor(current / mod) * mod;
                                break;
                        }
                    }
                    if (Number.isNaN(lastD2)) { D = D + pitch/10*Math.sign(target-current); }
                    else { dydx = (current-last)/(lastD-lastD2); D = D - (current-target)/dydx; }
    
                } while (Math.abs(target - current) > 0.001);
                $("input#links").val(target);
                break;
        }
        $("input#dist").val(+(D.toFixed(dist_decimals)));
        $("input#chain_length").val(+((target * pitch).toFixed(dist_decimals)));
        $("input#clearance").val(+((D - (diam1+diam2)/2).toFixed(dist_decimals)));
    });

});