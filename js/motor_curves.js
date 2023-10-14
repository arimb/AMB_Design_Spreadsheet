var motors;

$(document).ready(function(){

    function insert_motor(i){
        $("div.motor-list").append(
            `<div class="motor" id="${i}">
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
                <label data-tipso="Motor-side current limit">Max Current</label>
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

        // Populate motor type dropdown
        const motor_names = Object.keys(motors);
        for (let i = motor_names.length-1; i >= 0; i--) {
            $("div.motor:last select.motor-type").prepend("<option>" + motor_names[i] + "</option>");
        }

        // Set up motor type dropdown
        $("div.motor:last select.motor-type").change(function(){
            let el = $(this).parent();
            if(el.find("select.motor-type").val() == "Custom") {
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
        $("div.motor:last select.motor-type").val(motor_names[0]).change();
        
        // Set up delete button
        $("div.motor:last button.delete").click(function(){
            let motors = JSON.parse($("input#num-motors").val());
            motors = motors.filter(el => el != $(this).parent().attr("id"));
            $("input#num-motors").val(JSON.stringify(motors)).change();
            if($("div.motor").length == 1) {
                $("div.motor").show();
                $("div.motor-list").css("background-color", "#b3bdb3");
            }
            $(this).parent().remove();
        });

        // Set up unit conversion
        $("div.motor:last select.units").change(function(){
            $(this).parent().find("span.unit").text($(this).children(":selected").text());
            $(this).parent().find("input.dist").each( (i, el) => {
                if ($(el).val() != "") 
                    $(el).val(+(($(el).val() * $(this).data("unit-factor") / $(this).val()).toFixed(3)));
            });
            $(this).data("unit-factor", $(this).val());
        }).change();

        // Update graph on change
        $("div.motor:last input, div.motor:last select").change(graph).change(url_query_set);
        $("div.motor:last button").click(graph);

        // Set up tooltips
        $("div.motor:last [data-tipso]").tipso({
            width: null,
            maxWidth: 300,
            background: "#405a3f",
            color: "#fff",
            speed: 200
        });
    }

    $("button.add").click(function(){
        $("div.motor#0").hide();
        $("div.motor-list").css("background-color", "inherit");
        let motors = JSON.parse($("input#num-motors").val());
        let i = Math.max.apply(null, motors) + 1;
        insert_motor(i);
        motors.push(i);
        $("input#num-motors").val( JSON.stringify(motors) ).change();
    });
    $("input, select").change(graph);

    $("input#num-motors").change(function(){
        let motors = JSON.parse($("input#num-motors").val());
        if (motors.length > 1) {
            $("div.motor#0").hide();
            $("div.motor-list").css("background-color", "inherit");
        }
        for (let j = 0; j < motors.length; j++) {
            const i = motors[j];
            if ($("div.motor#" + i).length == 0) {
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
        $("select#motor").val(motor_names[0]).change();
    };
    request.open("GET", "ref/motors.json", false);
    request.send();


    url_query();
    
});

function graph() {

}