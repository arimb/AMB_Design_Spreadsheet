$(document).ready(function(){

    $("input#drag-e").change(() => { 
        $("input#drag-e").parent().nextAll().children("input,select").attr("disabled", !$("input#drag-e").prop("checked"));
    });

    $("input#hf-dir").change(() => {
        if ($("input#hf-dir").prop("checked")){
            $("img#up_arrow").show();
            $("img#down_arrow").hide();
        } else {
            $("img#up_arrow").hide();
            $("img#down_arrow").show();
        }
    }).change();
    $("img#up_arrow").click(() => $("input#hf-dir").prop("checked", false).change());
    $("img#down_arrow").click(() => $("input#hf-dir").prop("checked", true).change());
    
    $("input, select").change(update);
    $("input#h0").change();

});

function update(){
    var h0, v0, theta0, end_fcn, output
    $("input#dist, input#hf").css("background-color", "");
    switch ($("select#mode").val()) {
        case "1":   // Find Target Values by Target Distance
            $(".initial-driven, .target-distance-driven").find("*").addBack().attr("disabled", false);
            $(".target-height-driven").find("*").addBack().attr("disabled", true);
            
            // solve for target height and angle
            h0 = parseFloat($("input#h0").val() * $("select#h0-u").val());
            v0 = parseFloat($("input#v0").val() * $("select#v0-u").val());
            theta0 = parseFloat($("input#th0").val()) * Math.PI/180;
            end_fcn = `x[0] >= ${$("input#dist").val() * $("select#dist-u").val()}`;
            output = simulate(h0, v0, theta0, end_fcn);

            if (output[0].length > 1 && Math.abs(output[0][output[0].length-1][0] - $("input#dist").val() * $("select#dist-u").val()) < 0.1) {
                $("input#hf").val( +((output[0][output[0].length-1][1] / $("select#hf-u").val()).toFixed(3)) );
                // $("input#hf-dir").prop("checked", output[1][1] >= 0);
                $("input#thf").val( +((Math.atan2(output[1][1], output[1][0]) * 180/Math.PI).toFixed(2)) );
            } else {
                $("input#hf, input#thf").val("");
                if (output[0].length > 1)
                    $("input#dist").css("background-color", "#bd2d2d");
            }
            break;
        case "2":    // Find Target Values by Target Height
            $(".target-height-driven, .initial-driven").find("*").addBack().attr("disabled", false);
            $(".target-distance-driven").find("*").addBack().attr("disabled", true);
            
            // solve for target distance and angle
            h0 = parseFloat($("input#h0").val() * $("select#h0-u").val());
            v0 = parseFloat($("input#v0").val() * $("select#v0-u").val());
            theta0 = parseFloat($("input#th0").val()) * Math.PI/180;
            var hf = $("input#hf").val() * $("select#hf-u").val();
            end_fcn = $("input#hf-dir").prop("checked") ? `v[1]>=0 && x[1]>=${hf}` : `v[1]<=0 && x[1]<=${hf}`;
            output = simulate(h0, v0, theta0, end_fcn);

            if (Math.abs(output[0][output[0].length-1][1] - hf) <= 0.05) {
                $("input#dist").val( +((output[0][output[0].length-1][0] / $("select#dist-u").val()).toFixed(3)) );
                $("input#thf").val( +((Math.atan2(output[1][1], output[1][0]) * 180/Math.PI).toFixed(2)) );    
            } else {
                $("input#dist, input#thf").val("");
                if (output[0].length > 1)
                    $("input#hf").css("background-color", "#bd2d2d");
            }
            break;
        case "3":   // Find Initial Values
            $(".target-height-driven, .target-distance-driven").find("*").addBack().attr("disabled", false);
            $(".initial-driven").find("*").addBack().attr("disabled", true);

            var d = parseFloat($("input#dist").val() * $("select#dist-u").val());
            var thetaf = parseFloat($("input#thf").val() * Math.PI/180);
            h0 = parseFloat($("input#h0").val() * $("select#h0-u").val());
            var hf = parseFloat($("input#hf").val() * $("select#hf-u").val());
            
            theta0 = Math.atan(2*(hf-h0)/d - Math.tan(thetaf));
            v0 = Math.sqrt(9.8*d/Math.abs(Math.tan(theta0) - Math.tan(thetaf))) / Math.cos(theta0);
            end_fcn = `x[0] >= ${$("input#dist").val() * $("select#dist-u").val()}`;
            output = simulate(h0, v0, theta0, end_fcn);
            console.log(output);

            if (output[0].length==0 || Math.abs(output[0][output[0].length-1][0] - d) <= 0.05) {
                $("input#v0").val( +((v0 / $("select#v0-u").val()).toFixed(2)) );
                $("input#th0").val( +((theta0 * 180/Math.PI).toFixed(2)) );
            } else {
                $("input#v0, input#th0").val("");
            }
            break;
        }

    // Draw graph
    var max = Math.max(Math.max.apply(null, output[0].map(x => x[0])), Math.max.apply(null, output[0].map(x => x[1]))) / $("select#h0-u").val();
    if ($("input#obs-e").prop("checked")) {
        var obs_x = parseFloat($("input#obs_dist").val() * $("select#obs_dist-u").val() / $("select#h0-u").val());
        var obs_y = parseFloat($("input#obs_h").val() * $("select#obs_h-u").val() / $("select#h0-u").val());
    } else {
        var obs_x = 0, obs_y = 0;
    }

    $("canvas#graph").remove();
    if (output[0].length > 1) {
        $("span.warn").hide();
        $("div.graph").prepend('<canvas id="graph"></canvas>');
        var graph = new Chart("graph", {
            data: {
                labels: output[0].map(x => (x[0] / $("select#h0-u").val()).toFixed(2)),
                datasets: [{
                    type: "line",
                    data: output[0].map(x => x[1] / $("select#h0-u").val()),
                    borderColor: "black",
                    fill: false,
                    pointRadius: 0
                },{
                    type: "line",
                    data: [{x: obs_x, y: 0}, {x: obs_x, y: obs_y}],
                    borderColor: "red",
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                aspectRatio: 1,
                plugins: {
                    legend: {display: false}
                },
                scales: {
                    y: {
                        position: "left",
                        min: 0,
                        max: max,
                        ticks: {stepSize: 0.5, includeBounds: false}
                    },
                    x: {
                        type: "linear",
                        position: "bottom",
                        min: 0,
                        max: max,
                        ticks: {stepSize: 0.5}
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    } else $("span.warn").show();
    
}

function simulate(h0, v0, theta0, end_fcn) {
    var t = 0;
    var x = [0, h0];
    var v = [v0*Math.cos(theta0), v0*Math.sin(theta0)];
    const dt = 0.001;

    const drag = $("input#drag-e").prop("checked") && !$("input#drag-e").prop("disabled");
    const Cd = parseFloat($("input#cd").val());
    const r = $("input#diam").val() * $("select#diam-u").val() / 2;
    const m = $("input#mass").val() * $("select#mass-u").val();
    const w = $("input#rotation").val() * $("select#rotation-u").val();
    const rho = 1.2754; // kg/m^3
    if (!drag) {
        delete m;
        const m = 1;
    }
    
    var s, Cl, a;
    var traj = [];
    while (x[1] >= 0 && !eval(end_fcn)) {
        if (drag) {
            s = r*w/mag(v);
            Cl = s<0.1 ? 1.6*s : 0.6*s+0.1;
            a = [-Math.PI/2*rho*r**2*mag(v)/m*(Cl*v[1]+Cd*v[0]), Math.PI/2*rho*r**2*mag(v)/m*(Cl*v[0]-Cd*v[1]) - 9.8];
        } else {
            a = [0, -9.8];
        }
        
        v = [v[0]+dt*a[0], v[1]+dt*a[1]];
        x = [x[0]+dt*v[0]+dt**2*a[0]/2, x[1]+dt*v[1]+dt**2*a[1]/2];
        traj.push(x);
    }
    return [traj, v];
}

function mag(x) {
    return Math.sqrt(x[0]**2 + x[1]**2);
}

function angle(x) {
    return Math.atan2(x[1], x[0]) * 180/Math.PI;
}