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
    $(".motor-prop, input#mot_num").change(() => {
        wf = $("input#mot_wf").val() * (Math.PI/30);
        Ts = $("input#mot_ts").val() * $("select#mot_ts-u").val() * parseInt($("input#mot_num").val());
        If = $("input#mot_if").val()  * parseInt($("input#mot_num").val());
        Is = $("input#mot_is").val() * parseInt($("input#mot_num").val());
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

    // Switch Linear/Rotational, Position/Velocity inputs
    $("input[name=lin-rot], input[name=pid-type]").change(() => {
        $(".lin, .rot, .pos, .vel").show();
        $("." + $("input[name=lin-rot]:not(:checked)").prop("id")).hide();
        $("." + $("input[name=pid-type]:not(:checked)").prop("id")).hide();
    }).change();

    $("select[id$='_pos_lin-u']").change((event) => {
        $("select[id$='_pos_lin-u']").val($(event.target).val());
    });
    $("select[id$='_vel_lin-u']").change((event) => {
        $("select[id$='_vel_lin-u']").val($(event.target).val());
    });

    // Show/hide PID coeffs
    $("input#closedloop").change(() => {
        if ($("input#closedloop").prop("checked")) {
            $("div.closedloop").show();
        } else {
            $("div.closedloop").hide();
        }
    });

    // Update on any change
    $("input, select").change(update);

});

