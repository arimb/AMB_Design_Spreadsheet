let wf, Ts, If, Is, eff, G;

$(document).ready(function(){

    var motors;
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
    request.open("GET", "ref/motors.json");
    request.send();

    // Set motor properties
    $("select#motor_name").change(function(){
        if($("select#motor_name").val() == "Custom"){
            $("input[id^=motor_]").prop("disabled", false);
            $("select#motor_stall_torque_units").prop("disabled", false);
        }else{
            $("input#motor_free_speed").val(motors[$("select#motor_name").val()][0]);
            $("input#motor_stall_torque").val(motors[$("select#motor_name").val()][1]);
            $("select#motor_stall_torque_units").val($("select#motor_stall_torque_units").children()[0].value);
            $("input#motor_free_current").val(motors[$("select#motor_name").val()][2]);
            $("input#motor_stall_current").val(motors[$("select#motor_name").val()][3]);
            $("input[id^=motor_]").prop("disabled", true);
            $("select#motor_stall_torque_units").prop("disabled", true);
        }
        update_motor();
    });

    // Update motor properties
    function update_motor(){
        wf = $("input#motor_free_speed").val() * (Math.PI/30);
        Ts = $("input#motor_stall_torque").val() * $("select#motor_stall_torque_units").val() * $("input#num_motors").val();
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
        $("input#total_ratio").val(G.toFixed(2));
    });
    $("div#gear-ratio input:first").change();

    function simulate(){
        const Vrest = $("input#rest_voltage").val();
        const Rtot = $("input#resistance").val() / 1000;
        const Imax = $("input#current_limit").val() ? $("input#current_limit").val() * $("input#num_motors").val() : Infinity;
        const dVmax = $("input#voltage_ramp").val() ? $("input#voltage_ramp").val() : 120;

        const m = $("input#weight").val() / $("select#weight_units").val();
        const r = $("input#wheel_diam").val()/2 / $("select#wheel_diam_units").val();
        const mu_s = $("input#static_cof").val() * ($("input#driven_weight").val() / 100);
        const mu_k = $("input#dynamic_cof").val() * ($("input#driven_weight").val() / 100);

        const xmax = $("input#distance").val() / $("select#distance_units").val();
        const tmax = $("input#max_time").val();
        const dt = $("input#timestep").val() / 1000;

        const km = Ts/(Is-If);
        const ke = 12/wf;
        const R = 12/(Is-If);
        const Tslip_s = 9.8*m*mu_s*r;
        const Tslip_k = 9.8*m*mu_k*r;
        const Tloss = Ts * (1-eff);
        const vmax = wf/G*r;

        console.log(Vrest, Rtot, Imax, dVmax, m, r, mu_s, mu_k, xmax, tmax, dt, km, Tslip_s, Tslip_k, Tloss, vmax);

        var t=0, x=0, v=0, a, V=Vrest, I, slip=false, T, Tmotor, F, stop=false, connected=true;
        var times = [], data = [];
        main: while (t < tmax) {
            // initial torque calculation
            // Tmotor = Ts*(1-v/r*G/wf)*(V/12);
            I = connected ? (V-v*G/r*ke)/R : 0;
            Tmotor = (I-If)*km;
            T = Tmotor*G - Tloss*(v/vmax) - (stop ? Tloss/eff : 0);
            // slip detection
            if (slip && Math.abs(T) < Tslip_k) slip = false;
            else if (!slip && Math.abs(T) > Tslip_s) slip = true;
            if (slip) {
                T = Tslip_k;
                Tmotor = T/(G*eff);
                I = Tmotor/km + If;
            }
            // current limiting
            if (I > Imax) {
                I = Imax;
                Tmotor = (I-If)*km;
                T = Tmotor*G - Tloss*(v/vmax) - (stop ? Tloss/eff : 0);
                if (slip && T < Tslip_k) slip = false;
            }
            // acceleration calculation
            F = T/r;
            a = F/m;
            v += a*dt;
            x += v*dt + 0.5*a*dt**2;

            console.log(t, x, v, a, T, Tmotor, I, V, slip, stop, connected);
            times.push(t);
            data.push([x, v, a, I, V, T, slip]);

            switch ($("select#stop-type").val()) {
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
                    if (x > xmax - v**2/(2*9.8*mu_k)) {
                        stop = true;
                        if (v < 0.1) break main;
                    }
                    break;
            }
            
            if (!stop) {
                V = Vrest - Rtot*I;
            } else {
                switch ($("select#stop-method").val()) {
                    case "Coast":
                        V = 0;
                        connected = false;
                        break;
                    case "Brake":
                        V = 0;
                        break;
                    case "Reverse":
                        // V = -(Vrest - Rtot*I);
                        V = Vrest;
                        break;
                }
            }

            t += dt;
        }
        

        // plot graph
        $("canvas#simulation").remove();
        $("div.graphs").prepend('<canvas id="simulation"></canvas>');
        var graph = new Chart("simulation", {
            type: "line",
            data: {
                labels: times.map(time => time.toFixed(3)),
                datasets: [{
                    data: data.map(function(value,index) { return value[0] * $("select#distance_units").val(); }),
                    label: "Position",
                    borderColor: "blue",
                    fill: false,
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return value[1] * $("select#distance_units").val(); }),
                    label: "Velocity",
                    borderColor: "green",
                    fill: false,
                    // yaxisID: "right",
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return Math.abs(value[2]) * $("select#distance_units").val(); }),
                    label: "Acceleration",
                    borderColor: "red",
                    fill: false,
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return Math.abs(value[3]) / $("input#num_motors").val(); }),
                    label: "Current Per Motor",
                    borderColor: "orange",
                    fill: false,
                    pointRadius: 0,
                    yaxisID: "y2"
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
                        display: true,
                        position: "left",
                        title: {
                            display: true,
                            // text: "Position (ft), Acceleration (ft/s^2)"
                        }
                    },
                    y2: {
                        display: true,
                        position: "right",
                        title: {
                            display: true,
                            // text: "Speed (ft/s)"
                        }
                    }
                }
            }
        });
        
    }
    setTimeout(() => { simulate(); }, 100);
    $("input, select").change(simulate);

});