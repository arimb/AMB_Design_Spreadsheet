$(document).ready(function(){

    $("input#drag-enable").change(() => { $("input#drag-enable").parent().nextAll().children("input,select").attr("disabled", !$("input#drag-enable").prop("checked")); });
    
    $("input[type=checkbox].driving").change(() => { 
        $("input[type=checkbox].driving:not(:checked)").attr("disabled", ($("input[type=checkbox].driving:checked").length >= 2));
        $("input[type=checkbox].driving:checked").siblings("input").attr("disabled", true);
        $("input[type=checkbox].driving:not(:checked)").siblings("input").attr("disabled", false);
        // $("input[type=checkbox].driving:checked").siblings("input[type=checkbox]").css("display", "none");
        // $("input[type=checkbox].driving:not(:checked)").siblings("input[type=checkbox]").css("display", "inline-block");
    });

    $("input, select").change(function(){
        $("canvas#graph").remove();
        $("div.graph").prepend('<canvas id="graph"></canvas>');
        
        var h0, v0, theta0, end_fcn, output, goal, last, last2, output_last, output_last2;
        if ($("input#target_distance-driving").prop("checked")) {
            h0 = parseFloat($("input#initial_height").val() / $("select#initial_height_units").val());
            v0 = parseFloat($("input#initial_vel").val() / $("select#initial_vel_units").val());
            theta0 = parseFloat($("input#initial_angle").val()) * Math.PI/180;
            if ($("input#target_angle-driving").prop("checked")) {
                end_fcn = $("input#target_height-direction").prop("checked") ? `v[1]>=0 && x[1]>=${$("input#target_height").val() / $("select#target_height_units").val()}` : `v[1]<=0 && x[1]<=${$("input#target_height").val() / $("select#target_height_units").val()}`;
                output = simulate(h0, v0, theta0, end_fcn);
            } else if ($("input#target_height-driving").prop("checked")) {
                end_fcn = `Math.abs( angle(v) - ${$("input#target_angle").val()} ) < 0.5`;
                output = simulate(h0, v0, theta0, end_fcn);
            } else if ($("input#initial_height-driving").prop("checked")) {
                end_fcn = $("input#target_height-direction").prop("checked") ? `v[1]>=0 && x[1]>=${$("input#target_height").val() / $("select#target_height_units").val()}` : `v[1]<=0 && x[1]<=${$("input#target_height").val() / $("select#target_height_units").val()}`;
                goal = parseFloat($("input#target_angle").val());
                last2 = 0;
                output_last2 = simulate(last2, v0, theta0, end_fcn);
                last = 1;
                output_last = simulate(last, v0, theta0, end_fcn);
                do {
                    h0 = (last2 * (angle(output_last[1])-goal) - last * (angle(output_last2[1])-goal)) / (angle(output_last[1]) - angle(output_last2[1]));
                    output = simulate(h0, v0, theta0, end_fcn);
                    last2 = last;
                    output_last2 = output_last;
                    last = h0;
                    output_last = output;
                } while (Math.abs(angle(output[1]) - goal) > 0.5);
            } else if ($("input#initial_vel-driving").prop("checked")) {
                end_fcn = $("input#target_height-direction").prop("checked") ? `v[1]>=0 && x[1]>=${$("input#target_height").val() / $("select#target_height_units").val()}` : `v[1]<=0 && x[1]<=${$("input#target_height").val() / $("select#target_height_units").val()}`;
                goal = parseFloat($("input#target_angle").val());
                last2 = 2;
                output_last2 = simulate(h0, last2, theta0, end_fcn);
                last = 1;
                output_last = simulate(h0, last, theta0, end_fcn);
                console.log(output_last2, output_last);
                do {
                    v0 = (last2 * (angle(output_last[1])-goal) - last * (angle(output_last2[1])-goal)) / (angle(output_last[1]) - angle(output_last2[1]));
                    console.log(v0);
                    output = simulate(h0, v0, theta0, end_fcn);
                    console.log(output);
                    last2 = last;
                    output_last2 = output_last;
                    last = v0;
                    output_last = output;
                } while (Math.abs(angle(output[1]) - goal) > 0.5);
            }
        }
        console.log(output);
        
        if ($("input#initial_height-driving").prop("checked")) $("input#initial_height").val(h0 * $("select#initial_height_units").val());
        if ($("input#initial_vel-driving").prop("checked")) $("input#initial_vel").val(v0 * $("select#initial_vel_units").val());
        if ($("input#initial_angle-driving").prop("checked")) $("input#initial_angle").val(theta0 * 180/Math.PI);
        if ($("input#target_distance-driving").prop("checked")) $("input#target_distance").val(output[0][output[0].length-1][0]);
        if ($("input#target_height-driving").prop("checked")) $("input#target_height").val(output[0][output[0].length-1][1]);
        if ($("input#target_angle-driving").prop("checked")) $("input#target_angle").val( (Math.atan2(output[1][1], output[1][0]) * 180/Math.PI).toFixed(1) );

        var max = Math.max(Math.max.apply(null, output[0].map(x => x[0])), Math.max.apply(null, output[0].map(x => x[1])));
        if ($("input[type=checkbox].driving:checked").length == 2) {
            var graph = new Chart("graph", {
                data: {
                    labels: output[0].map(x => x[0].toFixed(2)),
                    datasets: [{
                        type: "line",
                        data: output[0].map(x => x[1]),
                        borderColor: "black",
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
                    }
                }
            });
        } else $("canvas#graph").css("display", "none");
    });
    $("input#initial_height").change();

});

function simulate(h0, v0, theta0, end_fcn) {
    var t = 0;
    var x = [0, h0];
    var v = [v0*Math.cos(theta0), v0*Math.sin(theta0)];
    const dt = 0.001;

    const drag = $("input#drag-enable").prop("checked");
    const Cd = parseFloat($("input#drag_coeff").val());
    const r = $("input#diameter").val() * $("select#diameter_units").val() / 2;
    const m = $("input#mass").val() * $("select#mass_units").val();
    const w = $("input#rotation").val() * $("select#rotation_units").val();
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