$(document).ready(function(){

    $("select[id$=-units]").each((i, el) => $(el).data("unit-factor", $(el).val())).change(update_units);

});

function update_units(){
    let input = $(this).siblings("input#" + $(this).prop("id").split("-")[0]);
    if (input.val() != "")
        input.val(+((input.val() * $(this).data("unit-factor") / $(this).val()).toFixed(3)));
    $(this).data("unit-factor", $(this).val());
}