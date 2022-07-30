$(document).ready(function(){

    // Handle tabs
    $("div.tab").click(function(){
        $("div.tab").css("background-color", "var(--med-light)");
        $(this).css("background-color", "var(--selected)").children("input").prop("checked", true);
        $("div.tab-content").hide();
        $(`div#${this.id}-content`).show().find("select.cross_section").change();
    });
    $("div.tab#between").click();
    $("div.tab").hover(function(){
        if (!$(this).children("input").prop("checked"))
            $(this).css("background-color", "var(--dark)")
    }, function(){
        if (!$(this).children("input").prop("checked"))
            $(this).css("background-color", "var(--med-light)")
    });

    // Load material properties
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
    request.open("GET", "ref/materials.json", false);
    request.send();

    // Custom material properties
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

    // Geometry calculations
    $("div.hex").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Hex") {
            let hex_width = parent.find("input[id$=-hex_size]").val() * parent.find("select[id$=-hex_size-units]").val();
            parent.find("input[id$=-I]").val( +((0.0601*Math.pow(hex_width, 4)).toFixed(0)) );
            parent.find("input[id$=-J]").val( +((0.1154*Math.pow(hex_width, 4)).toFixed(0)) );
        }
    });
    $("div.round").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Round") {
            let od = parent.find("input[id$=-od]").val() * parent.find("select[id$=-od-units]").val();
            parent.find("input[id$=-I]").val( +((Math.PI/64*Math.pow(od, 4)).toFixed(0)) );
            parent.find("input[id$=-J]").val( +((Math.PI/32*Math.pow(od, 4)).toFixed(0)) );
        }
    });
    $("div.round-tube").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Round Tube") {
            let od = parent.find("input[id$=-od]").val() * parent.find("select[id$=-od-units]").val();
            let thick = parent.find("input[id$=-thick]").val() * parent.find("select[id$=-thick-units]").val();
            parent.find("input[id$=-I]").val( +((Math.PI/8*Math.pow(od, 3)*thick).toFixed(0)) );
            parent.find("input[id$=-J]").val( +((Math.PI/4*Math.pow(od, 3)*thick).toFixed(0)) );
        }
    });
    $("div.rect").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Rectangle") {
            let b = parent.find("input[id$=-width]").val() * parent.find("select[id$=-width-units]").val();
            let a = parent.find("input[id$=-height]").val() * parent.find("select[id$=-height-units]").val();
            parent.find("input[id$=-I]").val( +((b*Math.pow(a, 4)/12).toFixed(0)) );
            parent.find("input[id$=-J]").val( +((Math.pow(a,3)*b*(1/3-0.21*a/b*(1-Math.pow(a/b,4)/12))).toFixed(0)) );
        }
    });
    $("div.rect-tube").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Rectangular Tube") {
            let b = parent.find("input[id$=-width]").val() * parent.find("select[id$=-width-units]").val();
            let a = parent.find("input[id$=-height]").val() * parent.find("select[id$=-height-units]").val();
            let thick = parent.find("input[id$=-thick]").val() * parent.find("select[id$=-thick-units]").val();
            parent.find("input[id$=-I]").val( +((b*Math.pow(a,2)*thick/3).toFixed(0)) );
            parent.find("input[id$=-J]").val( +((2*thick*Math.pow(b-2,2)*Math.pow(a-thick,2)/(a+b-thick)).toFixed(0)) );
        }
    });

    // Select geometry type
    $("select.cross_section").change(function(){
        let parent = $(this).parents("div.cross_section");
        parent.find("div.field:not(:first-of-type)").hide();
        switch(this.value) {
            case "Hex":
                parent.children("div.hex").show().find("input:first-of-type").change();
                break;
            case "Round":
                parent.children("div.round").show().find("input:first-of-type").change();
                break;
            case "Round Tube":
                parent.children("div.round-tube").show().find("input:first-of-type").change();
                break;
            case "Rectangle":
                parent.children("div.rect").show().find("input:first-of-type").change();
                break;
            case "Rectangular Tube":
                parent.children("div.rect-tube").show().find("input:first-of-type").change();
                break;
            case "Custom":
                parent.children("div.custom").show().find("input:first-of-type").change();
                break;
        }

    });
    $("select.cross_section").change();

    // Between fixtures
    $("div#between-content").find("input, select").change(() => {
        let l = parseFloat($("input#between-l").val() * $("select#between-l-units").val());
        let a = parseFloat($("input#between-a").val() * $("select#between-a-units").val());
        let F = parseFloat($("input#between-F").val() * $("select#between-F-units").val());
        let E = parseFloat($("input#between-material-E").val() * 1e9);
        let I = parseFloat($("input#between-I").val() * 1e-12);
        if (2*a > l) a = l-a;
        $("input#between-del").val( +(((2*F*a**2*(l-a)**3) / (3*E*I*(2*a-3*l)**2) / $("select#between-del-units").val()).toFixed(2)) );
    });

    // Cantilevered load
    $("div#cantilever-content").find("input, select").change(() => {
        let l = parseFloat($("input#cantilever-l").val() * $("select#cantilever-l-units").val());
        let a = parseFloat($("input#cantilever-a").val() * $("select#cantilever-a-units").val());
        let F = parseFloat($("input#cantilever-F").val() * $("select#cantilever-F-units").val());
        let E = parseFloat($("input#cantilever-material-E").val() * 1e9);
        let I = parseFloat($("input#cantilever-I").val() * 1e-12);
        $("input#cantilever-del").val( +(((F*a**2*(3*l-a)) / (6*E*I) / $("select#cantilever-del-units").val()).toFixed(2)) );
    });

    // Twist load
    $("div#twist-content").find("input, select").change(() => {
        let l = parseFloat($("input#twist-l").val() * $("select#twist-l-units").val());
        let T = parseFloat($("input#twist-T").val() * $("select#twist-T-units").val());
        let G = parseFloat($("input#twist-material-G").val() * 1e9);
        let J = parseFloat($("input#twist-J").val() * 1e-12);
        $("input#twist-del").val( +((T*l/(G*J) * 180/Math.PI).toFixed(2)) );
    });

});