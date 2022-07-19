let wf, Ts, If, Is, radius, load

$(document).ready(function(){
    
    // Load motor properties
    var motors;
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
    $("select#motor_name").change(() => {
        if($("select#motor_name").val() == "Custom"){
            $(".motor-prop").prop("disabled", false);
        }else{
            $("input#motor_free_speed").val(motors[$("select#motor_name").val()][0]);
            $("input#motor_stall_torque").val(motors[$("select#motor_name").val()][1]);
            $("select#motor_stall_torque-units").val($("select#motor_stall_torque-units").children()[0].value);
            $("input#motor_free_current").val(motors[$("select#motor_name").val()][2]);
            $("input#motor_stall_current").val(motors[$("select#motor_name").val()][3]);
            $(".motor-prop").prop("disabled", true);
        }
        $("input#num_motors").change();
    });

    // Update motor properties
    $(".motor-prop, input#num_motors, input#applied_voltage").change(() => {
        wf = $("input#motor_free_speed").val() * (Math.PI/30) * ($("input#applied_voltage").val()/12);
        Ts = $("input#motor_stall_torque").val() * $("select#motor_stall_torque-units").val() * ($("input#applied_voltage").val()/12) * ($("input#gearbox_efficiency").val()/100) * parseInt($("input#num_motors").val());
        If = $("input#motor_free_current").val() * ($("input#applied_voltage").val()/12) * parseInt($("input#num_motors").val());
        Is = $("input#motor_stall_current").val() * ($("input#applied_voltage").val()/12) * parseInt($("input#num_motors").val());
        
        graph_lims();
        update_vals();
    });

    // Update radius
    $("input#radius, select#radius-units").change(() => {
        radius = $("input#radius").val() * $("select#radius-units").val();
        graph_lims();
        update_vals();
    });
    $("input#radius").change();

    // Update load
    $("input#load, select#load-units").change(() => {
        load = $("input#load").val() * $("select#load-units").val();
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
            $("input#gear_ratio").val($("input#total-ratio").val()).change();
    });

    // Calculate outputs from ratio
    function calculate_vals(ratio){
        tmp = [
            wf / ratio / $("select#rot_speed-units").val(),     // rot_speed
            wf/ratio * radius / $("select#lin_speed-units").val(),      // lin_speed
            Ts * ratio  / radius / $("select#stall_load-units").val(),      // stall_load
            wf/ratio * (1 - (load*radius)/(Ts*ratio)) / $("select#rot_speed_loaded-units").val(),      // rot_speed_loaded
            wf/ratio * (1 - (load*radius)/(Ts*ratio)) * radius / $("select#lin_speed_loaded-units").val(),      // lin_speed_loaded
            ((Is-If)/Ts * radius*load / ratio + If) / parseInt($("input#num_motors").val()),    // current
            radius*load / ratio / Ts * $("input#applied_voltage").val()     // stall_voltage
        ];
        tmp.push(tmp[4]*$("select#lin_speed_loaded-units").val() * load / (tmp[5]*parseInt($("input#num_motors").val()) * $("input#applied_voltage").val()));     // efficiency
        return tmp;
    }

    // Update ratio based on driving output
    function update_vals(){
        switch( $("input[type=radio][name=driving]:checked").attr("id") ) {
            case "gear_ratio_check":
                var ratio = parseFloat($("input#gear_ratio").val());
                break;
            case "rot_speed_check":
                var rot_speed = $("input#rot_speed").val() * $("select#rot_speed-units").val();
                var ratio = wf / rot_speed;
                break;
            case "rot_speed_loaded_check":
                var rot_speed = $("input#rot_speed_loaded").val() * $("select#rot_speed_loaded-units").val();
                var ratio = wf/(2*rot_speed) * (1 + Math.sqrt(1 - 4*(radius*load/Ts)*(rot_speed/wf)));
                break;
            case "lin_speed_check":
                var lin_speed = $("input#lin_speed").val() * $("select#lin_speed-units").val();
                var ratio = wf / lin_speed * radius;
                break;
            case "lin_speed_loaded_check":
                var lin_speed = $("input#lin_speed_loaded").val() * $("select#lin_speed_loaded-units").val();
                var ratio = wf/(2*lin_speed/radius) * (1 + Math.sqrt(1 - 4*(radius*load/Ts)*(lin_speed/radius/wf)));
                break;
            case "current_check":
                var current = $("input#current").val();
                var ratio = radius*load / (Ts/(Is-If)) / (parseInt($("input#num_motors").val()) * current - If);
                break;
            case "stall_load_check":
                var stall_load = $("input#stall_load").val() * $("select#stall_load-units").val();
                var ratio = radius*stall_load/Ts;
                break;
            case "stall_voltage_check":
                var stall_voltage = $("input#stall_voltage").val();
                var ratio = radius*load/(Ts * stall_voltage / $("input#applied_voltage").val() );
                break;
            case "max_power_check":
                var ratio = 2*load*radius/Ts;
                break;
            case "max_efficiency_check":
                var ratio = radius*load / Ts * (1 + Math.sqrt(Is/If));
                break;
            case "stall_check":
                var ratio = radius*load / Ts;
                break;
        }
        
        var vals = calculate_vals(ratio);
        $("input#gear_ratio").val( +(ratio.toFixed(2)) );
        $("input#rot_speed").val( +(vals[0].toFixed(2)) );
        $("input#lin_speed").val( +(vals[1].toFixed(2)) );
        $("input#stall_load").val( +(vals[2].toFixed(2)) );
        $("input#rot_speed_loaded").val( +(vals[3].toFixed(2)) );
        $("input#lin_speed_loaded").val( +(vals[4].toFixed(2)) );
        $("input#current").val( +(vals[5].toFixed(2)) );
        $("input#stall_voltage").val( +(vals[6].toFixed(2)) );
        $("input#efficiency").val( +((vals[7]*100).toFixed(1)) );
        draw_graph(+(ratio.toFixed(2)));
    }

    $("div.field select").change(update_vals);
    $("div.inputs input[type=number]").change(function(){
        $(this).siblings("input[type=radio]").prop("checked", true).change();
        update_vals();
    });

    $("input[type=radio]").change(function(){
        $("button.max").css("background-color", "var(--med-light)");
        $("div.inputs input[type=number]").css("background-color", "white");
        console.log($("input[type=radio]:checked"));
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
        $("input#graph-min").val(+((2*load*radius/Ts).toFixed(2)));
        $("input#graph-max").val(+((radius*load/Ts*(1+Math.sqrt(Is/If))).toFixed(2)));
    }

    // Draw graph
    function draw_graph(ratio){
        $("canvas#graph").remove();
        $("div.graph").prepend('<canvas id="graph"></canvas>');
        
        var ratios = [];
        var data = [];
        const min = parseFloat($("input#graph-min").val());
        const max = parseFloat($("input#graph-max").val());
        for (let r = min; r < max; r*=Math.pow(max/min, 1/30)) {
            ratios.push(r);
            data.push(calculate_vals(r));
        }
        var graph = new Chart("graph", {
            type: "line",
            data: {
                labels: ratios,
                datasets: [{
                    data: data.map(function(value,index) { return value[0]*$("select#rot_speed-units").val()/6.283; }),
                    label: "Free Rotational Speed",
                    borderColor: "red",
                    fill: false,
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return value[3]*$("select#rot_speed_loaded-units").val()/6.283; }),
                    label: "Loaded Rotational Speed",
                    borderColor: "magenta",
                    fill: false,
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return value[5]; }),
                    label: "Current Per Motor",
                    borderColor: "orange",
                    fill: false,
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return value[6]; }),
                    label: "Stall Voltage",
                    borderColor: "green",
                    fill: false,
                    yAxisID: "right",
                    pointRadius: 0
                },{
                    data: data.map(function(value,index) { return 100*value[7]; }),
                    label: "Efficiency",
                    borderColor: "blue",
                    fill: false,
                    pointRadius: 0
                },
                {
                    data: [{x: (ratio ? ratio : 0), y: 0}, {x: (ratio ? ratio : 0), y: (ratio ? Math.max.apply(null, data.map(value => value[6])) : 0)}],
                    borderColor: "red",
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "right",
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
                    left: {
                        display: true,
                        position: "left",
                        title: {
                            display: true,
                            text: "Speed (rev/s), Current (A), Efficiency (%)"
                        }
                    },
                    right: {
                        display: true,
                        position: "right",
                        title: {
                            display: true,
                            text: "Voltage (V)"
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            filter: function(legend_item, data) {
                                return legend_item["lineDash"].length == 0;
                            }
                        }
                    }
                }
            }
        })
    }
    setTimeout(() => { draw_graph(); }, 100);
    $("div.graph-limits input").change(draw_graph);
});