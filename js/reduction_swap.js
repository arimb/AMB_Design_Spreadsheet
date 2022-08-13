var current_cc, unit = 1;

$(document).ready(function(){

    $("input[name=current]").change(function(){
        $("div.input").hide();
        $("div." + $("input[name=current]:checked").prop("id")).show();
    });
    $("input[name=current]").change();

    $("input[name=current], select[id$=_cc-units]").change(() => {
        let el = $(`div.${$("input[name=current]:checked").prop("id")} select[id$=_cc-units]`);
        unit = el.val();
        $(".unit").html(`C-C (${el.children("option:selected").text().substr(0,2)})`);
    });

    $("input#gears, div.gears input, div.gears select").change(function(){
        let gear1 = parseInt($("input#gear1").val());
        let gear2 = parseInt($("input#gear2").val());
        let dp = parseInt($("input#gear_dp").val());
        let D = (gear1+gear2)/(2*dp);
        if (!isNaN(D)) {
            $("input#gear_cc").val(+((D / $("select#gear_cc-units").val()).toFixed(3)));
            if ($("input[name=current]:checked").prop("id") == "gears")
                current_cc = D;
        } else
            current_cc = 0;
    });

    $("input#belt, div.belt input, div.belt select").change(function(){
        let pitch = $("input#belt_pitch").val() * $("select#belt_pitch-units").val();
        let diam1 = $("input#pulley1").val() * pitch / Math.PI;
        let diam2 = $("input#pulley2").val() * pitch / Math.PI;
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
            $("input#belt_cc").val(+((D / $("select#belt_cc-units").val()).toFixed(3)));
            if ($("input[name=current]:checked").prop("id") == "belt")
                current_cc = D;
        } else
            current_cc = 0;
    });

    $("input#custom, input#custom_cc").change(() => 
        current_cc = $("input#custom_cc").val() * $("select#custom_cc-units").val()
    );

    $("input, select").change(calculate);

});

function calculate(){
    let cc_dev = $("input#dist_dev").val() * $("select#dist_dev-units").val();
    let min_cc = current_cc - cc_dev;
    let max_cc = current_cc + cc_dev;
    let min_ratio = $("input#ratio").val() * (1 - $("input#ratio_dev").val()/100);
    let max_ratio = $("input#ratio").val() * (1 + $("input#ratio_dev").val()/100);

    let options = [];
    // gears
    if ($("input#gear_enable").prop("checked")) {
        for (let A = parseInt($("input#gear_min").val()); A <= Math.min(parseInt($("input#gear_max").val()), current_cc*40); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#gear_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#gear_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let cc = (A+B)/40;
                if (cc >= min_cc && cc <= max_cc)
                    options.push(["Gears", A, B, B/A, cc, ""]);
            }
        }
    }
    // 3mm belt
    if ($("input#pulley3_enable").prop("checked")) {
        for (let A = parseInt($("input#pulley3_min").val()); A <= Math.min(parseInt($("input#pulley3_max").val()), current_cc*Math.PI/(3/25.4)); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#pulley3_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#pulley3_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let out = belt_cc(3/25.4, A, B, current_cc);
                if (out[0] >= min_cc && out[0] <= max_cc)
                    options.push(["3mm Belt", A, B, B/A, out[0], out[1]]);
            }
        }
    }
    // 5mm belt
    if ($("input#pulley5_enable").prop("checked")) {
        for (let A = parseInt($("input#pulley5_min").val()); A <= Math.min(parseInt($("input#pulley5_max").val()), current_cc*Math.PI/(5/25.4)); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#pulley5_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#pulley5_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let out = belt_cc(5/25.4, A, B, current_cc);
                if (out[0] >= min_cc && out[0] <= max_cc)
                    options.push(["5mm Belt", A, B, B/A, out[0], out[1]]);
            }
        }
    }
    // #25 chain
    if ($("input#sprocket25_enable").prop("checked")) {
        for (let A = parseInt($("input#sprocket25_min").val()); A <= Math.min(parseInt($("input#sprocket25_max").val()), current_cc*Math.PI/0.25); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#sprocket25_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#sprocket25_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let out = belt_cc(0.25, A, B, current_cc);
                if (out[0] >= min_cc && out[0] <= max_cc)
                    options.push(["#25 Chain", A, B, B/A, out[0], out[1]]);
            }
        }
    }
    // #35 chain
    if ($("input#sprocket35_enable").prop("checked")) {
        for (let A = parseInt($("input#sprocket35_min").val()); A <= Math.min(parseInt($("input#sprocket35_max").val()), current_cc*Math.PI/0.375); A++) {
            let minB = Math.max(Math.ceil(A * min_ratio), parseInt($("input#sprocket35_min").val()));
            let maxB = Math.min(Math.floor(A * max_ratio), parseInt($("input#sprocket35_max").val()));
            for (let B = minB; B <= maxB; B++) {
                let out = belt_cc(0.375, A, B, current_cc);
                if (out[0] >= min_cc && out[0] <= max_cc)
                    options.push(["#35 Chain", A, B, B/A, out[0], out[1]]);
            }
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
                <td>${+((el[4] / unit).toFixed(3))}</td>
                <td>${el[5]=="" ? "" : Math.round(el[5])}</td>
            </tr>`
        )
    );
    if (options.length == 0)
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