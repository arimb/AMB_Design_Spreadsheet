let wf, Ts, If, Is, motors;
let min_ratio = 1;
let max_ratio = 500;

$(function(){

    // Set motor properties
    $("select#motor").on("change", () => {
        if($("select#motor").val() === "Custom"){
            $(".motor-prop").prop("disabled", false);
        }else{
            $("input#mot_wf").val(motors[$("select#motor").val()][0]);
            $("input#mot_ts").val(motors[$("select#motor").val()][1]);
            $("select#mot_ts-u").val($("select#mot_ts-u").children()[0].value);
            $("input#mot_if").val(motors[$("select#motor").val()][2]);
            $("input#mot_is").val(motors[$("select#motor").val()][3]);
            $(".motor-prop").prop("disabled", true);
        }
        $("input#mot_num").trigger("change");
    });

    // Update motor properties
    $(".motor-prop, input#mot_num, input#volt, input#gbx_eff").on("change", () => {
        wf = $("input#mot_wf").val() * (Math.PI/30);
        Ts = $("input#mot_ts").val() * $("select#mot_ts-u").val() * ($("input#gbx_eff").val()/100) * parseInt($("input#mot_num").val());
        If = $("input#mot_if").val() * parseInt($("input#mot_num").val());
        Is = $("input#mot_is").val() * parseInt($("input#mot_num").val());

        ratio_graph();
    });

    // Load motor properties
    const request = new XMLHttpRequest();
    request.onload = function() {
        motors = JSON.parse(this.responseText);
        const motor_names = Object.keys(motors);
        for (let i = motor_names.length-1; i >= 0; i--) {
            $("select#motor").prepend("<option>" + motor_names[i] + "</option>");
        }
        $("select#motor").val(motor_names[0]).trigger("change");
    };
    request.open("GET", "ref/motors.json", false);
    request.send();

    // Ratio tester
    $("div#ratio-tester input").on("change", () => {
        let ratio = 1;
        $("input.gearB").each((i,el) => ratio *= $(el).val()==="" ? 1 : parseFloat($(el).val()));
        $("input.gearA").each((i,el) => ratio /= $(el).val()==="" ? 1 : parseFloat($(el).val()));
        $("input#total-ratio").val(+(ratio.toFixed(2)));
    });
    $("input#total-ratio").on("click", () => {
        if ($("input#total-ratio").val() !== "")
            $("input#rat").val($("input#total-ratio").val()).trigger("change");
    });

    // Switch between linear and rotational simulation
    $("input[name=pos-vel]").on("change", function() {
        if ($(this).attr("id") === "by_pos") {
            $(".pos").show();
            $(".vel").hide();
        } else {
            $(".vel").show();
            $(".pos").hide();
        }
    });
    $(".vel").hide();

    // Adjust linear and rotational targets
    $("input#stop-pos-lin").on("change", () => {
        $("input#stop-pos-rot").val(($("input#stop-pos-lin").val() * $("select#stop-pos-lin-u").val() / ($("input#radius").val() * $("select#radius-u").val()) / $("select#stop-pos-rot-u").val()).toFixed(3));
        ratio_graph();
    });
    $("input#stop-pos-rot, input#radius").on("change", () => {
        $("input#stop-pos-lin").val(($("input#stop-pos-rot").val() * $("select#stop-pos-rot-u").val() * ($("input#radius").val() * $("select#radius-u").val()) / $("select#stop-pos-lin-u").val()).toFixed(3));
        ratio_graph();
    });
    $("input#stop-vel-lin").on("change", () => {
        $("input#stop-vel-rot").val(($("input#stop-vel-lin").val() * $("select#stop-vel-lin-u").val() / ($("input#radius").val() * $("select#radius-u").val()) / $("select#stop-vel-rot-u").val()).toFixed(3));
        ratio_graph();
    });
    $("input#stop-vel-rot, input#radius").on("change", () => {
        $("input#stop-vel-lin").val(($("input#stop-vel-rot").val() * $("select#stop-vel-rot-u").val() * ($("input#radius").val() * $("select#radius-u").val()) / $("select#stop-vel-lin-u").val()).toFixed(3));
        ratio_graph();
    });

    // Update ratio min max
    $("input#min-ratio, input#max-ratio").on("change", () => {
        min_ratio = parseFloat($("input#min-ratio").val());
        max_ratio = parseFloat($("input#max-ratio").val());
        ratio_graph();
    });

    // Update all inputs
    $("input#mass, input#load, input#maxI, input[name=by_pos], input#stop-pos-rot, input#stop-vel-rot, input#dt, input#tmax").on("change", () => {
        ratio_graph();
        // single_ratio
    });

    // Run simulation
    function simulate(ratio) {
        let t = [0];
        let x = [0];
        let v = [0];
        let a = [];
        let current = [];
        let current_limited = [];

        const dt = parseFloat($("input#dt").val()) / 1000;
        const tmax = parseFloat($("input#tmax").val());
        const V = parseFloat($("input#volt").val());
        const ilim = parseFloat($("input#maxI").val()) || 200;  // limit current to 200A even without provided limit
        const radius = parseFloat($("input#radius").val()) * $("select#radius-u").val();
        const MoI = parseFloat($("input#mass").val()) * $("select#mass-u").val() * radius**2;
        const load = parseFloat($("input#load").val()) * $("select#load-u").val() * radius;

        const kT = Ts / (Is - If);
        const kB = 12 / wf;
        const R = 12 / (Is - If);

        console.log(ratio, dt, tmax, V, ilim, radius, MoI, load, kT, kB, R);

        while (t.slice(-1)[0] <= tmax) {
            t.push(t.slice(-1)[0] + dt)

            let i = (V - v.slice(-1)[0] * ratio * kB) / R + If;
            i = Math.min(i, ilim);
            // console.log(i)
            current.push(i);
            current_limited.push(i === ilim);

            let T = kT * (i-If) * ratio;
            // console.log(T)
            a.push((T-load)/MoI/ratio);
            // console.log(a.slice(-1)[0])
            v.push(v.slice(-1)[0] + a.slice(-1)[0]*dt);
            // console.log(v.slice(-1)[0])
            x.push(x.slice(-1)[0] + v.slice(-1)[0]*dt + (a.slice(-1)[0]*dt**2)/2);
            // console.log(x.slice(-1)[0])

            if ($("input[name=pos-vel][checked]").attr("id") === "by_pos") {
                if (x.slice(-1)[0] > parseFloat($("input#stop-pos-rot").val()) * $("select#stop-pos-rot-u").val()){
                    // console.log(x.slice(-1)[0])
                    break
                }

            } else {
                if (v.slice(-1)[0] > parseFloat($("input#stop-vel-rot").val()) * $("select#stop-vel-rot-u").val()) {
                    // console.log(v.slice(-1)[0])
                    break
                }
            }
        }

        a.unshift(a[0]);
        current.unshift(current[0]);
        current_limited.unshift(current_limited[0]);
        return [t, x, v, a, current, current_limited];
    }

    // Update ratio graph
    function ratio_graph() {
        let ratios = [];
        let times = [];
        for (let r = min_ratio; r <= max_ratio+1e-3; r*=Math.pow(max_ratio/min_ratio, 1/30)) {
            ratios.push(r);
            let output = simulate(r);
            times.push(output[0].slice(-1)[0])
            // break           //!!!!!!!!!!!!!!!!!!
        }
        console.log(ratios)
        console.log(times)

        $("canvas#ratio-graph").remove();
        $("div.ratio-graph").prepend('<canvas id="ratio-graph"></canvas>');

        new Chart("ratio-graph", {
            type: "line",
            data: {
                labels: ratios,
                datasets: [{
                    data: times,
                    borderColor: "black",
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 0
                },
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
                        min: min_ratio,
                        max: max_ratio
                    },
                    y: {
                        display: true,
                        position: "left",
                        title: {
                            display: true,
                            text: "Time to Target (s)"
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        })
    }
    setTimeout(() => { ratio_graph(); }, 100);
});