$(document).ready(function(){

$("select#diameter-units").change(() => $("span.pitch").text($("select#diameter-units option:selected").text()));

});