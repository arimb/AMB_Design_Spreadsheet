var motors, motor_vals;
const colors = ["#0072BD", "#D95319", "#EDB120", "#7E2F8E", "#77AC30", "#4DBEEE"];

$(function(){

    $("button.save-img").on("click", () => {
        html2canvas($("div#graphs")[0]).then(canvas => {
            // var imageData = canvas.toDataURL("image/png");
            // // var newData = imageData.replace(/^data:image\/png/, "data:application/octet-stream");
            // download(imageData, document.title + ".png")
            var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            // window.location.href=image; // it will save locally
            download(image, document.title + ".png");
        });
    });

    $("button.add").on("click", function(){
        $("div.motor#0").hide();
        $("div.motor-list").css("background-color", "inherit");
        let motors = JSON.parse($("input#num-motors").val());
        let i = Math.max.apply(null, motors) + 1;
        insert_motor(i);
        motors.push(i);
        $("input#num-motors").val( JSON.stringify(motors) ).trigger("change");
        if (motors.length >= 7)
            $("button.add").prop("disabled", true);
    });
    $("input, select").on("change", graph);

    $("input#num-motors").on("change", function(){
        let motors = JSON.parse($("input#num-motors").val());
        if (motors.length > 1) {
            $("div.motor#0").hide();
            $("div.motor-list").css("background-color", "inherit");
        }
        for (let j = 0; j < motors.length; j++) {
            const i = motors[j];
            if ($("div.motor#" + i).length === 0) {
                insert_motor(i);
            }
        }
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

    url_query();
});

function insert_motor(i){
    $("div.motor-list").append(
        `<div class="motor" id="${i}">
            <h4 class="mot_title"></h4>
            <select id="motor-type${i}" class="motor-type">
                <option>Custom</option>
            </select>
            <label>Free Speed</label>
            <div class="field">
                <input id="mot_wf${i}" class="mot_wf motor-prop" type="number" step="any" min="0" disabled>
                &nbsp;rpm
            </div>
            <label>Stall Torque</label>
            <div class="field">
                <input id="mot_ts${i}" class="mot_ts motor-prop" type="number" step="any" min="0" disabled>
                <select id="mot_ts-u${i}" class="mot_ts-u motor-update motor-prop">
                    <option value="1">Nm</option>
                    <option value="0.00706">oz-in</option>
                    <option value="1.35582">ft-lbs</option>
                </select>
            </div>
            <label>Free Current</label>
            <div class="field">
                <input id="mot_if${i}" class="mot_if motor-prop" type="number" step="any" min="0" disabled>
                &nbsp;Amps
            </div>
            <label>Stall Current</label>
            <div class="field">
                <input id="mot_is${i}" class="mot_is motor-prop" type="number" step="any" min="0" disabled>
                &nbsp;Amps
            </div>
            <label data-tipso="Voltage at the motor leads">Voltage</label>
            <div class="field">
                <input id="mot_volt${i}" class="mot_volt" type="number" step="any" min="0" value="12">
                &nbsp;Volts
            </div>
            <label data-tipso="Motor-side current limit (per motor)">Max Current</label>
            <div class="field">
                <input id="mot_maxi${i}" class="mot_maxi" type="number" step="any" min="0">
                &nbsp;Amps
            </div>
            <div class="field">
                <label># Motors</label>
                <input id="mot_num${i}" class="mot_num" type="number" min="1" step="1" value="1">
            </div>
            <label>Gear Ratio</label>
            <div class="field">
                <input id="mot_rat${i}" class="mot_rat" type="number" min="1" step="1" value="1">
                <span>&nbsp;: 1</span>
            </div>
            <button class="delete" id="btn-${i}">DELETE</button>
        </div>`
    );

    // Write title number
    $("div.motor:not(#0) h4.mot_title").each(function(i, el){ $(el).text(i+1); });

    // Populate motor type dropdown
    const motor_names = Object.keys(motors);
    for (let i = motor_names.length-1; i >= 0; i--) {
        $("div.motor:last select.motor-type").prepend("<option>" + motor_names[i] + "</option>");
    }

    // Set up motor type dropdown
    $("div.motor:last select.motor-type").on("change", function(){
        let el = $(this).parent();
        if(el.find("select.motor-type").val() === "Custom") {
            el.find(".motor-prop").prop("disabled", false);
        } else {
            el.find("input.mot_wf").val(motors[el.find("select.motor-type").val()][0]);
            el.find("input.mot_ts").val(motors[el.find("select.motor-type").val()][1]);
            el.find("select.mot_ts-u").val(el.find("select.mot_ts-u").children()[0].value);
            el.find("input.mot_if").val(motors[el.find("select.motor-type").val()][2]);
            el.find("input.mot_is").val(motors[el.find("select.motor-type").val()][3]);
            el.find(".motor-prop").prop("disabled", true);
        }
    });
    $("div.motor:last select.motor-type").val(motor_names[0]).trigger("change");
    
    // Set up delete button
    $("div.motor:last button.delete").on("click", function(){
        let motors = JSON.parse($("input#num-motors").val());
        motors = motors.filter(el => el !== $(this).parent().attr("id"));
        $("input#num-motors").val(JSON.stringify(motors)).trigger("change");
        $(this).parent().remove();
        if($("div.motor").length === 1) {
            $("div.motor").show();
            $("div.motor-list").css("background-color", "#b3bdb3");
        }
        $("button.add").prop("disabled", false);
        $("div.motor:not(#0) h4.mot_title").each(function(i, el){ $(el).text(i+1); });
    });

    // Set up unit conversion
    $("div.motor:last select.units").on("change", function(){
        $(this).parent().find("span.unit").text($(this).children(":selected").text());
        $(this).parent().find("input.dist").each( (i, el) => {
            if ($(el).val() !== "")
                $(el).val(+(($(el).val() * $(this).data("unit-factor") / $(this).val()).toFixed(3)));
        });
        $(this).data("unit-factor", $(this).val());
    }).trigger("change");

    // Update graph on change
    $("div.motor:last input, div.motor:last select").on("change", graph).on("change", url_query_set);
    $("div.motor:last button").on("click", graph);

    // Set up tooltips
    $("div.motor:last [data-tipso]").tipso({
        width: null,
        maxWidth: 300,
        background: "#405a3f",
        color: "#fff",
        speed: 200
    });
}

function graph() {
    motor_vals = $("div.motor:not(#0)").map(function(){
        return {
            name: $(this).find("select.motor-type").val(),
            wf: parseFloat($(this).find("input.mot_wf").val()),
            Ts: parseFloat($(this).find("input.mot_ts").val()) * parseFloat($(this).find("select.mot_ts-u").val()),
            If: parseFloat($(this).find("input.mot_if").val()),
            Is: parseFloat($(this).find("input.mot_is").val()),
            volt: parseFloat($(this).find("input.mot_volt").val()),
            max_i: parseFloat($(this).find("input.mot_maxi").val()),
            n: parseFloat($(this).find("input.mot_num").val()),
            ratio: parseFloat($(this).find("input.mot_rat").val())
        };
    });

    if (motor_vals.length === 0) return;

    for (let i = 0; i < motor_vals.length; i++) {
        let el = motor_vals[i];
        motor_vals[i].maxT = el.Ts * ((el.max_i ? el.max_i : el.Is) - el.If) / (el.Is - el.If) * el.n * el.ratio * (el.volt/12);
    }
    let max_torque = Math.max(...motor_vals.map((i, el) => el.maxT).get());
    
    let torques = new Array(301);
    let speeds = [...Array(301)].map(_=>Array(motor_vals.length));
    let currents = [...Array(301)].map(_=>Array(motor_vals.length));
    let powers = [...Array(301)].map(_=>Array(motor_vals.length));
    let effs = [...Array(301)].map(_=>Array(motor_vals.length));

    for (let i = 0; i < torques.length; i++) {
        torques[i] = max_torque * (i/300);
        for (let j = 0; j < motor_vals.length; j++) {
            let mv = motor_vals[j];
            if (torques[i] < mv.maxT) {
                speeds[i][j] = mv.wf * (1 - torques[i] / (mv.Ts*mv.n*mv.ratio*(mv.volt/12))) / mv.ratio * (mv.volt/12);
                currents[i][j] = mv.If*mv.n*(mv.volt/12) + (mv.Is - mv.If) * torques[i] / (mv.Ts*mv.ratio);
                powers[i][j] = speeds[i][j] * torques[i] * (Math.PI / 30);
                effs[i][j] = powers[i][j] / (mv.volt * currents[i][j]) * 100;
            } else {
                speeds[i][j] = NaN;
                currents[i][j] = NaN;
                powers[i][j] = NaN;
                effs[i][j] = NaN;
            }
        }
    }

    $("canvas").remove();
    $("div#graphs").append(
        `<canvas id="speed-graph"></canvas>
        <canvas id="current-graph"></canvas>
        <canvas id="power-graph"></canvas>
        <canvas id="eff-graph"></canvas>`
    );

    drawChart("speed-graph", "Speed (rpm)", torques, speeds);
    drawChart("current-graph", "Total Current (A)", torques, currents);
    drawChart("power-graph", "Power (W)", torques, powers);
    drawChart("eff-graph", "Efficiency (%)", torques, effs);

}

function drawChart(id, ylabel, torques, plot_vals) {
    var graph = new Chart(id, {
        type: "line",
        data: {
            labels: torques.map(el => el.toFixed(2)),
            datasets: plot_vals[0].map(function(_,i) { return {
                    data: plot_vals.map(el => el[i]), 
                    label: (i+1) + " (" + motor_vals[i].name + ")", 
                    borderColor: colors[i%6], 
                    backgroundColor: colors[i%6]
                };})
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    position: "bottom",
                    title: {
                        display: true,
                        text: "Torque (Nm)"
                    },
                    beginAtZero: true
                },
                y: {
                    display: true,
                    position: "left",
                    title: {
                        display: true,
                        text: ylabel,
                        font: {
                            size: 14,
                            weight: "bold"
                        }
                    },
                    beginAtZero: true,
                    min: 0
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        }
    });
}

function download(content, filename) {
    var link = document.createElement('a');
    link.setAttribute('download', filename);
    link.setAttribute('href', content);
    link.trigger("click");
    link.remove();
}