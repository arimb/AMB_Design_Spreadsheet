let wf, Ts, If, Is, radius, load, motors;

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
        $("select#motor").val(motor_names[0]).change();
    };
    request.open("GET", "ref/motors.json", false);
    request.send();

    // Update radius
    $("input#radius, select#radius-u").change(() => {
        radius = $("input#radius").val() * $("select#radius-u").val();
        graph_lims();
        update_vals();
    });
    $("input#radius").change();

    // Update load
    $("input#load, select#load-u").change(() => {
        load = $("input#load").val() * $("select#load-u").val();
        graph_lims();
        update_vals();
    });
    $("input#load").change();

    // Ratio tester
    $("div#ratio-tester input").change(() => {
        let ratio = 1;
        $("input.gearB").each((i,el) => ratio *= $(el).val()=="" ? 1 : parseFloat($(el).val()));
        $("input.gearA").each((i,el) => ratio /= $(el).val()=="" ? 1 : parseFloat($(el).val()));
        $("input#total-ratio").val(+(ratio.toFixed(2)));
    });
    $("input#total-ratio").click(() => {
        if ($("input#total-ratio").val() != "")
            $("input#rat").val($("input#total-ratio").val()).change();
    });

    // Calculate outputs from ratio
    function calculate_vals(ratio){
        tmp = [
            wf / ratio / $("select#rot_f-u").val(),     // rot_speed
            wf/ratio * radius / $("select#lin_f-u").val(),      // lin_speed
            Ts * ratio  / radius / $("select#st_load-u").val(),      // stall_load
            wf/ratio * (1 - (load*radius)/(Ts*ratio)) / $("select#rot_l-u").val(),      // rot_loaded_speed
            wf/ratio * (1 - (load*radius)/(Ts*ratio)) * radius / $("select#lin_l-u").val(),      // lin_loaded_speed
            ((Is-If)/Ts * radius*load / ratio + If) / parseInt($("input#mot_num").val()),    // current
            radius*load / ratio / Ts * $("input#volt").val()     // stall_voltage
        ];
        tmp.push(tmp[4]*$("select#lin_l-u").val() * load / (tmp[5]*parseInt($("input#mot_num").val()) * $("input#volt").val()));     // efficiency
        return tmp;
    }

    // Update ratio based on driving output
    function update_vals(){
        switch( $("input[type=radio][name=driving]:checked").attr("id") ) {
            case "rat-c":
                var ratio = parseFloat($("input#rat").val());
                break;
            case "rot_f-c":
                var rot_speed = $("input#rot_f").val() * $("select#rot_f-u").val();
                var ratio = wf / rot_speed;
                break;
            case "rot_l-c":
                var rot_speed = $("input#rot_l").val() * $("select#rot_l-u").val();
                var ratio = wf/(2*rot_speed) * (1 + Math.sqrt(1 - 4*(radius*load/Ts)*(rot_speed/wf)));
                break;
            case "lin_f-c":
                var lin_speed = $("input#lin_f").val() * $("select#lin_f-u").val();
                var ratio = wf / lin_speed * radius;
                break;
            case "lin_l-c":
                var lin_speed = $("input#lin_l").val() * $("select#lin_l-u").val();
                var ratio = wf/(2*lin_speed/radius) * (1 + Math.sqrt(1 - 4*(radius*load/Ts)*(lin_speed/radius/wf)));
                break;
            case "current-c":
                var current = $("input#current").val();
                var ratio = radius*load / (Ts/(Is-If)) / (parseInt($("input#mot_num").val()) * current - If);
                break;
            case "st_load-c":
                var stall_load = $("input#st_load").val() * $("select#st_load-u").val();
                var ratio = radius*stall_load/Ts;
                break;
            case "st_volt-c":
                var stall_volt = $("input#st_volt").val();
                var ratio = radius*load/(Ts * stall_volt / $("input#volt").val() );
                break;
            case "max_power-c":
                var ratio = 2*load*radius/Ts;
                break;
            case "max_eff-c":
                var ratio = radius*load / Ts * (1 + Math.sqrt(Is/If));
                break;
            case "stall-c":
                var ratio = radius*load / Ts;
                break;
        }
        
        if (!isNaN(ratio)) {
            var vals = calculate_vals(ratio);
            $("input#rat").val( +(ratio.toFixed(2)) );
            $("input#rot_f").val( +(vals[0].toFixed(2)) );
            $("input#lin_f").val( +(vals[1].toFixed(2)) );
            $("input#st_load").val( +(vals[2].toFixed(2)) );
            $("input#rot_l").val( +(vals[3].toFixed(2)) );
            $("input#lin_l").val( +(vals[4].toFixed(2)) );
            $("input#current").val( +(vals[5].toFixed(2)) );
            $("input#st_volt").val( +(vals[6].toFixed(2)) );
            $("input#eff").val( +((vals[7]*100).toFixed(1)) );
            draw_graph(+(ratio.toFixed(2)));
        } else {
            let id = $("input[type=radio][name=driving]:checked").attr("id").split("-")[0];
            $("input#" + id).css('background-color', "#bd2d2d");
            $("div.inputs input:not(#" + id + ")").val("");
            draw_graph(0);
        }
        
    }
    $("div.field select").change(update_vals);

    $("div.inputs input[type=number]").change(function(){
        $(this).siblings("input[type=radio]").prop("checked", true).change();
        update_vals();
    });

    $("input[type=radio]").change(function(){
        $("button.max").css("background-color", "var(--med-light)");
        $("div.inputs input[type=number]").css("background-color", "white");
        $("input[type=radio]:checked").siblings("input[type=number]").css("background-color", "var(--selected)");
    })

    $("button.max").click(function(){
        $("button.max").css("background-color", "var(--med-light)");
        $(this).find("input").prop("checked", true).change();
        $(this).css("background-color", "var(--selected)");
        update_vals();
    });
    $("button.max").hover(function(){
        if (!$(this).children("input").prop("checked"))
            $(this).css("background-color", "var(--dark)");
    }, function(){
        if (!$(this).children("input").prop("checked"))
            $(this).css("background-color", "var(--med-light)");
    });

    // Update graph limits
    function graph_lims(){
        $("input#gr-min").val(+((2*load*radius/Ts).toFixed(2)));
        $("input#gr-max").val(+((radius*load/Ts*(1+Math.sqrt(Is/If))).toFixed(2)));
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
                                return legend_item["lineDash"].length == 0;
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
    $("div.graph-limits input").change(draw_graph);
});