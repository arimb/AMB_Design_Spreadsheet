$(document).ready(function(){

    $("input#drag-enable").change(() => { $("input#drag-enable").parent().nextAll().children("input,select").attr("disabled", !$("input#drag-enable").prop("checked")); });

    $("input, select").change(function(){
        $("canvas#graph").remove();
        $("div.graph").prepend('<canvas id="graph"></canvas>');
        
        var h0, v0, theta0, end_fcn, output
        if ($("input#initial-driving").prop("checked")) {
            $(".fwd").attr("disabled", true);
            $(".rev").attr("disabled", false);
            
            // solve for target distance and angle
            h0 = parseFloat($("input#initial_height").val() / $("select#initial_height_units").val());
            v0 = parseFloat($("input#initial_vel").val() / $("select#initial_vel_units").val());
            theta0 = parseFloat($("input#initial_angle").val()) * Math.PI/180;
            end_fcn = $("input#target_height-direction").prop("checked") ?
                        `v[1]>=0 && x[1]>=${$("input#target_height").val() / $("select#target_height_units").val()}` : 
                        `v[1]<=0 && x[1]<=${$("input#target_height").val() / $("select#target_height_units").val()}`;
            output = simulate(h0, v0, theta0, end_fcn);

            $("input#target_distance").val(output[0][output[0].length-1][0].toFixed(3));
            $("input#target_angle").val( (Math.atan2(output[1][1], output[1][0]) * 180/Math.PI).toFixed(1) );
        } else {
            $(".fwd").attr("disabled", false);
            $(".rev").attr("disabled", true);

            // solve for initial velocity and angle
            h0 = parseFloat($("input#initial_height").val() / $("select#initial_height_units").val());
            // CONTINUE HERE

            $("input#initial_vel").val(v0 * $("select#initial_vel_units").val());
            $("input#initial_angle").val(theta0 * 180/Math.PI);
        }

        // Draw graph
        var max = Math.max(Math.max.apply(null, output[0].map(x => x[0])), Math.max.apply(null, output[0].map(x => x[1])));
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