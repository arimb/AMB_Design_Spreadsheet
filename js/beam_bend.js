$(document).ready(function(){

    // Handle tabs
    $("div.tab").click(function(){
        $("div.tab").css("background-color", "var(--med-light)");
        $(this).css("background-color", "var(--selected)").children("input").prop("checked", true);
        $("div.tab-content").hide();
        $(`div#${this.id}-content`).show().find("select.cross_section").change();
    });
    $("div.tab#btwn").click();
    $("div.tab").hover(function(){
        if (!$(this).children("input").prop("checked"))
            $(this).css("background-color", "var(--dark)")
    }, function(){
        if (!$(this).children("input").prop("checked"))
            $(this).css("background-color", "var(--med-light)")
    });

    // Custom material properties
    $("select.material").change(function(){
        let type = this.id.split("-")[0];
        if ($(this).val() == "Custom") {
            $("input#" + type + "-E").prop("disabled", false);
            $("input#" + type + "-G").prop("disabled", false);
            $("input#" + type + "-dens").prop("disabled", false);
        } else {
            let mods = JSON.parse(this.value);
            $("input#" + type + "-E").prop("disabled", true).val(mods[0]);
            $("input#" + type + "-G").prop("disabled", true).val(mods[1]);
            $("input#" + type + "-dens").prop("disabled", true).val(+((mods[2] / $("select#" + type + "-dens-u").val()).toFixed(3)));
        }
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

    // Geometry calculations
    $("div.hex").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Hex") {
            let hex_width = parent.find("input[id$=-hex]").val() * parent.find("select[id$=-hex-u]").val();
            parent.find("input[id$=-I]").val( +((0.0601*Math.pow(hex_width, 4)).toFixed(0)) );
            parent.find("input[id$=-J]").val( +((0.1154*Math.pow(hex_width, 4)).toFixed(0)) );
            parent.find("input[id$=-A]").val( +((3*Math.sqrt(3)/8*Math.pow(hex_width, 2)).toFixed(0)) );
        }
    });
    $("div.round").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Round") {
            let od = parent.find("input[id$=-od]").val() * parent.find("select[id$=-od-u]").val();
            parent.find("input[id$=-I]").val( +((Math.PI/64*Math.pow(od, 4)).toFixed(0)) );
            parent.find("input[id$=-J]").val( +((Math.PI/32*Math.pow(od, 4)).toFixed(0)) );
            parent.find("input[id$=-A]").val( +((Math.PI/4*Math.pow(od, 2)).toFixed(0)) );
        }
    });
    $("div.round-tube").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Round Tube") {
            let od = parent.find("input[id$=-od]").val() * parent.find("select[id$=-od-u]").val();
            let thick = parent.find("input[id$=-thick]").val() * parent.find("select[id$=-thick-u]").val();
            parent.find("input[id$=-I]").val( +((Math.PI/8*Math.pow(od, 3)*thick).toFixed(0)) );
            parent.find("input[id$=-J]").val( +((Math.PI/4*Math.pow(od, 3)*thick).toFixed(0)) );
            parent.find("input[id$=-A]").val( +((Math.PI*od*thick).toFixed(0)) );
        }
    });
    $("div.rect").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Rectangle") {
            let b = parent.find("input[id$=-width]").val() * parent.find("select[id$=-width-u]").val();
            let a = parent.find("input[id$=-height]").val() * parent.find("select[id$=-height-u]").val();
            parent.find("input[id$=-I]").val( +((b*Math.pow(a, 3)/12).toFixed(0)) );
            // parent.find("input[id$=-J]").val( +((Math.pow(a,3)*b*(1/3-0.21*a/b*(1-Math.pow(a/b,4)/12))).toFixed(0)) );
            if (b > a) {
                let tmp = a;
                a = b;
                b = tmp;
            }
            parent.find("input[id$=-J]").val( +((a*Math.pow(b,3)/3 - 0.21*Math.pow(b,4) + 0.0175*Math.pow(b,8)/Math.pow(a,4)).toFixed(0)) );
            parent.find("input[id$=-A]").val( +((a*b).toFixed(0)) );
        }
    });
    $("div.rect-tube").find("input, select").change(function(){
        let parent = $(this).parents("div.cross_section");
        if(parent.find("select.cross_section").val() == "Rectangular Tube") {
            let b = parent.find("input[id$=-width]").val() * parent.find("select[id$=-width-u]").val();
            let a = parent.find("input[id$=-height]").val() * parent.find("select[id$=-height-u]").val();
            let thick = parent.find("input[id$=-thick]").val() * parent.find("select[id$=-thick-u]").val();
            parent.find("input[id$=-I]").val( +((b*Math.pow(a,2)*thick/3).toFixed(0)) );
            parent.find("input[id$=-J]").val( +((2*thick*Math.pow(b-2,2)*Math.pow(a-thick,2)/(a+b-thick)).toFixed(0)) );
            parent.find("input[id$=-A]").val( +((2*(a+b)*thick).toFixed(0)) );
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
    $("div#btwn-content").find("input, select").change(() => {
        let l = parseFloat($("input#btwn-l").val() * $("select#btwn-l-u").val());
        let a = parseFloat($("input#btwn-a").val() * $("select#btwn-a-u").val());
        let F = parseFloat($("input#btwn-F").val() * $("select#btwn-F-u").val());
        let E = parseFloat($("input#btwn-E").val() * 1e9);
        let I = parseFloat($("input#btwn-I").val() * 1e-12);
        let den = parseFloat($("input#btwn-dens").val() * $("select#btwn-dens-u").val() * 1000);
        let A = parseFloat($("input#btwn-A").val() * 1e-6);
        if (2*a > l) a = l-a;
        $("input#btwn-del").val( +(((2*F*a**2*(l-a)**3) / (3*E*I*(2*a-3*l)**2) / $("select#btwn-del-u").val()).toFixed(2)) );
        $("input#btwn-weight").val( +((l*A*den / $("select#btwn-weight-u").val()).toFixed(2)) );
    });

    // Cantilevered load
    $("div#cant-content").find("input, select").change(() => {
        let l = parseFloat($("input#cant-l").val() * $("select#cant-l-u").val());
        let a = parseFloat($("input#cant-a").val() * $("select#cant-a-u").val());
        let F = parseFloat($("input#cant-F").val() * $("select#cant-F-u").val());
        let E = parseFloat($("input#cant-E").val() * 1e9);
        let I = parseFloat($("input#cant-I").val() * 1e-12);
        let den = parseFloat($("input#cant-dens").val() * $("select#cant-dens-u").val() * 1000);
        let A = parseFloat($("input#cant-A").val() * 1e-6);
        $("input#cant-del").val( +(((F*a**2*(3*l-a)) / (6*E*I) / $("select#cant-del-u").val()).toFixed(2)) );
        $("input#cant-weight").val( +((l*A*den / $("select#cant-weight-u").val()).toFixed(2)) );
    });

    // Twist load
    $("div#twist-content").find("input, select").change(() => {
        let l = parseFloat($("input#twist-l").val() * $("select#twist-l-u").val());
        let T = parseFloat($("input#twist-T").val() * $("select#twist-T-u").val());
        let G = parseFloat($("input#twist-G").val() * 1e9);
        let J = parseFloat($("input#twist-J").val() * 1e-12);
        let den = parseFloat($("input#twist-dens").val() * $("select#twist-dens-u").val() * 1000);
        let A = parseFloat($("input#twist-A").val() * 1e-6);
        $("input#twist-del").val( +((T*l/(G*J) * 180/Math.PI).toFixed(2)) );
        $("input#twist-weight").val( +((l*A*den / $("select#twist-weight-u").val()).toFixed(2)) );
    });

});