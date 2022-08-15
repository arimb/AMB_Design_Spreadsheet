var dist_decimals = 2;
var units = {
    "imperial": ["in",25.4,"lbs",1,"lbs/ft",1],
    "metric": ["mm",1,"N",0.2228,"kg/m",0.671969]
};

var dimensions, pitch, diam1, diam2;

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
    request.open("GET", "ref/chain-belt.json", false);
    request.send();

    // Update belt/chain type
    $("select#type").change(() => {
        if($("select#type").val() == "Custom"){
            $("input#p").prop("disabled", false);
            $("div#dimensions input").val("");
            $(".belt").hide();
            $(".chain").show();
        }else{
            const tmp = units[$("select#p-u option:selected").prop("class")];
            pitch = dimensions[$("select#type").val()][0] / tmp[1];
            $("input#p").val(+(pitch.toFixed(dist_decimals)));
            $("input#width").val(+((dimensions[$("select#type").val()][1] / tmp[1]).toFixed(dist_decimals)));
            $("input#thickness").val(+((dimensions[$("select#type").val()][2] / tmp[1]).toFixed(dist_decimals)));
            $("input#adder").val(+((dimensions[$("select#type").val()][3] / tmp[1]).toFixed(dist_decimals)));
            $("input#weight").val(+((dimensions[$("select#type").val()][4] / tmp[5]).toFixed(3)));
            $("input#load_rating").val(+((dimensions[$("select#type").val()][6] / tmp[3]).toFixed(0)));
            $("input#p").prop("disabled", true);
            if (dimensions[$("select#type").val()][5] == "b") {
                $(".belt").show();
                $(".chain").hide();
            } else {
                $(".belt").hide();
                $(".chain").show();
            }
        }
        $("input#t1, input#t2").change();
    });
    $("input#p").change(() => pitch = $("input#p").val() );

    // Update pitch diameters
    $("input#t1").change(function(){
        diam1 = $("input#t1").val() * pitch / Math.PI;
        $("input#diam1").val(+(diam1.toFixed(dist_decimals)));
    });
    $("input#t2").change(function(){
        diam2 = $("input#t2").val() * pitch / Math.PI;
        $("input#diam2").val(+(diam2.toFixed(dist_decimals)));
    });

    // Switch units
    $("select#p-u").change(function(){
        const tmp = units[$("select#p-u option:selected").prop("class")];
        dist_decimals = tmp[0]=="in" ? 3 : 2;
        $("span.dist_unit").html(tmp[0]);
        $("span.force_unit").html(tmp[2]);
        $("span.weight_unit").html(tmp[4])
        $("select#type").change();
        if ($("input#approx").val()!="")   $("input#approx").val(+(($("input#approx").val() * 25.4**(tmp[0]=="in"?-1:1)).toFixed(dist_decimals)));
    });
    $("select#p-u").change();
    
    // Switch forward/backward calculation
    $("input[type=radio][name=driving]").change(function(){
        $("div.geometry div.field").hide();
        switch( $("input[type=radio][name=driving]:checked").attr("id") ){
            case "by_ls":
                $("div.bylinks-in, div.bylinks-out").show();
                $("div.bylinks-in input").prop("disabled", false);
                $("div.bylinks-out input").prop("disabled", true);
                break;
            case "by_d":
                $("div.bydist-in, div.bydist-out").show();
                $("div.bydist-in input").prop("disabled", false);
                $("div.bydist-out input").prop("disabled", true);
                $("input#approx").val($("input#dist").val());
                break;
        }
    });

    // Run calculation
    $("input, select").change(function(){
        switch( $("input[type=radio][name=driving]:checked").attr("id") ){
            case "by_ls":
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
            case "by_d":
                var D = parseFloat($("input#approx").val());
                var mod = parseInt($("input#mod").val()=="" ? 1 : $("input#mod").val());
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