var friction = {
    "Steel": {
        "Steel": [0.2, 0.14],
        "Bronze": [0.1, 0.1]
    },
    "Bronze": {
        "Steel": [0.19, 0.13],
        "Bronze": [0.05, 0.05]
    },
    "Brass": {
        "Steel": [0.17, 0.12],
        "Bronze": [NaN, NaN]
    },
    "Cast Iron": {
        "Steel": [0.2, 0.14],
        "Bronze": [0.07, 0.07]
    }
}

$(document).ready(function(){

    $("select#diameter-units").change(() => $("span.pitch").text($("select#diameter-units option:selected").text()));

    $("div#params, div#material").find("input, select").change(function(){
        let d = $("input#diameter").val() * $("select#diameter-units").val();
        let p = $("input#pitch").val() * $("select#diameter-units").val();
        let dp = d - p/2;
        let n = $("input#starts").val();
        let a = $("input#angle").val() / 2 * Math.PI / 180;
        let mu = friction[$("select#nut-material").val()][$("select#screw-material").val()][$("input#lube").prop("checked") ? 1 : 0];
        if (d==0 || p==0 || n=="" || a==0) return;
        $("input#eff").val(+(( n*p/(Math.PI*dp) * (Math.PI*dp*Math.cos(a)-mu*n*p)/(Math.PI*mu*dp+n*p*Math.cos(a)) * 100 ).toFixed(1)));
        $("input#equiv_radius").val(+(( n*p/(2*Math.PI) / $("select#diameter-units").val() ).toFixed(4)));
        $("input#backdrive").val( (n*p*Math.cos(a) > Math.PI*mu*dp) ? "Yes" : "No" );
    });

    $("div#forces input[type=radio]").change(() => {
        let d = $("input#diameter").val() * $("select#diameter-units").val();
        let p = $("input#pitch").val() * $("select#diameter-units").val();
        let dp = d - p/2;
        let n = $("input#starts").val();
        let a = $("input#angle").val() / 2 * Math.PI / 180;
        let mu = friction[$("select#nut-material").val()][$("select#screw-material").val()][$("input#lube").prop("checked") ? 1 : 0];
        if (d==0 || p==0 || n=="" || a==0) return;
        switch ($("div#forces input[type=radio]:checked").prop("id")) {
            case "force-check": {
                let F = $("input#force").val() * $("select#force-units").val();
                let Tr = F*dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p);
                let Tl = F*dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p);
                $("input#raise_torque").val(+(( Tr / $("select#raise_torque-units").val() ).toFixed(2)));
                $("input#lower_torque").val(+(( Tl / $("select#lower_torque-units").val() ).toFixed(2)));
                $("input#raise_load").val(+(( Tr * (2*Math.PI)/(n*p) / $("select#raise_load-units").val() ).toFixed(2)));
                $("input#lower_load").val(+(( Tl * (2*Math.PI)/(n*p) / $("select#lower_load-units").val() ).toFixed(2)));
            } break;
            case "raise_torque-check": {
                let Tr = $("input#raise_torque").val() * $("select#raise_torque-units").val();
                let F = Tr / (dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p));
                let Tl = F*dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p);
                $("input#force").val(+(( F / $("select#force-units").val() ).toFixed(2)));
                $("input#lower_torque").val(+(( Tl / $("select#lower_torque-units").val() ).toFixed(2)));
                $("input#raise_load").val(+(( Tr * (2*Math.PI)/(n*p) / $("select#raise_load-units").val() ).toFixed(2)));
                $("input#lower_load").val(+(( Tl * (2*Math.PI)/(n*p) / $("select#lower_load-units").val() ).toFixed(2)));
            } break;
            case "lower_torque-check": {
                let Tl = $("input#lower_torque").val() * $("select#lower_torque-units").val();
                let F = Tl / (dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p));
                let Tr = F*dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p);
                $("input#force").val(+(( F / $("select#force-units").val() ).toFixed(2)));
                $("input#raise_torque").val(+(( Tr / $("select#raise_torque-units").val() ).toFixed(2)));
                $("input#raise_load").val(+(( Tr * (2*Math.PI)/(n*p) / $("select#raise_load-units").val() ).toFixed(2)));
                $("input#lower_load").val(+(( Tl * (2*Math.PI)/(n*p) / $("select#lower_load-units").val() ).toFixed(2)));
            } break;
            case "raise_load-check": {
                let Fr = $("input#raise_load").val() * $("select#raise_load-units").val();
                let Tr = Fr * (n*p)/(2*Math.PI);
                let F = Tr / (dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p));
                let Tl = F*dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p);
                $("input#force").val(+(( F / $("select#force-units").val() ).toFixed(2)));
                $("input#raise_torque").val(+(( Tr / $("select#raise_torque-units").val() ).toFixed(2)));
                $("input#lower_torque").val(+(( Tl / $("select#lower_torque-units").val() ).toFixed(2)));
                $("input#lower_load").val(+(( Tl * (2*Math.PI)/(n*p) / $("select#lower_load-units").val() ).toFixed(2)));
            } break;
            case "lower_load-check": {
                let Fl = $("input#lower_load").val() * $("select#lower_load-units").val();
                let Tl = Fl * (n*p)/(2*Math.PI);
                let F = Tl / (dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p));
                let Tr = F*dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p);
                $("input#force").val(+(( F / $("select#force-units").val() ).toFixed(2)));
                $("input#raise_torque").val(+(( Tr / $("select#raise_torque-units").val() ).toFixed(2)));
                $("input#lower_torque").val(+(( Tl / $("select#lower_torque-units").val() ).toFixed(2)));
                $("input#raise_load").val(+(( Tr * (2*Math.PI)/(n*p) / $("select#raise_load-units").val() ).toFixed(2)));
            } break;
        }
    });

    $("div#speeds input[type=radio]").change(() => {
        let lead = ($("input#pitch").val() * $("select#diameter-units").val()) * $("input#starts").val();
        switch ($("div#speeds input[type=radio]:checked").prop("id")) {
            case "lin_speed-check": {
                let v = $("input#lin_speed").val() * $("select#lin_speed-units").val();
                console.log(v);
                $("input#rot_speed").val(+(( v / lead / $("select#rot_speed-units").val() ).toFixed(0)));
            } break;
            case "rot_speed-check": {
                let w = $("input#rot_speed").val() * $("select#rot_speed-units").val();
                console.log(w);
                $("input#lin_speed").val(+(( w * lead / $("select#lin_speed-units").val() ).toFixed(2)));
            } break;
        }
    });

    $("input[type=number]").change(function(){
        $(this).siblings("input[type=radio]").prop("checked", true).change();
    });

    $("input[type=radio]").change(() => {
        $("div#forces, div#speeds").find("input[type=number]").css("background-color", "white");
        $("input[type=radio]:checked").siblings("input[type=number]").css("background-color", "var(--selected)");
    });

    $("button.insert").click(() => {
        window.open(`mechanism.html?gearbox_efficiency=${$("input#eff").val()}&radius-units=${$("select#diameter-units").val()}&radius=${$("input#equiv_radius").val()}`, "_blank");
    });

    $("select#diameter-units").change(function(){
        let input = $("input#pitch");
        if (input.val() != "") {
            let old_val = input.val();
            if (input.data("full-val") && +(+(input.data("full-val") || 0).toFixed(3)) == old_val)
                old_val = input.data("full-val");
            console.log(old_val);
            let new_val = old_val * $(this).data("unit-factor") / $(this).val();
            console.log($(this).data("unit-factor"));
            console.log(new_val);
            input.val(+(new_val.toFixed(3))).change();
            input.data("full-val", new_val)
        }
    });
    let change_events = $._data($("select#diameter-units")[0], "events").change;
    change_events.unshift(change_events.pop());

});