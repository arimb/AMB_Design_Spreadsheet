$(document).ready(function(){

var friction = {
    "Steel": {
        "Steel": [0.2, 0.14],
        "Bronze": [0.1, 0.1]
    },
    "Bronze": {
        "Steel": [0.19, 0.13],
        "Bronze": [0.05, 0.05]
    },
    "Brass": {
        "Steel": [0.17, 0.12],
        "Bronze": [NaN, NaN]
    },
    "Cast Iron": {
        "Steel": [0.2, 0.14],
        "Bronze": [0.07, 0.07]
    }
}

$("select#diameter-units").change(() => $("span.pitch").text($("select#diameter-units option:selected").text()));

$("input, select").change(function(){
    let d = $("input#diameter").val() * $("select#diameter-units").val();
    let p = $("input#pitch").val() * $("select#diameter-units").val();
    let dp = d - p/2;
    let n = $("input#starts").val();
    let a = $("input#angle").val() / 2 * Math.PI / 180;
    let mu = friction[$("select#nut-material").val()][$("select#screw-material").val()][$("input#lube").prop("checked") ? 1 : 0];
    $("input#eff").val(+(( n*p/(Math.PI*dp) * (Math.PI*dp*Math.cos(a)-mu*n*p)/(Math.PI*mu*dp+n*p*Math.cos(a)) * 100 ).toFixed(1)));
    $("input#equiv_radius").val(+(( n*p/(2*Math.PI) / $("select#diameter-units").val() ).toFixed(3)));
});

});