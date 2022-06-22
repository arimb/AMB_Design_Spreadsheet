$(document).ready(function(){

    $("input#drag-enable").change(() => { $("input#drag-enable").parent().nextAll().children("input,select").attr("disabled", !$("input#drag-enable").prop("checked")); })
    

});