let wf, Ts, If, Is, motors;

$(document).ready(function(){

    // Set motor properties
    $("select#motor").change(() => {
        if($("select#motor").val() == "Custom"){
            $(".motor-prop").prop("disabled", false);
        }else{
            $("input#mot_wf").val(motors[$("select#motor").val()][0]);
            $("input#mot_ts").val(motors[$("select#motor").val()][1]);
            $("select#mot_ts-u").val($("select#mot_ts-u").children()[0].value);
            $("input#mot_if").val(motors[$("select#motor").val()][2]);
            $("input#mot_is").val(motors[$("select#motor").val()][3]);
            $(".motor-prop").prop("disabled", true);
        }
        $("input#mot_num").change();
    });

    // Update motor properties
    $(".motor-prop, input#mot_num, input#volt").change(() => {
        wf = $("input#mot_wf").val() * (Math.PI/30) * ($("input#volt").val()/12);
        Ts = $("input#mot_ts").val() * $("select#mot_ts-u").val() * ($("input#volt").val()/12) * ($("input#gbx_eff").val()/100) * parseInt($("input#mot_num").val());
        If = $("input#mot_if").val() * ($("input#volt").val()/12) * parseInt($("input#mot_num").val());
        Is = $("input#mot_is").val() * ($("input#volt").val()/12) * parseInt($("input#mot_num").val());
        
        update();
    });

    // Load motor properties
    const request = new XMLHttpRequest();
    request.onload = function() {
        motors = JSON.parse(this.responseText);
        const motor_names = Object.keys(motors);
        for (let i = motor_names.length-1; i >= 0; i--) {
            $("select#motor").prepend("<option>" + motor_names[i] + "</option>");
        }
        $("select#motor").val(motor_names[0]).change();
    };
    request.open("GET", "ref/motors.json", false);
    request.send();

    // Switch Linear/Rotational inputs
    $("input[name=lin-rot]").change(() => {
        $(".lin, .rot").hide();
        $("." + $("input[name=lin-rot]:checked").prop("id")).show();
    }).change();

});

function update(){
    var x=0, v=0, a=0, t=0, dt=0.001;

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