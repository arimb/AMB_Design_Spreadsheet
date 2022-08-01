let wf, Ts, If, Is, eff, G, motors;

$(document).ready(function(){

    // Set motor properties
    $("select#motor_name").change(function(){
        if($("select#motor_name").val() == "Custom"){
            $("input[id^=motor_]").prop("disabled", false);
            $("select#motor_stall_torque-units").prop("disabled", false);
        }else{
            $("input#motor_free_speed").val(motors[$("select#motor_name").val()][0]);
            $("input#motor_stall_torque").val(motors[$("select#motor_name").val()][1]);
            $("select#motor_stall_torque-units").val($("select#motor_stall_torque-units").children()[0].value);
            $("input#motor_free_current").val(motors[$("select#motor_name").val()][2]);
            $("input#motor_stall_current").val(motors[$("select#motor_name").val()][3]);
            $("input[id^=motor_]").prop("disabled", true);
            $("select#motor_stall_torque-units").prop("disabled", true);
        }
        update_motor();
    });

    // Load motor properties
    const request = new XMLHttpRequest();
    request.onload = function() {
        motors = JSON.parse(this.responseText);
        const motor_names = Object.keys(motors);
        for (let i = motor_names.length-1; i >= 0; i--) {
            $("select#motor_name").prepend("<option>" + motor_names[i] + "</option>");
        }
        $("select#motor_name").val(motor_names[0]);
        $("select#motor_name").change();
    };
    request.open("GET", "ref/motors.json", false);
    request.send();

    

    // Update motor properties
    function update_motor(){
        wf = $("input#motor_free_speed").val() * (Math.PI/30);
        Ts = $("input#motor_stall_torque").val() * $("select#motor_stall_torque-units").val() * $("input#num_motors").val();
        eff = $("input#gearbox_efficiency").val() / 100;
        If = $("input#motor_free_current").val() * $("input#num_motors").val();
        Is = $("input#motor_stall_current").val() * $("input#num_motors").val();
    }
    $("div#motor *").change(update_motor);

    // Update gear ratio
    $("div#gear-ratio input:not(disabled)").change(function(){
        G = ($("input#gear1b").val() ? $("input#gear1b").val() : 1) /
            ($("input#gear1a").val() ? $("input#gear1a").val() : 1) *
            ($("input#gear2b").val() ? $("input#gear2b").val() : 1) /
            ($("input#gear2a").val() ? $("input#gear2a").val() : 1) *
            ($("input#gear3b").val() ? $("input#gear3b").val() : 1) /
            ($("input#gear3a").val() ? $("input#gear3a").val() : 1);
        $("input#total_ratio").val(+(G.toFixed(2)));
    });
    $("div#gear-ratio input:first").change();

    function update(){ update_graph(simulate(G)); }

    setTimeout(() => {
        update();
        update_ratios_graph();
        $("input, select").change(update);
        $("input:not([id^=gear]), select").change(update_ratios_graph);
    }, 100);
    
});

