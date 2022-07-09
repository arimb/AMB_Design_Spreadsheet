var current_cc;

$(document).ready(function(){

    $("input[name=current]").change(function(){
        $("div.input").css("display", "none");
        $("div.in-" + $("input[name=current]:checked").prop("id")).css("display", "flex");
    });
    $("input[name=current]").change();

    $("input#gears, div.in-gears input, div.in-gears select").change(function(){
        let gear1 = parseInt($("input#in-gear1").val());
        let gear2 = parseInt($("input#in-gear2").val());
        let dp = parseInt($("input#in-gear_dp").val());
        let D = (gear1+gear2)/(2*dp);
        if (!isNaN(D)) {
            $("input#in-gear_cc").val(+((D / $("select#in-gear_cc-units").val()).toFixed(3)));
            if ($("input[name=current]:checked").prop("id") == "gears")
                current_cc = D;
        }
    });

    $("input#belt, div.in-belt input, div.in-belt select").change(function(){
        let pitch = $("input#in-belt_pitch").val() * $("select#in-belt_pitch-units").val();
        let diam1 = $("input#in-pulley1").val() * pitch / Math.PI;
        let diam2 = $("input#in-pulley2").val() * pitch / Math.PI;
        let target = parseInt($("input#in-links").val());
        let D = target*pitch/2;
        let lastD, lastD2, alpha, L, current = NaN, last, dydx;
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
        if (!isNaN(D)) {
            $("input#in-belt_cc").val(+((D / $("select#in-belt_cc-units").val()).toFixed(3)));
            if ($("input[name=current]:checked").prop("id") == "belt")
                current_cc = D;
        }
    });



});