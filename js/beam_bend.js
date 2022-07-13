$(document).ready(function(){

    $("div.tab").click(function(){
        $("div.tab").css("background-color", "var(--med-light)");
        $(this).css("background-color", "var(--selected)").children("input").prop("checked", true);
        $("div.tab-content").hide();
        $(`div#${this.id}-content`).show();
    });
    $("div.tab#between").click();
    $("div.tab").hover(function(){
        if (!$(this).children("input").prop("checked"))
            $(this).css("background-color", "var(--dark)")
    }, function(){
        if (!$(this).children("input").prop("checked"))
            $(this).css("background-color", "var(--med-light)")
    });

    const request = new XMLHttpRequest();
    request.onload = function() {
        let materials = JSON.parse(this.responseText);
        const material_names = Object.keys(materials);
        for (let i = material_names.length-1; i >= 0; i--) {
            let x = material_names[i];
            $("select.material").prepend(`<option value="[${materials[x]}]">${x}</option>`);
        }
        $("select.material option:first-child").prop("selected", true);
        $("select.material").change();
    };
    request.open("GET", "ref/materials.json");
    request.send();

    $("select.material").change(function(){
        if ($(this).val() == "Custom") {
            $("input#" + this.id + "-E").prop("disabled", false);
            $("input#" + this.id + "-G").prop("disabled", false);
        } else {
            let mods = JSON.parse(this.value);
            $("input#" + this.id + "-E").prop("disabled", true).val(mods[0]);
            $("input#" + this.id + "-G").prop("disabled", true).val(mods[1]);
        }
    });

    $("select.cross_section").change(function(){
        let parent = $(this).parents("div.cross_section");
        $("div.cross_section div.field:not(:first-of-type)").hide();
        switch(this.value) {
            case "Hex":
                parent.children("div.hex").show();
                
                break;
            case "Round":
                parent.children("div.round").show();
                break;
            case "Round Tube":
                parent.children("div.round-tube").show();
                break;
            case "Rectangle":
                parent.children("div.rect").show();
                break;
            case "Rectangular Tube":
                parent.children("div.rect-tube").show();
                break;
            case "Custom":
                parent.children("div.custom").show();
                break;
        }
    });
    $("select.cross_section").change();

    $("div.hex input, div.hex select").change(function(){
        let parent = $(this).parents("div.cross_section");
        console.log(parent);
        let hex_width = parent.find("input[id$=-hex_size]").val() * parent.find("select[id$=-hex_size-units]").val();
        console.log(hex_width);
        parent.find("input[id$=-I]").val( +((0.0601*Math.pow(hex_width, 4)).toFixed(3)) );
        parent.find("input[id$=-J]").val( +((0.1154*Math.pow(hex_width, 4)).toFixed(3)) );
    });

});