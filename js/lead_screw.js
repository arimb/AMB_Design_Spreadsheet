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

    $("select#od-u").change(() => $("span.pitch").text($("select#od-u option:selected").text()));

    $("div#params, div#material").find("input, select").change(function(){
        let d = $("input#od").val() * $("select#od-u").val();
        let p = $("input#pitch").val() * $("select#od-u").val();
        let dp = d - p/2;
        let n = $("input#starts").val();
        let a = $("input#angle").val() / 2 * Math.PI / 180;
        let mu = friction[$("select#nut-mat").val()][$("select#screw-mat").val()][$("input#lube").prop("checked") ? 1 : 0];
        if (d==0 || p==0 || n=="" || a==0) return;
        $("input#eff").val(+(( n*p/(Math.PI*dp) * (Math.PI*dp*Math.cos(a)-mu*n*p)/(Math.PI*mu*dp+n*p*Math.cos(a)) * 100 ).toFixed(1)));
        $("input#equiv_radius").val(+(( n*p/(2*Math.PI) / $("select#od-u").val() ).toFixed(4)));
        $("input#backdrive").val( (n*p*Math.cos(a) > Math.PI*mu*dp) ? "Yes" : "No" );
    });

    $("div#forces input[type=radio]").change(() => {
        let d = $("input#od").val() * $("select#od-u").val();
        let p = $("input#pitch").val() * $("select#od-u").val();
        let dp = d - p/2;
        let n = $("input#starts").val();
        let a = $("input#angle").val() / 2 * Math.PI / 180;
        let mu = friction[$("select#nut-mat").val()][$("select#screw-mat").val()][$("input#lube").prop("checked") ? 1 : 0];
        if (d==0 || p==0 || n=="" || a==0) return;
        switch ($("div#forces input[type=radio]:checked").prop("id")) {
            case "force-c": {
                let F = $("input#force").val() * $("select#force-u").val();
                let Tr = F*dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p);
                let Tl = F*dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p);
                $("input#traise").val(+(( Tr / $("select#traise-u").val() ).toFixed(2)));
                $("input#tlower").val(+(( Tl / $("select#tlower-u").val() ).toFixed(2)));
                $("input#lraise").val(+(( Tr * (2*Math.PI)/(n*p) / $("select#lraise-u").val() ).toFixed(2)));
                $("input#llower").val(+(( Tl * (2*Math.PI)/(n*p) / $("select#llower-u").val() ).toFixed(2)));
            } break;
            case "traise-c": {
                let Tr = $("input#traise").val() * $("select#traise-u").val();
                let F = Tr / (dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p));
                let Tl = F*dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p);
                $("input#force").val(+(( F / $("select#force-u").val() ).toFixed(2)));
                $("input#tlower").val(+(( Tl / $("select#tlower-u").val() ).toFixed(2)));
                $("input#lraise").val(+(( Tr * (2*Math.PI)/(n*p) / $("select#lraise-u").val() ).toFixed(2)));
                $("input#llower").val(+(( Tl * (2*Math.PI)/(n*p) / $("select#llower-u").val() ).toFixed(2)));
            } break;
            case "tlower-c": {
                let Tl = $("input#tlower").val() * $("select#tlower-u").val();
                let F = Tl / (dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p));
                let Tr = F*dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p);
                $("input#force").val(+(( F / $("select#force-u").val() ).toFixed(2)));
                $("input#traise").val(+(( Tr / $("select#traise-u").val() ).toFixed(2)));
                $("input#lraise").val(+(( Tr * (2*Math.PI)/(n*p) / $("select#lraise-u").val() ).toFixed(2)));
                $("input#llower").val(+(( Tl * (2*Math.PI)/(n*p) / $("select#llower-u").val() ).toFixed(2)));
            } break;
            case "lraise-c": {
                let Fr = $("input#lraise").val() * $("select#lraise-u").val();
                let Tr = Fr * (n*p)/(2*Math.PI);
                let F = Tr / (dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p));
                let Tl = F*dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p);
                $("input#force").val(+(( F / $("select#force-u").val() ).toFixed(2)));
                $("input#traise").val(+(( Tr / $("select#traise-u").val() ).toFixed(2)));
                $("input#tlower").val(+(( Tl / $("select#tlower-u").val() ).toFixed(2)));
                $("input#llower").val(+(( Tl * (2*Math.PI)/(n*p) / $("select#llower-u").val() ).toFixed(2)));
            } break;
            case "llower-c": {
                let Fl = $("input#llower").val() * $("select#llower-u").val();
                let Tl = Fl * (n*p)/(2*Math.PI);
                let F = Tl / (dp/2 * (Math.PI*mu*dp - n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) + mu*n*p));
                let Tr = F*dp/2 * (Math.PI*mu*dp + n*p*Math.cos(a))/(Math.PI*dp*Math.cos(a) - mu*n*p);
                $("input#force").val(+(( F / $("select#force-u").val() ).toFixed(2)));
                $("input#traise").val(+(( Tr / $("select#traise-u").val() ).toFixed(2)));
                $("input#tlower").val(+(( Tl / $("select#tlower-u").val() ).toFixed(2)));
                $("input#lraise").val(+(( Tr * (2*Math.PI)/(n*p) / $("select#lraise-u").val() ).toFixed(2)));
            } break;
        }
    });

    $("div#speeds input[type=radio]").change(() => {
        let lead = ($("input#pitch").val() * $("select#od-u").val()) * $("input#starts").val();
        switch ($("div#speeds input[type=radio]:checked").prop("id")) {
            case "lin-c": {
                let v = $("input#lin").val() * $("select#lin-u").val();
                console.log(v);
                $("input#rot").val(+(( v / lead / $("select#rot-u").val() ).toFixed(0)));
            } break;
            case "rot-c": {
                let w = $("input#rot").val() * $("select#rot-u").val();
                console.log(w);
                $("input#lin").val(+(( w * lead / $("select#lin-u").val() ).toFixed(2)));
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
        window.open(`mechanism.html?gbx_eff=${$("input#eff").val()}&radius-u=${$("select#od-u").val()}&radius=${$("input#equiv_radius").val()}`, "_blank");
    });

    $("select#od-u").change(function(){
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
    let change_events = $._data($("select#od-u")[0], "events").change;
    change_events.unshift(change_events.pop());

});