var gears;
var min_ratio, max_ratio;

$(document).ready(function(){
    
    $("div.sources input").change(function(){
        gears = {};
        $("div.sources input:checked").each((i,el) => {
            let request = new XMLHttpRequest();
            request.onload = function(){
                let data = JSON.parse(this.responseText);
                const shaft_types = Object.keys(data);
                for (let i = shaft_types.length-1; i >= 0; i--) {
                    if ($("select.gear-type option").map((i,el) => el.text).get().indexOf(shaft_types[i]) == -1)
                        $("select.gear-type").prepend("<option value='" + data[shaft_types[i]]["diam"] + "'>" + shaft_types[i] + "</option>");
                }
                $("select.gear-type>:first-child").attr('selected', 'selected');

                var prev_keys = Object.keys(gears);
                $("div.gear-list span").remove();
                Object.keys(data).forEach(geartype => {
                    let geartype_name = geartype.replaceAll(/\s|"|\//g, '');
                    if ($("div.gear-list").map((i,el) => el.id).get().indexOf(geartype_name) == -1) {
                        $("div.stock").append(
                            `<div class="gear-list" id="${geartype_name}">
                                <h4>${geartype}</h4>
                            </div>`
                        );
                    }
                    if (prev_keys.indexOf(geartype) == -1)
                        gears[geartype] = [];
                    
                    data[geartype]["gears"].forEach(gear => {
                        if (gears[geartype].map(x=>x.toString()).indexOf(gear.toString()) == -1)
                            gears[geartype].push(gear);
                    });
                    gears[geartype].sort();
                    gears[geartype].forEach(gear => {
                        if (gear.length == 1)
                            $("div.gear-list#" + geartype_name).append(`<span>${gear[0]}</span>`);
                        else
                            $("div.gear-list#" + geartype_name).append(`<span>${gear[0]} (${gear[1]})</span>`);
                    });
                });
            };
            request.open("GET", `ref/gears-${el.id}.json`, false);
            request.send();
        });
        
        update_gearbox();
    });
    $("input#vex").change();

    $("input[type=radio][name=num_stages]").change(function(){
        switch ($("input[type=radio][name=num_stages]:checked").prop("id")) {
            case "1st":
                $(".1stage").show();    
                $(".2stage").hide();
                break;
            case "2st":
                $(".1stage").hide();
                $(".2stage").show();
                break;
        }
    });
    $("input[type=radio][name=num_stages]").change();

    $("select#type2").change(function(){
        $("select#type3").val($("select#type2").val());
    })

    $("select#type3").change(function(){
        $("select#type2").val($("select#type3").val());
    })

    $("select#clr1").change(function(){
        $("div#clearance div.field:has(input#clr1cstm)").css("visibility", ($("select#clr1").val() == "Custom" ? "visible" : "hidden"));
    });

    $("select#clr4").change(function(){
        $("div#clearance div.field:has(input#clr4cstm)").css("visibility", ($("select#clr4").val() == "Custom" ? "visible" : "hidden"));
    });

    //Calculate Gearbox Options
    function calc_gearbox(){
        if (Object.keys(gears).length == 0)
            return [];
        
        var gearboxes = [];
        var two_stage = ($("input[type=radio][name=num_stages]:checked").prop("id") == "2st");
        min_ratio = $("input#ratio").val()*(1-$("input#rat_dev").val()/100);
        max_ratio = $("input#ratio").val()*(1+$("input#rat_dev").val()/100);

        var gear1options = gears[$("select#type1 option:selected").text()];//["gears"];
        gear1options = gear1options.filter(function(gear){
            if ($("input#min1").val() && gear[0] < $("input#min1").val()) return false;
            if ($("input#max1").val() && gear[0] > $("input#max1").val()) return false;
            if ($("input#min1d").val() && gear.last()/20+0.1 < $("input#min1d").val()/$("select#min1d-u").val()) return false;
            if ($("input#max1d").val() && gear.last()/20+0.1 > $("input#max1d").val()/$("select#max1d-u").val()) return false;
            return true;
        });
        var gear4options = gears[$("select#type4 option:selected").text()];//["gears"];
        gear4options = gear4options.filter(function(gear){
            if ($("input#min4").val() && gear[0] < $("input#min4").val()) return false;
            if ($("input#max4").val() && gear[0] > $("input#max4").val()) return false;
            if ($("input#min4d").val() && gear.last()/20+0.1 < $("input#min4d").val()/$("select#min4d-u").val()) return false;
            if ($("input#max4d").val() && gear.last()/20+0.1 > $("input#max4d").val()/$("select#max4d-u").val()) return false;
            return true;
        });
        if (two_stage){
            var gear2options = gears[$("select#type2 option:selected").text()];//["gears"];
            gear2options = gear2options.filter(function(gear){
                if ($("input#min2").val() && gear[0] < $("input#min2").val()) return false;
                if ($("input#max2").val() && gear[0] > $("input#max2").val()) return false;
                if ($("input#min2d").val() && gear.last()/20+0.1 < $("input#min2d").val()/$("select#min2d-u").val()) return false;
                if ($("input#max2d").val() && gear.last()/20+0.1 > $("input#max2d").val()/$("select#max2d-u").val()) return false;
                return true;
            });
            var gear3options = gears[$("select#type3 option:selected").text()];//["gears"];
            gear3options = gear3options.filter(function(gear){
                if ($("input#min3").val() && gear[0] < $("input#min3").val()) return false;
                if ($("input#max3").val() && gear[0] > $("input#max3").val()) return false;
                if ($("input#min3d").val() && gear.last()/20+0.1 < $("input#min3d").val()/$("select#min3d-u").val()) return false;
                if ($("input#max3d").val() && gear.last()/20+0.1 > $("input#max3d").val()/$("select#max3d-u").val()) return false;
                return true;
            });
        }
        
        var ratio;
        gear1options.forEach(gear1 => {
            gear4options.forEach(gear4 => {
                if (two_stage){
                    gear2options.forEach(gear2 => {
                        gear3options.forEach(gear3 => {
                            ratio = gear2[0]/gear1[0] * gear4[0]/gear3[0];
                            if (ratio < min_ratio || ratio > max_ratio) return;
                            if ($("input#min12").val() && (gear1.last()+gear2.last())/40 < $("input#min12").val()/$("select#min12-u").val()) return;
                            if ($("input#max12").val() && (gear1.last()+gear2.last())/40 > $("input#max12").val()/$("select#min12-u").val()) return;
                            if ($("input#min34").val() && (gear3.last()+gear4.last())/40 < $("input#min34").val()/$("select#min34-u").val()) return;
                            if ($("input#max34").val() && (gear3.last()+gear4.last())/40 > $("input#max34").val()/$("select#min34-u").val()) return;
                            if ($("select#clr1").val() != "None" && (gear1.last()+gear2.last()-(gear3.last()+2))/40 < ($("select#clr1").val() == "Custom" ? 
                                $("input#clr1cstm").val()/$("select#clr1cstm-u").val() : $("select#type1").val())) return;
                            if ($("select#clr4").val() != "None" && (gear3.last()+gear4.last()-(gear2.last()+2))/40 < ($("select#clr4").val() == "Custom" ? 
                                $("input#clr4cstm").val()/$("select#clr4cstm-u").val() : $("select#type4").val())) return;
                            gearboxes.push([gear1, gear2, gear3, gear4, ratio]);
                        });
                    });
                } else {
                    ratio = gear4[0]/gear1[0];
                    if (ratio < min_ratio || ratio > max_ratio) return;
                    if ($("input#min14").val() && (gear1.last()+gear4.last())/40 < $("input#min14").val()/$("select#min14-u").val()) return;
                    if ($("input#max14").val() && (gear1.last()+gear4.last())/40 > $("input#max14").val()/$("select#min14-u").val()) return;
                    gearboxes.push([gear1, gear4, ratio]);
                } 
            });
        });
        if (two_stage)
            gearboxes.sort(function(a,b){return Math.abs(a[4]/$("input#ratio").val()-1) - Math.abs(b[4]/$("input#ratio").val()-1);});
        else
            gearboxes.sort(function(a,b){return Math.abs(a[2]/$("input#ratio").val()-1) - Math.abs(b[2]/$("input#ratio").val()-1);});
        return gearboxes;
    }

    function update_gearbox(){
        var gearboxes = calc_gearbox();
        var two_stage = ($("input[type=radio][name=num_stages]:checked").prop("id") == "2st");
        console.log(gearboxes);

        $("table.gearbox-options tbody").empty();
        $("div.warnings span").hide();
        if (gearboxes.length > 0) {
            $("table.gearbox-options").show();
            $("div#gearbox-options").css("justify-content", "unset");
            if (two_stage) {
                gearboxes.forEach(gearbox => {
                    $("table.gearbox-options tbody").append(
                        `<tr>
                            <td>${formatGear(gearbox[0])} : ${formatGear(gearbox[1])}</td>
                            <td>${formatGear(gearbox[2])} : ${formatGear(gearbox[3])}</td>
                            <td>${+(gearbox[4].toFixed(2))} : 1</td>
                        </tr>`
                    )
                });    
            } else {
                gearboxes.forEach(gearbox => {
                    $("table.gearbox-options tbody").append(
                        `<tr>
                            <td>${formatGear(gearbox[0])} : ${formatGear(gearbox[1])}</td>
                            <td>${+(gearbox[2].toFixed(2))} : 1</td>
                        </tr>`
                    )
                });
            }
        } else {
            $("table.gearbox-options").hide();
            $("div#gearbox-options").css("justify-content", "center");
            if (!$("input#ratio").val())
                $("span#no_ratio").show();
            if (Object.keys(gears).length == 0)
                $("span#no_sources").show();
            else if ($("input#ratio").val())
                $("span#no_gearboxes").show();
        }
        
        
    }
    $("input:not([type=checkbox]), select").change(update_gearbox);



});

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

function formatGear(gear){
    if (gear.length == 1)
        return gear[0];
    else
        return gear[0] + "(" + gear[1] + ")";
}