$(document).ready(function(){

    $("div.tab").click(el => {
        $("div.tab").css("background-color", "var(--med-light)");
        $(el.currentTarget).css("background-color", "var(--selected)").children("input").prop("checked", true);
        $("div.tab-content").hide();
        $(`div#${el.currentTarget.id}-content`).show();
    });
    $("div.tab#between").click();
    $("div.tab").hover(
        el => {
            if (!$(el.currentTarget).children("input").prop("checked"))
                $(el.currentTarget).css("background-color", "var(--dark)")
        },
        el => {
            if (!$(el.currentTarget).children("input").prop("checked"))
                $(el.currentTarget).css("background-color", "var(--med-light)")
        }
    );

    const request = new XMLHttpRequest();
    request.onload = function() {
        let materials = JSON.parse(this.responseText);
        const material_names = Object.keys(materials);
        for (let i = material_names.length-1; i >= 0; i--) {
            let x = material_names[i];
            $("select.material").prepend(`<option value="[${materials[x]}]">${x}</option>`);
        }
        $("select.material option:first-child").prop("selected", true);
    };
    request.open("GET", "ref/materials.json");
    request.send();

    $("select.material").change(el => {
        if ($(el.currentTarget).val() == "Custom") {
            $("input#" + el.currentTarget.id + "-E").prop("disabled", false);
            $("input#" + el.currentTarget.id + "-G").prop("disabled", false);
        } else {
            let mods = JSON.parse(el.currentTarget.value);
            $("input#" + el.currentTarget.id + "-E").prop("disabled", true).val(mods[0]);
            $("input#" + el.currentTarget.id + "-G").prop("disabled", true).val(mods[1]);
        }
    });

    $("select.cross_section").change(el => {
        let parent = $(el.currentTarget).parents("div.cross_section");
        $("div.cross_section div.field:not(:first-of-type)").hide();
        switch(el.currentTarget.value) {
            case "Hex":
                parent.children("div.hex").show();
                break;
                // ADD STUFF HERE
        }
    });

});