function simulate(ratio){
    console.log(ratio);
    const xmax = $("input#distance").val() * $("select#distance-units").val();
    const tmax = $("input#max_time").val();
    const dt = $("input#timestep").val() / 1000;
    const filtering = 0.6;
    
    const Vrest = parseFloat($("input#rest_voltage").val());
    const Rtot = $("input#resistance").val() / 1000;
    const Imax = $("input#current_limit").val() ? $("input#current_limit").val() * $("input#num_motors").val() : Infinity;
    const dVmax = ($("input#voltage_ramp").val() ? $("input#voltage_ramp").val() : 1200) * dt;

    const m = $("input#weight").val() * $("select#weight-units").val();
    const r = $("input#wheel_diam").val()/2 * $("select#wheel_diam-units").val();
    const mu_s = $("input#static_cof").val() * ($("input#driven_weight").val() / 100);
    const mu_k = $("input#dynamic_cof").val() * ($("input#driven_weight").val() / 100);

    const km = Ts/(Is-If);
    const ke = 12/wf;
    const R = 12/(Is-If);
    const Tslip_s = 9.8*m*mu_s*r;
    const Tslip_k = 9.8*m*mu_k*r;
    const Tloss = Ts * (1-eff);
    const vmax = wf/ratio*r;

    const stop_type = $("select#stop-type").val();
    const stop_method = $("select#stop-method").val();

    // console.clear();
    // console.log(Vrest, Rtot, Imax, dVmax, m, r, mu_s, mu_k, xmax, tmax, dt, km, Tslip_s, Tslip_k, Tloss, vmax);

    var t=0, x=0, v=0, a, V=Vrest, Vnew, I, slip=false, T, Tmotor, F, stop=false, connected=true;
    var times = [], data = [];
    main: while (t < tmax) {
        // current calculation
        I = connected ? (V-v*ratio/r*ke)/R : 0;
        I = Math.min(Math.abs(I), Imax) * Math.sign(I);

        // torque calculation
        Tmotor = (I-If)*km;
        T = Tmotor*ratio*eff - Tloss*(v/vmax) - (stop ? Tloss/eff : 0);

        // slip detection
        if (slip && Math.abs(T) < Tslip_k) slip = false;
        else if (!slip && Math.abs(T) > Tslip_s) slip = true;
        if (slip) {
            T = Tslip_k * Math.sign(T);
            Tmotor = T/(ratio*eff);
            I = (Math.abs(Tmotor/km) + If) * Math.sign(Tmotor);
        }
        
        // acceleration calculation
        F = T/r;
        a = F/m;
        v += a*dt;
        x += v*dt + 0.5*a*dt**2;

        // console.log(t, stop, x, v, a, V, connected, slip, T, Tmotor, I);

        if (stop_method == "Coast" && stop) I = 0;
        times.push(t);
        data.push([x, v, a, I, V, T, slip]);

        
        switch (stop_type) {
            case "No Stop":
                if (x > xmax) {
                    break main;
                }
                break;
            case "Stop After":
                if (x > xmax) {
                    stop = true;
                    if (v < 0.1) break main;
                }
                break;
            case "Predictive":
                if (x > xmax - v**2/(2*(stop_method == "Coast" ? 2*Tloss/r/m : 9.8*mu_k))) {
                    stop = true;
                }
                if (stop && v < 0.1) break main;
                break;
        }
        
        if (!stop) {
            Vnew = Vrest - Rtot*I;
        } else {
            switch (stop_method) {
                case "Coast":
                    Vnew = 0;
                    connected = false;
                    break;
                case "Brake":
                    Vnew = 0;
                    break;
                case "Reverse":
                    V = -(Vrest - Rtot*I);
                    break;
            }
        }
        V = (Math.abs(Vnew-V)>dVmax ? V+dVmax*Math.sign(Vnew-V) : Vnew*filtering + V*(1-filtering));
        t += dt;
    }
    return [times, data];
}
    
function update_graph(output){
    const times = output[0];
    const data = output[1];
    $("canvas#simulation").remove();
    $("div.graphs").prepend('<canvas id="simulation"></canvas>');
    var graph = new Chart("simulation", {
        type: "line",
        data: {
            labels: times.map(time => time.toFixed(3)),
            datasets: [{
                data: data.map(function(value,index) { return value[0] / $("select#distance-units").val(); }),
                label: "Position",
                borderColor: "blue",
                fill: false,
                pointRadius: 0
            },{
                data: data.map(function(value,index) { return value[1] / $("select#distance-units").val(); }),
                label: "Velocity",
                borderColor: "green",
                fill: false,
                pointRadius: 0
            },{
                data: data.map(function(value,index) { return value[6] ? value[2] / $("select#distance-units").val() : NaN; }),
                label: "Slip",
                borderColor: "black",
                fill: false,
                pointRadius: 0
            },{
                data: data.map(function(value,index) { return value[2] / $("select#distance-units").val(); }),
                label: "Acceleration",
                borderColor: "red",
                fill: false,
                pointRadius: 0
            },{
                data: data.map(function(value,index) { return value[3] / $("input#num_motors").val(); }),
                label: "Current Per Motor",
                borderColor: "orange",
                fill: false,
                pointRadius: 0,
                yAxisID: "y2"
            },{
                data: data.map(function(value,index) { return value[4]; }),
                label: "System Voltage",
                borderColor: "magenta",
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: "Time (s)",
                        padding: {
                            top: 0
                        }
                    },
                    ticks: {
                        callback: function(value, index, ticks) {
                            return times[index].toFixed(2);
                        }
                    }
                },
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    // title: {
                    //     display: true,
                    //     // text: "Position (ft), Acceleration (ft/s^2)"
                    // }
                },
                y2: {
                    type: "linear",
                    display: true,
                    position: "right",
                    // title: {
                    //     display: true,
                    //     // text: "Speed (ft/s)"
                    // }
                }
            }
        }
    });
}

function update_ratios_graph(){
    let ratios = [];
    let times = [];
    let min = 3;
    let max = 20;
    for (let r = min; r < max; r*=Math.pow(max/min, 1/30)) {
        ratios.push(r);
        let t = simulate(r)[0];
        times.push(t[t.length-1]);
    }

    $("canvas#ratios").remove();
    $("div.graphs").append('<canvas id="ratios"></canvas>');
    var graph = new Chart("ratios", {
        type: "line",
        data: {
            labels: ratios.map(x => +(x.toFixed(2))),
            datasets: [{
                data: times,
                borderColor: "black",
                fill: false,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    type: "logarithmic",
                    title: {
                        display: true,
                        text: "Gear Ratio (X:1)",
                        padding: {
                            top: 0
                        }
                    },
                    min: min,
                    max: max
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}