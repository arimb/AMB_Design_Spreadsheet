var total_vol;

$(document).ready(function(){

    $("button.add").click(function(){
        $("div.cyl#0").css("display", "none");
        $("div.cyl-list").css("background-color", "inherit");
        $("div.cyl-list").append(
            `<div class="cyl">
                <input class="name" type="text" size="1">
                <select class="units">
                    <option value="1">inch</option>
                    <option value="25.4">mm</option>
                </select>
                <label>Bore Diam.</label>
                <div class="field">
                    <input class="bore dist" type="number" min="0">
                    &nbsp;<span class="unit"></span>
                </div>
                <label>Rod Diam.</label>
                <div class="field">
                    <input class="rod dist" type="number" min="0">
                    &nbsp;<span class="unit"></span>
                </div>
                <label>Stroke Length</label>
                <div class="field">
                    <input class="stroke dist" type="number" min="0">
                    &nbsp;<span class="unit"></span>
                </div>
                <br>
                <label>Push Pressure</label>
                <div class="field">
                    <input class="push_pressure" type="number" min="0" max="60" value="60">
                    &nbsp;<span>psig</span>
                </div>
                <label>Pull Pressure</label>
                <div class="field">
                    <input class="pull_pressure" type="number" min="0" max="60" value="60">
                    &nbsp;<span>psig</span>
                </div>
                <br>
                <label>Time per Cycle</label>
                <div class="field">
                    <input class="period" type="number" min="0">
                    &nbsp;<span>sec</span>
                </div>
                <label>Start Time</label>
                <div class="field">
                    <input class="start" type="number" min="0" max="150" value="0">
                    &nbsp;<span>sec</span>
                </div>
                <label>End Time</label>
                <div class="field">
                    <input class="end" type="number" min="0" max="150" value="150">
                    &nbsp;<span>sec</span>
                </div>
                <button class="delete">DELETE</button>
            </div>`
        );
        $("button.delete:not(#0)").click(function(){
            $(this).parent().remove();
            if($("div.cyl").length == 1) {
                $("div.cyl").css("display", "flex");
                $("div.cyl-list").css("background-color", "#b3bdb3");
            }
        });
        $("select.units").change(function(){
            $(this).parent().find("span.unit").text($(this).children(":selected").text());
            $(this).parent().find("input.dist").each( (i, el) => $(el).val(+(($(el).val() * $(this).data("unit-factor") / $(this).val()).toFixed(3))) );
            $(this).data("unit-factor", $(this).val());
        });
        $("select.units").change();
        $("input, select").change(simulate);
        $("button").click(simulate);
    });
    $("input, select").change(simulate);

    function update_tanks(){
        total_vol = 0;
        $("div#tanks").find("div.tank").each(function(){
            total_vol += $(this).find("input.tank_vol").val() * $(this).find("select.tank_vol-units").val() * $(this).find("input.tank_qty").val() * $(this).find("input.tank_press").val();
        });
        total_vol /= 120;
        $("input#tanks-total").val(+((total_vol / $("select#tanks-total-units").val()).toFixed(2)));
    }

    $("div#tanks").find("input:not(.name), select").change(update_tanks);
    update_tanks();

    $("select.tank_vol-units").each((i, el) => $(el).data("unit-factor", $(el).val())).change(function(){
        let input = $(this).siblings("input." + $(this).prop("class").split("-")[0]);
        input.val(+((input.val() * $(this).data("unit-factor") / $(this).val()).toFixed(3)));
        $(this).data("unit-factor", $(this).val());
        update_tanks();
    });

    simulate();

});

function simulate(){
    const coeffs = JSON.parse($("select#compressor").val());
    const trigger = $("input#trigger_press").val();
    const cutoff = $("input#cutoff_press").val();
    var min_press = 0;
    const cyls = $("div.cyl:not(#0)").map((i,cyl) => {
        const bore = $(cyl).find("input.bore").val() * $(cyl).find("select.units").val();
        const rod = $(cyl).find("input.rod").val() * $(cyl).find("select.units").val();
        const stroke = $(cyl).find("input.stroke").val() * $(cyl).find("select.units").val();
        const push_pressure = $(cyl).find("input.push_pressure").val();
        const pull_pressure = $(cyl).find("input.pull_pressure").val();
        min_press = Math.max(min_press, push_pressure, pull_pressure);

        const period = $(cyl).find("input.period").val();
        return {
            vol: Math.PI*(bore/2)**2 * stroke * (push_pressure/120) + Math.PI*((bore/2)**2 - (rod/2)**2) * stroke * (pull_pressure/120),
            period: period=="" ? Infinity : period,
            start: $(cyl).find("input.start").val(),
            end: $(cyl).find("input.end").val()
        };
    }).get();
    const dt = 1;
    var P = parseFloat($("input#initial_press").val());
    var comp_state = true;
    
    var data = [];
    for (var t=0; t<=150; t+=dt) {
        data.push([t,P]);
        var VP_add = 0;
        if (P <= trigger) comp_state = true;
        if (P >= cutoff) comp_state = false;
        if (comp_state) VP_add += coeffs.map((val,i) => val * P**i).reduce((a,b) => a+b) * 12**3/60*14.7 * dt; 
        
        cyls.forEach(({vol,period,start,end}) => {
            if (t >= start && t <= end) {
                if (period >= dt && (t-start)%period < dt) VP_add -= vol*P;
                else if (period < dt) VP_add -= vol*P/period;
            }
        });

        P += VP_add/total_vol;
        P = Math.max(P, 0);
    }

    // plot graph
    $("canvas#graph").remove();
    $("div.graph").prepend('<canvas id="graph"></canvas>');
    var graph = new Chart("graph", {
        type: "line",
        data: {
            labels: data.map(x => x[0]),
            datasets: [{
                data: data.map(x => x[1]),
                borderColor: "black",
                fill: false,
                pointRadius: 0
            },{
                data: [{x: 0, y: trigger}, {x: 150, y: trigger}],
                borderColor: "magenta",
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            },{
                data: [{x: 0, y: min_press}, {x: 150, y: min_press}],
                borderColor: "red",
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    position: "bottom",
                    title: {
                        display: true,
                        text: "Time (sec)"
                    }
                },
                y: {
                    display: true,
                    position: "left",
                    title: {
                        display: true,
                        text: "Pressure (psig)"
                    },
                    beginAtZero: true
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