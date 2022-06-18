let wf, Ts, If, Is, radius, load

$(document).ready(function(){

    var motors;
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

    // Update motor properties
    function update_motor(){
        wf = $("input#motor_free_speed").val() * (Math.PI/30) * ($("input#applied_voltage").val() / 12);
        Ts = $("input#motor_stall_torque").val() * $("select#motor_stall_torque_units").val() * ($("input#applied_voltage").val() / 12) * ($("input#gearbox_efficiency").val() / 100) * $("input#num_motors").val();
        If = $("input#motor_free_current").val() * ($("input#applied_voltage").val() / 12) * $("input#num_motors").val();
        Is = $("input#motor_stall_current").val() * ($("input#applied_voltage").val() / 12) * $("input#num_motors").val();
        
        // Update graph min (max power) and max (max efficiency) then redraw
        $("input#graph-min").val((2*load*radius/Ts).toFixed(2));
        $("input#graph-max").val((radius*load/Ts*(1+Math.sqrt(Is/If))).toFixed(2));
        draw_graph();
    }
    $("input[id^=motor_]").change(update_motor);
    $("select#motor_stall_torque_units").change(update_motor);
    $("input#num_motors").change(update_motor);
    $("input#applied_voltage").change(update_motor);
    $("input#gearbox_efficiency").change(update_motor);

});