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
            else if (Number.isNaN(last)) { D = D + pitch/10*Math.sign(teeth-current); }
            else { dydx = (current-last)/(lastD-lastD2); D = D - (current-teeth)/dydx; }
            alpha = Math.acos((diam2 - diam1) / (2*D));
            L = Math.sqrt(D**2 - (diam1/2 - diam2/2)**2);
            last = current;
            current = (2*L + diam1*alpha + diam2*(Math.PI-alpha))/pitch;
        } while (Math.abs(teeth - current) > 0.001);
        if (!isNaN(D)) {
            $("input#in-belt_cc").val(+((D / $("select#in-belt_cc-units").val()).toFixed(3)));
            if ($("input[name=current]:checked").prop("id") == "belt")
                current_cc = D;
        }
    });

    $("input#custom, input#custom_cc").change(() => current_cc = $("input#in-custom_cc").val() * $("select#in-custom_cc-units").val());

    $("input, select").change(calculate);

});

function calculate(){
    let cc_dev = $("input#out-dist_dev").val() * $("select#out-dist_dev-units").val();
    let min_cc = current_cc - cc_dev;
    let max_cc = current_cc + cc_dev;
    let min_ratio = $("input#out-ratio").val() * (1 - $("input#out-ratio_dev").val()/100);
    let max_ratio = $("input#out-ratio").val() * (1 + $("input#out-ratio_dev").val()/100);
    console.log(min_cc, max_cc, min_ratio, max_ratio);

    let options = [];
    // gears
    for (let A = parseInt($("input#out-gear_min").val()); A <= Math.min(parseInt($("input#out-gear_max").val()), current_cc*40); A++) {
        console.log(A);
        let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#out-gear_min").val()));
        let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#out-gear_max").val()));
        console.log(minB, maxB);
        for (let B = minB; B <= maxB; B++) {
            let cc = (A+B)/40;
            if (cc >= min_cc && cc <= max_cc)
                options.push(["Gears", A, B, B/A, cc, ""]);
        }
    }
    // 3mm belt
    for (let A = parseInt($("input#out-pulley3_min").val()); A <= Math.min(parseInt($("input#out-pulley3_max").val()), current_cc*Math.PI/(3/25.4)); A++) {
        let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#out-pulley3_min").val()));
        let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#out-pulley3_max").val()));
        for (let B = minB; B <= maxB; B++) {
            let out = belt_cc(3/25.4, A, B, current_cc);
            if (out[0] >= min_cc && out[0] <= max_cc)
                options.push(["3mm Belt", A, B, B/A, out[0], out[1]]);
        }
    }
    // 5mm belt
    for (let A = parseInt($("input#out-pulley5_min").val()); A <= Math.min(parseInt($("input#out-pulley5_max").val()), current_cc*Math.PI/(5/25.4)); A++) {
        let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#out-pulley5_min").val()));
        let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#out-pulley5_max").val()));
        for (let B = minB; B <= maxB; B++) {
            let out = belt_cc(5/25.4, A, B, current_cc);
            if (out[0] >= min_cc && out[0] <= max_cc)
                options.push(["5mm Belt", A, B, B/A, out[0], out[1]]);
        }
    }
    // #25 chain
    for (let A = parseInt($("input#out-sprocket25_min").val()); A <= Math.min(parseInt($("input#out-sprocket25_max").val()), current_cc*Math.PI/0.25); A++) {
        let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#out-sprocket25_min").val()));
        let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#out-sprocket25_max").val()));
        for (let B = minB; B <= maxB; B++) {
            let out = belt_cc(0.25, A, B, current_cc);
            if (out[0] >= min_cc && out[0] <= max_cc)
                options.push(["#25 Chain", A, B, B/A, out[0], out[1]]);
        }
    }
    // #35 chain
    for (let A = parseInt($("input#out-sprocket35_min").val()); A <= Math.min(parseInt($("input#out-sprocket35_max").val()), current_cc*Math.PI/0.375); A++) {
        let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#out-sprocket35_min").val()));
        let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#out-sprocket35_max").val()));
        for (let B = minB; B <= maxB; B++) {
            let out = belt_cc(0.375, A, B, current_cc);
            if (out[0] >= min_cc && out[0] <= max_cc)
                options.push(["#35 Chain", A, B, B/A, out[0], out[1]]);
        }
    }

    options = options.sort((a, b) => Math.abs(a[4]-current_cc) - Math.abs(b[4]-current_cc));

    $("tbody").html("");
    options.forEach(el => 
        $("tbody").append(
            `<tr>
                <td>${el[0]}</td>
                <td>${el[1]}</td>
                <td>${el[2]}</td>
                <td>${+(el[3].toFixed(2))} : 1</td>
                <td>${+(el[4].toFixed(3))}</td>
                <td>${el[5]=="" ? "" : Math.round(el[5])}</td>
            </tr>`
        )
    );
}

function belt_cc(pitch, pulley1, pulley2, approxD){
    var diam1 = pulley1 * pitch / Math.PI;
    var diam2 = pulley2 * pitch / Math.PI;
    var D = approxD;
    var lastD = NaN, lastD2, alpha, L, current, last, target = NaN, dydx;
    do {
        alpha = Math.acos((diam2 - diam1) / (2*D));
        L = Math.sqrt(D**2 - (diam1/2 - diam2/2)**2);
        last = current;
        current = (2*L + diam1*alpha + diam2*(Math.PI-alpha))/pitch;
        lastD2 = lastD;
        lastD = D;
        target = Math.round(current);
        if (Number.isNaN(lastD2)) { D = D + pitch/10*Math.sign(target-current); }
        else { dydx = (current-last)/(lastD-lastD2); D = D - (current-target)/dydx; }

    } while (Math.abs(target - current) > 0.001);
    return [D, current];
}