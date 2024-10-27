let wf, Ts, If, Is, motors;

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

        graph_lims();
        update_vals();
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

    //Adjust linear and rotational targets
    $("input#stop-pos-lin, input#radius").on("change", () => {
        $("input#stop-pos-rot").val(($("input#stop-pos-lin").val() * $("select#stop-pos-lin-u").val() / ($("input#radius").val() * $("select#radius-u").val()) / $("select#stop-pos-rot-u").val()).toFixed(3));
    });
    $("input#stop-pos-rot, input#radius").on("change", () => {
        $("input#stop-pos-lin").val(($("input#stop-pos-rot").val() * $("select#stop-pos-rot-u").val() * ($("input#radius").val() * $("select#radius-u").val()) / $("select#stop-pos-lin-u").val()).toFixed(3));
    });
    $("input#stop-vel-lin, input#radius").on("change", () => {
        $("input#stop-vel-rot").val(($("input#stop-vel-lin").val() * $("select#stop-vel-lin-u").val() / ($("input#radius").val() * $("select#radius-u").val()) / $("select#stop-vel-rot-u").val()).toFixed(3));
    });
    $("input#stop-vel-rot, input#radius").on("change", () => {
        $("input#stop-vel-lin").val(($("input#stop-vel-rot").val() * $("select#stop-vel-rot-u").val() * ($("input#radius").val() * $("select#radius-u").val()) / $("select#stop-vel-lin-u").val()).toFixed(3));
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
        const ilim = parseFloat($("input#maxI").val());
        const radius = parseFloat($("input#radius").val()) * $("select#radius-u").val();
        const MoI = parseFloat($("input#mass").val()) * $("select#mass-u").val() * radius^2;
        const load = parseFloat($("input#load").val()) * $("select#load-u").val() * radius;

        const kT = Ts / (Is - If);
        const kB = 12 / wf;
        const R = 12 / (Is - If);

        while (t[-1] <= tmax) {
            t.push(t[-1] + dt)

            let i = (V - v[-1] * ratio * kB) / R + If;
            i = min(i, ilim);
            current.push(i);
            current_limited.push(i === ilim);

            let T = kT * (i-If) * ratio;
            a.push((T-load)/MoI);
            v.push(v[-1] + a[-1]*dt);
            x.push(x[-1] + v[-1]*dt + (a[-1]*dt^2)/2);

            if ($("input[name=pos-vel][checked]").attr("id") === "by_pos") {
                if (x > parseFloat($("input#stop-pos-rot").val()) * $("select#stop-pos-rot-u").val())
                    break
            } else {
                if (v > parseFloat($("input#stop-vel-rot").val()) * $("select#stop-vel-rot-u").val())
                    break
            }
        }
    }

    // Draw graph
    function draw_graph(ratio){
        $("canvas#graph").remove();
        $("div.graph").prepend('<canvas id="graph"></canvas>');

        var ratios = [];
        var data = [];
        const min = parseFloat($("input#gr-min").val());
        const max = parseFloat($("input#gr-max").val());
        for (let r = min; r < max+1e-3; r*=Math.pow(max/min, 1/30)) {
            ratios.push(r);
            data.push(calculate_vals(r));
        }
        var graph = new Chart("graph", {
            type: "line",
            data: {
                labels: ratios,
                datasets: [{
                    data: data.map(function(value,index) { return value[0]*$("select#rot_f-u").val()/6.283; }),
                    label: "Free Rot. Speed",
                    borderColor: "red",
                    fill: false,
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return value[3]*$("select#rot_l-u").val()/6.283; }),
                    label: "Loaded Rot. Speed",
                    borderColor: "magenta",
                    fill: false,
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return value[5]; }),
                    label: "Current",
                    borderColor: "orange",
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "y3"
                },{
                    data: data.map(function(value,index) { return value[6]; }),
                    label: "Stall Voltage",
                    borderColor: "green",
                    fill: false,
                    yAxisID: "y2",
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return 100*value[7]; }),
                    label: "Efficiency",
                    borderColor: "blue",
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "y3"
                },
                    {
                        data: [{x: (ratio ? ratio : 0), y: 0}, {x: (ratio ? ratio : 0), y: (ratio ? 1 : 0)}],
                        borderColor: "red",
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        yAxisID: "hidden",
                        hiddenLegend: true
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
                        min: min,
                        max: max
                    },
                    y: {
                        display: true,
                        position: "left",
                        title: {
                            display: true,
                            text: "Speed (rev/s)"
                        }
                    },
                    y3: {
                        display: true,
                        position: "right",
                        title: {
                            display: true,
                            text: "Current (A), Efficiency (%)"
                        }
                    },
                    y2: {
                        display: true,
                        position: "right",
                        title: {
                            display: true,
                            text: "Voltage (V)"
                        }
                    },
                    hidden: {
                        display: false,
                        position: "right"
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            filter: function(legend_item, data) {
                                return legend_item["lineDash"].length === 0;
                            },
                            font: {
                                size: 11
                            },
                            color: "black"
                        }
                    }
                }
            }
        })
    }
    setTimeout(() => { draw_graph(); }, 100);
    $("div.graph-limits input").on("change", draw_graph);
});