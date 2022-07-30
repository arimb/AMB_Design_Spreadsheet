$(document).ready(function(){

    

    $("button.header-button.imperial").click(() => $("option.imperial").prop("selected", true).parent().change());
    $("button.header-button.metric").click(() => $("option.metric").prop("selected", true).parent().change());

    $("button.copy-link").click(() => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    })

    $("button.reset").click(() => window.location.href = window.location.href.split("?")[0]);

    $("button.undo").click(() => {
        let history = JSON.parse(window.sessionStorage.getItem("history"));
        if (history.length > 0) {
            let last = history.pop();
            let future = JSON.parse(window.sessionStorage.getItem("future"));
            future.push([last[0], $("#" + last[0]).val()]);

            eval_query(last[0], last[1]);
            window.sessionStorage.setItem("history", JSON.stringify(history));
            window.sessionStorage.setItem("future", JSON.stringify(future));
        }
        $("button.undo").prop("disabled", history.length == 0);
        $("button.redo").prop("disabled", false);
    });

    $("button.redo").click(() => {
        let future = JSON.parse(window.sessionStorage.getItem("future"));
        if (future.length > 0) {
            let last = future.pop();
            let history = JSON.parse(window.sessionStorage.getItem("history"));
            history.push([last[0], $("#" + last[0]).val()]);

            eval_query(last[0], last[1]);
            window.sessionStorage.setItem("history", JSON.stringify(history));
            window.sessionStorage.setItem("future", JSON.stringify(future));

            
        }
        $("button.redo").prop("disabled", future.length == 0);
        $("button.undo").prop("disabled", false);
    });

    // window.onbeforeunload = function() {
    //     return "Refreshing or leaving this page will reset it. Are you sure you want to continue?";
    // }

    setTimeout(query_setup);
    
});

function update_units(){
    let input = $(this).siblings("input#" + $(this).prop("id").split("-")[0]);
    if (input.val() != "")
        input.val(+((input.val() * $(this).data("prev-val") / $(this).val()).toFixed(3))).change();
}

// this runs once for each input
function query_setup(){
    var params = new URLSearchParams(window.location.search);
    for (key of params.keys()) {
        eval_query(key, params.get(key));
    }
    $("input, select").each((i, el) => $(el).data("prev-val", $(el).val()));
    $("select[id$=-units]").change(update_units);
    $("input, select").change(set_query);
    window.sessionStorage.setItem("history", "[]");
    window.sessionStorage.setItem("future", "[]");
}

// this runs whenever a value is changed
function set_query(){
    var params = new URLSearchParams(window.location.search);
    var val;

    let type = $(this).prop("type");
    console.log();
    if (type == "radio" || type == "checkbox") {
        if ($(this).prop("checked")) {
            val = "^";
            if (type == "radio")
                $("input[name=" + this.name + "]:not(:checked)").each(function(){params.delete(this.id)});
        } else if (type == "checkbox")
            val = "$";
    } else {
        val = this.value;
    }

    let history = JSON.parse(window.sessionStorage.getItem("history"));
    history.push([$(this).prop("id"), $(this).data("prev-val")]);
    window.sessionStorage.setItem("history", JSON.stringify(history));
    $("button.undo").prop("disabled", false);
    $(this).data("prev-val", $(this).val());

    params.set(this.id, val);
    window.history.replaceState({}, "", "?" + params.toString());
}

function eval_query(key, val){
    if (!val) return;
    let input = $("#" + key);
    if (val == "^")
        input.prop("checked", true);
    else if (val == "$")
        input.prop("checked", false);
    else
        input.val(val);
    
    if (key.endsWith("-units"))
        input.data("prev-val", val);
    input.change();
}