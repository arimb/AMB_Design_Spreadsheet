$(document).ready(function(){

    $("button.add").click(function(){
        $("div.cyl#0").css("display", "none");
        $("div.cyl-list").append(
            `<div class="cyl">
                <input class="name" type="text" size="1">
                <select class="units">
                    <option>inch</option>
                    <option>mm</option>
                </select>
                <label>Bore Diam.</label>
                <div class="field">
                    <input class="bore" type="number" min="0">
                    &nbsp;<span class="unit"></span>
                </div>
                <label>Rod Diam.</label>
                <div class="field">
                    <input class="rod" type="number" min="0">
                    &nbsp;<span class="unit"></span>
                </div>
                <label>Stroke Length</label>
                <div class="field">
                    <input class="stroke" type="number" min="0">
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
            if($("div.cyl").length == 1) $("div.cyl").css("display", "flex");
        });
        $("select.units").change(function(){
            $(this).parent().find("span.unit").text($(this).val());
        });
        $("select.units").change();
    });


});