var gears;
var min_ratio, max_ratio;

$(document).ready(function(){

    function load_gears(response){
        gears = JSON.parse(response);
        const shaft_types = Object.keys(gears);
        for (let i = shaft_types.length-1; i >= 0; i--) {
            $("select.gear-type").prepend("<option value='" + gears[shaft_types[i]]["diam"] + "'>" + shaft_types[i] + "</option>");
        }
        $("select.gear-type>:first-child").attr('selected', 'selected');

        Object.keys(gears).forEach(geartype => {
            $("div.stock").append(
                `<div class="gear-list" id="${geartype.replaceAll(/\s|"|\//g, '')}">
                    <h4>${geartype}</h4>`
            );
            gears[geartype]["gears"].forEach(gear => {
                if (gear.length == 1) {
                    $("div.gear-list#" + geartype.replaceAll(/\s|"|\//g, '')).append(`<span>${gear[0]}</span>`);
                } else {
                    $("div.gear-list#" + geartype.replaceAll(/\s|"|\//g, '')).append(`<span>${gear[0]} (${gear[1]})</span>`);
                }
            });
        });
        
    }

    $("select#gear-list").change(function(){
        
        if ($("select#gear-list").val() == "Custom"){
            $("input#gear-list-custom").click();
        } else {
            const request = new XMLHttpRequest();
            request.onload = function(){ load_gears(this.responseText); };
            request.open("GET", $("select#gear-list").val());
            request.send();
        }
        
    });
    $("select#gear-list").change();

    $("input#gear-list-custom").change(function(){
        var reader = new FileReader();
        reader.onload = function(){ load_gears(this.result); };
        reader.readAsText($("input#gear-list-custom")[0].files[0]);
    });

    $("input[type=radio][name=num_stages]").change(function(){
        switch ($("input[type=radio][name=num_stages]:checked").val()) {
            case "1":
                $("div.1stage").show();    
                $(".2stage").hide();
                $("img#diagram").attr("src", "img/gear_options_1stage.png");
                break;
            case "2":
                $("div.1stage").hide();
                $(".2stage").show();
                $("img#diagram").attr("src", "img/gear_options_2stage.png");
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

    $("select#clearance1").change(function(){
        $("div#clearance div.field:has(input#clearance1custom)").css("visibility", ($("select#clearance1").val() == "Custom" ? "visible" : "hidden"));
    });

    $("select#clearance4").change(function(){
        $("div#clearance div.field:has(input#clearance4custom)").css("visibility", ($("select#clearance4").val() == "Custom" ? "visible" : "hidden"));
    });

    //Calculate Gearbox Options
    function calc_gearbox(){
        var gearboxes = [];
        var two_stage = ($("input[type=radio][name=num_stages]:checked").val() == "2");
        min_ratio = $("input#ratio").val()*(1-$("input#ratio_deviation").val()/100);
        max_ratio = $("input#ratio").val()*(1+$("input#ratio_deviation").val()/100);

        var gear1options = gears[$("select#type1 option:selected").text()]["gears"];
        gear1options = gear1options.filter(function(gear){
            if ($("input#min1").val() && gear[0] < $("input#min1").val()) return false;
            if ($("input#max1").val() && gear[0] > $("input#max1").val()) return false;
            if ($("input#min1diam").val() && gear.last()/20+0.1 < $("input#min1diam").val()/$("select#min1diam-units").val()) return false;
            if ($("input#max1diam").val() && gear.last()/20+0.1 > $("input#max1diam").val()/$("select#max1diam-units").val()) return false;
            return true;
        });
        var gear4options = gears[$("select#type4 option:selected").text()]["gears"];
        gear4options = gear4options.filter(function(gear){
            if ($("input#min4").val() && gear[0] < $("input#min4").val()) return false;
            if ($("input#max4").val() && gear[0] > $("input#max4").val()) return false;
            if ($("input#min4diam").val() && gear.last()/20+0.1 < $("input#min4diam").val()/$("select#min4diam-units").val()) return false;
            if ($("input#max4diam").val() && gear.last()/20+0.1 > $("input#max4diam").val()/$("select#max4diam-units").val()) return false;
            return true;
        });
        if (two_stage){
            var gear2options = gears[$("select#type2 option:selected").text()]["gears"];
            gear2options = gear2options.filter(function(gear){
                if ($("input#min2").val() && gear[0] < $("input#min2").val()) return false;
                if ($("input#max2").val() && gear[0] > $("input#max2").val()) return false;
                if ($("input#min2diam").val() && gear.last()/20+0.1 < $("input#min2diam").val()/$("select#min2diam-units").val()) return false;
                if ($("input#max2diam").val() && gear.last()/20+0.1 > $("input#max2diam").val()/$("select#max2diam-units").val()) return false;
                return true;
            });
            var gear3options = gears[$("select#type3 option:selected").text()]["gears"];
            gear3options = gear3options.filter(function(gear){
                if ($("input#min3").val() && gear[0] < $("input#min3").val()) return false;
                if ($("input#max3").val() && gear[0] > $("input#max3").val()) return false;
                if ($("input#min3diam").val() && gear.last()/20+0.1 < $("input#min3diam").val()/$("select#min3diam-units").val()) return false;
                if ($("input#max3diam").val() && gear.last()/20+0.1 > $("input#max3diam").val()/$("select#max3diam-units").val()) return false;
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
                            if ($("input#min12dist").val() && (gear1.last()+gear2.last())/40 < $("input#min12dist").val()/$("select#min12dist-units").val()) return;
                            if ($("input#max12dist").val() && (gear1.last()+gear2.last())/40 > $("input#max12dist").val()/$("select#min12dist-units").val()) return;
                            if ($("input#min34dist").val() && (gear3.last()+gear4.last())/40 < $("input#min34dist").val()/$("select#min34dist-units").val()) return;
                            if ($("input#max34dist").val() && (gear3.last()+gear4.last())/40 > $("input#max34dist").val()/$("select#min34dist-units").val()) return;
                            if ($("select#clearance1").val() != "None" && (gear1.last()+gear2.last()-(gear3.last()+2))/40 < ($("select#clearance1").val() == "Custom" ? 
                                $("input#clearance1custom").val()/$("select#clearance1custom-units").val() : $("select#type1").val())) return;
                            if ($("select#clearance4").val() != "None" && (gear3.last()+gear4.last()-(gear2.last()+2))/40 < ($("select#clearance4").val() == "Custom" ? 
                                $("input#clearance4custom").val()/$("select#clearance4custom-units").val() : $("select#type4").val())) return;
                            gearboxes.push([gear1[0], gear2[0], gear3[0], gear4[0], ratio]);
                        });
                    });
                } else {
                    ratio = gear4[0]/gear1[0];
                    if (ratio < min_ratio || ratio > max_ratio) return;
                    if ($("input#min14dist").val() && (gear1.last()+gear4.last())/40 < $("input#min14dist").val()/$("select#min14dist-units").val()) return;
                    if ($("input#max14dist").val() && (gear1.last()+gear4.last())/40 > $("input#max14dist").val()/$("select#min14dist-units").val()) return;
                    gearboxes.push([gear1[0], gear4[0], ratio]);
                } 
            });
        });
        gearboxes.sort(function(a,b){return Math.abs(a[4]/$("input#ratio").val()-1) - Math.abs(b[4]/$("input#ratio").val()-1);});
        console.log(gearboxes);
        
        $("table.gearbox-options tbody").empty();
        if (two_stage) {
            gearboxes.forEach(gearbox => {
                $("table.gearbox-options tbody").append(
                    `<tr>
                        <td>${gearbox[0]} : ${gearbox[1]}</td>
                        <td>${gearbox[2]} : ${gearbox[3]}</td>
                        <td>${+(gearbox[4].toFixed(2))} : 1</td>
                    </tr>`
                )
            });    
        } else {
            gearboxes.forEach(gearbox => {
                $("table.gearbox-options tbody").append(
                    `<tr>
                        <td>${gearbox[0]} : ${gearbox[1]}</td>
                        <td>${+(gearbox[2].toFixed(2))} : 1</td>
                    </tr>`
                )
            });
        }
    }
    $("input,select").change(calc_gearbox);

});

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};