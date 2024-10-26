var current_cc, unit = 1;

$(function(){

    $("input[name=current]").on("change", function(){
        $("div.input").hide();
        $("div." + $("input[name=current]:checked").prop("id")).show();
    });
    $("input[name=current]").trigger("change");

    $("input[name=current], select[id$=_cc-u]").on("change", () => {
        let el = $(`div.${$("input[name=current]:checked").prop("id")} select[id$=_cc-u]`);
        unit = el.val();
        $(".unit").html(`C-C (${el.children("option:selected").text().substr(0,2)})`);
    });

    $("input#gears, div.gears input, div.gears select").on("change", function(){
        let gear1 = parseInt($("input#g1").val());
        let gear2 = parseInt($("input#g2").val());
        let dp = parseInt($("input#g_dp").val());
        let D = (gear1+gear2)/(2*dp);
        if (!isNaN(D)) {
            $("input#g_cc").val(+((D / $("select#g_cc-u").val()).toFixed(3)));
            if ($("input[name=current]:checked").prop("id") === "gears")
                current_cc = D;
        } else
            current_cc = 0;
    });

    $("input#belt, div.belt input, div.belt select").on("change", function(){
        let pitch = $("input#pitch").val() * $("select#pitch-u").val();
        let diam1 = $("input#p1").val() * pitch / Math.PI;
        let diam2 = $("input#p2").val() * pitch / Math.PI;
        let target = parseInt($("input#links").val());
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
            $("input#belt_cc").val(+((D / $("select#belt_cc-u").val()).toFixed(3)));
            if ($("input[name=current]:checked").prop("id") === "belt")
                current_cc = D;
        } else
            current_cc = 0;
    });

    $("input#dist, input#dist_cc").on("change", () => 
        current_cc = $("input#dist_cc").val() * $("select#dist_cc-u").val()
    );

    $("input, select").on("change", calculate);

});

function calculate(){
    let cc_dev = $("input#dist_dev").val() * $("select#dist_dev-u").val();
    let min_cc = current_cc - cc_dev;
    let max_cc = current_cc + cc_dev;
    let min_ratio = $("input#ratio").val() * (1 - $("input#ratio_dev").val()/100);
    let max_ratio = $("input#ratio").val() * (1 + $("input#ratio_dev").val()/100);

    let options = [];
    // gears
    if ($("input#g_enable").prop("checked")) {
        for (let A = parseInt($("input#g_min").val()); A <= Math.min(parseInt($("input#g_max").val()), current_cc*40); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#g_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#g_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let cc = (A+B)/40;
                if (cc >= min_cc && cc <= max_cc)
                    options.push(["Gears", A, B, B/A, cc, ""]);
            }
        }
    }
    // 3mm belt
    if ($("input#p3_enable").prop("checked")) {
        for (let A = parseInt($("input#p3_min").val()); A <= Math.min(parseInt($("input#p3_max").val()), current_cc*Math.PI/(3/25.4)); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#p3_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#p3_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let out = belt_cc(3/25.4, A, B, current_cc);
                if (out[0] >= min_cc && out[0] <= max_cc)
                    options.push(["3mm Belt", A, B, B/A, out[0], out[1]]);
            }
        }
    }
    // 5mm belt
    if ($("input#p5_enable").prop("checked")) {
        for (let A = parseInt($("input#p5_min").val()); A <= Math.min(parseInt($("input#p5_max").val()), current_cc*Math.PI/(5/25.4)); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#p5_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#p5_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let out = belt_cc(5/25.4, A, B, current_cc);
                if (out[0] >= min_cc && out[0] <= max_cc)
                    options.push(["5mm Belt", A, B, B/A, out[0], out[1]]);
            }
        }
    }
    // #25 chain
    if ($("input#s25_enable").prop("checked")) {
        for (let A = parseInt($("input#s25_min").val()); A <= Math.min(parseInt($("input#s25_max").val()), current_cc*Math.PI/0.25); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#s25_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#s25_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let out = belt_cc(0.25, A, B, current_cc);
                if (out[0] >= min_cc && out[0] <= max_cc)
                    options.push(["#25 Chain", A, B, B/A, out[0], out[1]]);
            }
        }
    }
    // #35 chain
    if ($("input#s35_enable").prop("checked")) {
        for (let A = parseInt($("input#s35_min").val()); A <= Math.min(parseInt($("input#s35_max").val()), current_cc*Math.PI/0.375); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#s35_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#s35_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let out = belt_cc(0.375, A, B, current_cc);
                if (out[0] >= min_cc && out[0] <= max_cc)
                    options.push(["#35 Chain", A, B, B/A, out[0], out[1]]);
            }
        }
    }

    options = options.sort((a, b) => Math.abs(a[4]-current_cc) - Math.abs(b[4]-current_cc));
    console.log(options);

    $("tbody").html("");
    options.forEach(el => 
        $("tbody").append(
            `<tr>
                <td>${el[0]}</td>
                <td>${el[1]}</td>
                <td>${el[2]}</td>
                <td>${+(el[3].toFixed(2))} : 1</td>
                <td>${+((el[4] / unit).toFixed(3))}</td>
                <td>${el[5]==="" ? "" : Math.round(el[5])}</td>
            </tr>`
        )
    );
    if (options.length === 0)
        $("tbody").html("<tr><td colspan='6'>No options found</td></tr>");
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