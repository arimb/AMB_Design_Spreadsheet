$(document).ready(function(){

    $("select[id$=-u]").each((i, el) => $(el).data("unit-factor", $(el).val())).change(update_units);

    $("button.header-button.docs").click(function(){
        window.open("docs/" + $(this).attr("data-link") + ".pdf", "_blank");
    });

    $("button.header-button.imperial").click(() => $("option.imperial").each((i,el) => $(el).prop("selected", true).parent().change()));
    $("button.header-button.metric").click(() => $("option.metric").each((i,el) => $(el).prop("selected", true).parent().change()));

    $("button.copy-link").click(() => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    })

    $("button.reset").click(() => window.location.href = window.location.href.split("?")[0]);

    $("[data-tipso]").tipso({
        width: null,
        maxWidth: 300,
        background: "#405a3f",
        color: "#fff",
        speed: 200
    });

    $(".tipso-onload[data-tipso]").tipso("show").mouseover(function(){ $(this).tipso("hide").tipso("destroy"); });

    $("input.title").change(function(){
        if ($(this).val().match(/[^A-Za-zÀ-ȕ0-9 ]/)) {
            alert("The title cannot contain special characters.");
            $(this).val($(this).data("prev-val"));
        } else {
            let title = document.title.split(" - ").slice(-2).join(" - ");
            if ($(this).val() == "") {
                document.title = title;
            } else {
                document.title = $(this).val() + " - " + title;
            }
            $(this).data("prev-val", $(this).val());
        }
    });

    // window.onbeforeunload = function() {
    //     return "Refreshing or leaving this page will reset it. Are you sure you want to continue?";
    // }

    setTimeout(url_query);
    
});

function update_units(){
    let input = $(this).siblings("input#" + $(this).prop("id").split("-").slice(0, -1).join("-"));
    if (input.val() != "") {
        let old_val = input.val();
        if (input.data("full-val") && +(+(input.data("full-val") || 0).toFixed(3)) == old_val)
            old_val = input.data("full-val");
        let new_val = old_val * $(this).data("unit-factor") / $(this).val();
        input.val(+(new_val.toFixed(3))).change();
        input.data("full-val", new_val)
    }
    $(this).data("unit-factor", $(this).val());
}

function url_query(){
    var params = new URLSearchParams(window.location.search);
    $("input.title").val(params.get(""));
    for (key of params.keys()) {
        if (!key || !params.get(key)) continue;
        let input = $("#" + key);
        if (params.get(key) == "^")
            input.prop("checked", true);
        else if (params.get(key) == "$")
            input.prop("checked", false);
        else
            input.val(params.get(key));
        
        if (key.endsWith("-u"))
            input.data("unit-factor", params.get(key));
        input.change();
    }
    $("input, select").change(url_query_set);
    $("input.title").change();
}

function url_query_set(){
    var params = new URLSearchParams(window.location.search);
    let type = $(this).prop("type");
    params.delete(this.id);
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