function update(){
    console.clear();
    // Get input values
    const position = $("input#pos").prop("checked");
    const linear = $("input#lin").prop("checked");
    const radius = parseFloat($("input#radius").val()) * $("select#radius-u").val();
    if (linear) {
        if (position) {
            var start = parseFloat($("input#start_pos_lin").val()) * $("select#start_pos_lin-u").val() / radius;
            var target = parseFloat($("input#goal_pos_lin").val()) * $("select#goal_pos_lin-u").val() / radius;
            var kv = 0;
            var unitfactor = parseFloat($("select#start_pos_lin-u").val());
        } else {
            var start = parseFloat($("input#start_vel_lin").val()) * $("select#start_vel_lin-u").val() / radius;
            var target = parseFloat($("input#goal_vel_lin").val()) * $("select#goal_vel_lin-u").val() / radius;
            var kv = parseFloat($("input#kv").val());
            var unitfactor = parseFloat($("select#start_vel_lin-u").val());
        }
        var load_const = $("input#load_cnst_lin").val() ? (parseFloat($("input#load_cnst_lin").val()) * $("select#load_cnst_lin-u").val() * radius) : 0;
        var load_visc = $("input#load_visc_lin").val() ? (parseFloat($("input#load_visc_lin").val()) * $("select#load_visc_lin-u").val() * radius) : 0;
        var load_cos = 0;
        var MOI = parseFloat($("input#mass_lin").val()) * $("select#mass_lin-u").val() * radius**2;
        var kg = parseFloat($("input#kg").val());
        var kcos = 0;
    } else {
        if (position) {
            var start = parseFloat($("input#start_pos_rot").val()) * Math.PI/180;
            var target = parseFloat($("input#goal_pos_rot").val()) * Math.PI/180;
            var load_cos = $("input#grv").prop("checked") ? (parseFloat($("input#mass_rot").val()) * radius * 9.8) : 0;
            var MOI = parseFloat($("input#mass_rot").val()) * $("select#mass_rot-u").val() * radius**2;
            var kv = 0;
            var load_const = 0;
            var unitfactor = Math.PI/180;
        } else {
            var start = parseFloat($("input#start_vel_rot").val()) * Math.PI/30;
            var target = parseFloat($("input#goal_vel_rot").val()) * Math.PI/30;
            var load_cos = 0;
            var MOI = parseFloat($("input#moi").val()) * $("select#moi-u").val();
            var kv = parseFloat($("input#kv").val());
            var load_const = $("input#load_cnst_rot").val() ? (parseFloat($("input#load_cnst_rot").val()) * $("select#load_cnst_rot-u").val()) : 0;
            var unitfactor = Math.PI/30;
        }
        
        var load_visc = $("input#load_visc_rot").val() ? (parseFloat($("input#load_visc_rot").val()) * $("select#load_visc_rot-u").val()) : 0;
        var kg = 0;
        var kcos = parseFloat($("input#kg").val());
    }
    const ilim = $("input#ilim").val() ? parseFloat($("input#ilim").val()) : Infinity;
    const gear = parseFloat($("input#rat").val());
    const pv_units = parseFloat($("input#pv_units").val());
    const closedloop = $("input#closedloop").prop("checked");
    const kp = parseFloat($("input#kp").val());
    const ki = parseFloat($("input#ki").val());
    const imax = parseFloat($("input#imax").val());
    const kd = parseFloat($("input#kd").val());
    const maxt = parseFloat($("input#maxt").val());
    const dt = parseFloat($("input#dt").val()) / 1000;
    const ss = parseFloat($("input#ss").val());
    const R = 12 / (Is - If);
    const Kt = Ts / (Is - If);
    const Ke = 12 / wf;

    console.log(position, linear, start, target, load_const, load_visc, load_cos, MOI, kg, kcos, ilim, gear, closedloop, kp, ki, imax, kd, kv, maxt, dt, R, Kt, Ke, Ts, wf, If, Is);

    // Initialize variables
    var t = [0];
    if (position) {
        var x = [start];
        var v = [0];
    } else {
        var x = [0];
        var v = [start];
    }
    var a = [0];
    var I = [0];
    var V = [0];
    var inte = 0;
    var laste = target - start;
    target *= pv_units;

    // Simulate
    while (t.slice(-1)[0] <= maxt) {
        if (!closedloop) {
            var Vtmp = 12;
        } else {
            if (position) 
                e = target - x.slice(-1)[0] * pv_units;
            else 
                e = target - v.slice(-1)[0] * pv_units;
            inte += e * dt;
            de = (e - laste) / dt;
            laste = e;

            var Vtmp = kp*e + Math.min(Math.max(ki*inte, -imax), imax) + kd*de + kg + kcos*Math.cos(x.slice(-1)[0]) + kv*target;
            Vtmp = Math.min(Math.max(Vtmp, -12), 12);
        }
        var Ides = (Vtmp - Ke*v.slice(-1)[0]) / R + If;
        var Istatorlim = ilim ? ilim / Math.min(((v.slice(-1)[0]/2*wf) + Math.sqrt((v.slice(-1)[0]/(2*wf))**2 + ilim/Is)), 1) : Infinity;
        console.log(Istatorlim);
        I.push(Math.min(Math.max(Ides, -Istatorlim), Istatorlim));
        // I.push(Vtmp!=0 ? Math.min(Math.max(Ides * (Vtmp/12), -ilim), ilim) / (Vtmp/12) : 0);
        V.push(Ke*v.slice(-1)[0] + R*(I.slice(-1)[0] - If));

        a.push((I.slice(-1)[0]*Kt*gear - load_const - load_visc*v.slice(-1)[0] - load_cos*Math.cos(x.slice(-1)[0])) / MOI);
        v.push(v.slice(-1)[0] + a.slice(-1)[0]*dt);
        x.push(x.slice(-1)[0] + v.slice(-1)[0]*dt + a.slice(-1)[0]*dt**2/2);
        t.push(t.slice(-1)[0] + dt);

        console.log(t.slice(-1)[0], x.slice(-1)[0], v.slice(-1)[0], a.slice(-1)[0], I.slice(-1)[0], V.slice(-1)[0]);

        if (x.length > 10 && position && (Math.abs(Math.max(...x.slice(-10)) - Math.min(...x.slice(-10))) < 10*ss*dt)) break;
        if (x.length > 10 && !position && (Math.abs(Math.max(...v.slice(-10)) - Math.min(...v.slice(-10))) < 10*ss*dt)) break;
    }
    
    // Draw graph
    $("canvas#graph").remove();
    if (x.length > 1) {
        $("span.warn").hide();
        $("div.graph").prepend('<canvas id="graph"></canvas>');
        var graph = new Chart("graph", {
            data: {
                labels: t.map(t => t.toFixed(2)),
                datasets: [{
                    label: "Target",
                    type: "line",
                    data: Array(t.length).fill(target / unitfactor),
                    borderColor: "red",
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    yAxisID: position ? "x1" : "v"
                },{
                    label: "Position",
                    type: "line",
                    data: position ? x.map(x => x / unitfactor) : [],
                    borderColor: "black",
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "x1"
                },{
                    label: "Velocity",
                    type: "line",
                    data: v.map(v => v / unitfactor),
                    borderColor: "green",
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "v"
                },{
                    label: "Acceleration",
                    type: "line",
                    data: position ? [] : a.map(a => a / unitfactor),
                    borderColor: "red",
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "a"
                },{
                    label: "Rotor Current",
                    type: "line",
                    data: I.map(I => I),
                    borderColor: "yellow",
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "i"
                },{
                    label: "Applied Voltage",
                    type: "line",
                    data: V.map(V => V),
                    borderColor: "blue",
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "V"
                }]
            },
            options: {
                responsive: true,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            filter: function(item, chart) {
                                return position ? !item.text.includes('Acceleration') : !item.text.includes('Position');
                            }
                        }
                    }
                },
                scales: {
                    t: {
                        title: {
                            display: true,
                            text: "Time (s)"
                        },
                        position: "bottom"
                    },
                    x1: {
                        display: position,
                        title: {
                            display: true,
                            text: "Position (" + (linear ? $("select#start_pos_lin-u option:selected").html() : "deg") + ")"
                        },
                        position: "left"
                    },
                    v: {
                        title: {
                            display: true,
                            text: "Velocity (" + (position ? 
                                (linear ? $("select#start_pos_lin-u option:selected").html() : "deg") + "/s" : 
                                (linear ? $("select#start_vel_lin-u option:selected").html() : "rpm")) + ")"
                        },
                        position: "left"
                    },
                    a: {
                        display: !position,
                        title: {
                            display: true,
                            text: "Acceleration (" + (position ? 
                                (linear ? $("select#start_pos_lin-u option:selected").html() : "deg") + "/s²" : 
                                (linear ? $("select#start_vel_lin-u option:selected").html() + "²" : "rpm/s")) + ")"
                        },
                        position: "left"
                    },
                    i: {
                        title: {
                            display: true,
                            text: "Current (A)"
                        },
                        position: "right"
                    },
                    V: {
                        title: {
                            display: true,
                            text: "Voltage (V)"
                        },
                        position: "right"
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    } else $("span.warn").show();
    
}