$(document).ready(function(){

    $("select[id$=-units]").each((i, el) => $(el).data("unit-factor", $(el).val())).change(update_units);

    $("button.header-button.docs").click(function(){
        window.open("docs/" + $(this).attr("data-link") + ".pdf", "_blank");
    });

    $("button.header-button.imperial").click(() => $("option.imperial").prop("selected", true).parent().change());
    $("button.header-button.metric").click(() => $("option.metric").prop("selected", true).parent().change());

    $("button.copy-link").click(() => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    })

    $("button.reset").click(() => window.location.href = window.location.href.split("?")[0]);

    // window.onbeforeunload = function() {
    //     return "Refreshing or leaving this page will reset it. Are you sure you want to continue?";
    // }

    setTimeout(url_query);
    
});

function update_units(){
    let input = $(this).siblings("input#" + $(this).prop("id").split("-")[0]);
    if (input.val() != "")
        input.val(+((input.val() * $(this).data("unit-factor") / $(this).val()).toFixed(3))).change();
    $(this).data("unit-factor", $(this).val());
}

function url_query(){
    var params = new URLSearchParams(window.location.search);
    for (key of params.keys()) {
        if (!params.get(key)) continue;
        let input = $("#" + key);
        if (params.get(key) == "^")
            input.prop("checked", true);
        else if (params.get(key) == "$")
            input.prop("checked", false);
        else
            input.val(params.get(key));
        
        if (key.endsWith("-units"))
            input.data("unit-factor", params.get(key));
        input.change();
    }
    $("input, select").change(url_query_set);
}

function url_query_set(){
    var params = new URLSearchParams(window.location.search);
    let type = $(this).prop("type");
    if (type == "radio" || type == "checkbox") {
        if ($(this).prop("checked")) {
            params.set(this.id, "^");
            if (type == "radio")
                $("input[name=" + this.name + "]:not(:checked)").each(function(){params.delete(this.id)});
        } else if (type == "checkbox")
            params.set(this.id, "$");
    } else {
        params.set(this.id, this.value);
    }
    window.history.replaceState({}, "", "?" + params.toString());
}