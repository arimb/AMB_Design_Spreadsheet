$(document).ready(function(){

    $("input#drag-enable").change(() => { 
        $("input#drag-enable").parent().nextAll().children("input,select").attr("disabled", !$("input#drag-enable").prop("checked"));
    });

    $("input#target_height-direction").change(() => {
        if ($("input#target_height-direction").prop("checked")){
            $("img#up_arrow").show();
            $("img#down_arrow").hide();
        } else {
            $("img#up_arrow").hide();
            $("img#down_arrow").show();
        }
    }).change();
    $("img#up_arrow").click(() => $("input#target_height-direction").prop("checked", false).change());
    $("img#down_arrow").click(() => $("input#target_height-direction").prop("checked", true).change());
    
    $("input, select").change(update);
    $("input#initial_height").change();

});

function update(){
    var h0, v0, theta0, end_fcn, output
    if ($("input#target-distance-driven").prop("checked")) {
        $(".target-height-driven, .initial-driven").find("*").addBack().attr("disabled", false);
        $(".target-distance-driven").find("*").addBack().attr("disabled", true);
        
        // solve for target distance and angle
        h0 = parseFloat($("input#initial_height").val() * $("select#initial_height-units").val());
        v0 = parseFloat($("input#initial_vel").val() * $("select#initial_vel-units").val());
        theta0 = parseFloat($("input#initial_angle").val()) * Math.PI/180;
        var hf = $("input#target_height").val() * $("select#target_height-units").val();
        end_fcn = $("input#target_height-direction").prop("checked") ? `v[1]>=0 && x[1]>=${hf}` : `v[1]<=0 && x[1]<=${hf}`;
        output = simulate(h0, v0, theta0, end_fcn);

        if (Math.abs(output[0][output[0].length-1][1] - hf) <= 0.05) {
            $("input#target_distance").val( +((output[0][output[0].length-1][0] / $("select#target_distance-units").val()).toFixed(3)) );
            $("input#target_angle").val( +((Math.atan2(output[1][1], output[1][0]) * 180/Math.PI).toFixed(2)) );    
        } else {
            $("input#target_distance, input#target_angle").val("");
        }
    } else if ($("input#target-height-driven").prop("checked")) {
        $(".initial-driven, .target-distance-driven").find("*").addBack().attr("disabled", false);
        $(".target-height-driven").find("*").addBack().attr("disabled", true);
        
        // solve for target height and angle
        h0 = parseFloat($("input#initial_height").val() * $("select#initial_height-units").val());
        v0 = parseFloat($("input#initial_vel").val() * $("select#initial_vel-units").val());
        theta0 = parseFloat($("input#initial_angle").val()) * Math.PI/180;
        end_fcn = `x[0] >= ${$("input#target_distance").val() * $("select#target_distance-units").val()}`;
        output = simulate(h0, v0, theta0, end_fcn);

        $("input#target_height").val( +((output[0][output[0].length-1][1] / $("select#target_height-units").val()).toFixed(3)) );
        $("input#target_height-direction").prop("checked", output[1][1] >= 0);
        $("input#target_angle").val( +((Math.atan2(output[1][1], output[1][0]) * 180/Math.PI).toFixed(2)) );
    } else if ($("input#initial-driven").prop("checked")) {
        $(".target-height-driven, .target-distance-driven").find("*").addBack().attr("disabled", false);
        $(".initial-driven").find("*").addBack().attr("disabled", true);

        var d = parseFloat($("input#target_distance").val() * $("select#target_distance-units").val());
        var thetaf = parseFloat($("input#target_angle").val() * Math.PI/180);
        h0 = parseFloat($("input#initial_height").val() * $("select#initial_height-units").val());
        var hf = parseFloat($("input#target_height").val() * $("select#target_height-units").val());
        
        theta0 = Math.atan(2*(hf-h0)/d - Math.tan(thetaf));
        v0 = Math.sqrt(9.8*d/Math.abs(Math.tan(theta0) - Math.tan(thetaf))) / Math.cos(theta0);
        end_fcn = `x[0] >= ${$("input#target_distance").val() * $("select#target_distance-units").val()}`;
        output = simulate(h0, v0, theta0, end_fcn);
        console.log(output);

        if (output[0].length==0 || Math.abs(output[0][output[0].length-1][0] - d) <= 0.05) {
            $("input#initial_vel").val( +((v0 / $("select#initial_vel-units").val()).toFixed(2)) );
            $("input#initial_angle").val( +((theta0 * 180/Math.PI).toFixed(2)) );
        } else {
            $("input#initial_vel, input#initial_angle").val("");
        }
    }

    // Draw graph
    var max = Math.max(Math.max.apply(null, output[0].map(x => x[0])), Math.max.apply(null, output[0].map(x => x[1]))) / $("select#initial_height-units").val();
    if ($("input#obstacle-enable").prop("checked")) {
        var obs_x = parseFloat($("input#obstacle_distance").val() * $("select#obstacle_distance-units").val());
        var obs_y = parseFloat($("input#obstacle_height").val() * $("select#obstacle_height-units").val());
    } else {
        var obs_x = 0, obs_y = 0;
    }

    $("canvas#graph").remove();
    if (output[0].length > 1) {
        $("span.warn").hide();
        $("div.graph").prepend('<canvas id="graph"></canvas>');
        var graph = new Chart("graph", {
            data: {
                labels: output[0].map(x => (x[0] / $("select#initial_height-units").val()).toFixed(2)),
                datasets: [{
                    type: "line",
                    data: output[0].map(x => x[1] / $("select#initial_height-units").val()),
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

    const drag = $("input#drag-enable").prop("checked") && !$("input#drag-enable").prop("disabled");
    const Cd = parseFloat($("input#drag_coeff").val());
    const r = $("input#diameter").val() * $("select#diameter-units").val() / 2;
    const m = $("input#mass").val() * $("select#mass-units").val();
    const w = $("input#rotation").val() * $("select#rotation-units").val();
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