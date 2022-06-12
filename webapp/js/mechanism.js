$(document).ready(function(){
    var motors;
    // Set motor properties
    $("select#motor_name").change(function(){
        if($("select#motor_name").val() == "Custom"){
            $("input#motor_free_speed").prop("disabled", false);
            $("input#motor_stall_torque").prop("disabled", false);
            $("input#motor_free_current").prop("disabled", false);
            $("input#motor_stall_current").prop("disabled", false);
        }else{
            $("input#motor_free_speed").val(motors[$("select#motor_name").val()][0]);
            $("input#motor_stall_torque").val(motors[$("select#motor_name").val()][1]);
            $("input#motor_free_current").val(motors[$("select#motor_name").val()][2]);
            $("input#motor_stall_current").val(motors[$("select#motor_name").val()][3]);
            $("input#motor_free_speed").prop("disabled", true);
            $("input#motor_stall_torque").prop("disabled", true);
            $("input#motor_free_current").prop("disabled", true);
            $("input#motor_stall_current").prop("disabled", true);
        }
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
});