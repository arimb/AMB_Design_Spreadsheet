// window.onbeforeunload = function() {
//     return "Refreshing or leaving this page will reset it. Are you sure you want to continue?";
// }

$(document).ready(function(){

    $("input[name=driven]").change(function(){
        $("div#piston, div#linkage").find("input[type=number]").prop("disabled", false);
        $(this).siblings().find("input[type=number]").prop("disabled", true);
    });

    $("input").change(function(){
        var L = $("input#retracted").val();
        var dL = $("input#stroke").val();
        var A = $("input#mount_x").val();
        var B = $("input#mount_y").val();
        var h1 = $("input#retracted_angle").val() * Math.PI / 180;
        var h2 = $("input#extended_angle").val() * Math.PI / 180;
        const c1 = Math.cos(h1);
        const s1 = Math.sin(h1);
        const c2 = Math.cos(h2);
        const s2 = Math.sin(h2);
        var X = $("input#parallel_dist").val();
        var Y = $("input#cross_dist").val();

        switch ($("input[name=driven]:checked").prop("id")) {
            case "LdL":
                L = Math.sqrt(A**2 + B**2 + X**2 + Y**2 + 2*(A*X - B*Y)*c1 - 2*(B*X + A*Y)*s1);
                dL = Math.sqrt(A**2 + B**2 + X**2 + Y**2 + 2*(A*X - B*Y)*c2 - 2*(B*X + A*Y)*s2) - Math.sqrt(A**2 + B**2 + X**2 + Y**2 + 2*(A*X - B*Y)*c1 - 2*(B*X + A*Y)*s1);
                $("input#retracted").val(L.toFixed(2));
                $("input#extended").val(dL.toFixed(2));
                break;
            case "AB":
                A = (-(X*(dL**2 + 2*dL*L + X**2 + Y**2)*Math.cos(h1)) + X**3*Math.cos(h1 - 2*h2) + X*Y**2*Math.cos(h1 - 2*h2) + X**3*Math.cos(2*h1 - h2) + X*Y**2*Math.cos(2*h1 - h2) + dL**2*X*c2 + 2*dL*L*X*c2 - X**3*c2 - X*Y**2*c2 + dL**2*Y*s1 + 2*dL*L*Y*s1 + X**2*Y*s1 + Y**3*s1 + X**2*Y*Math.sin(h1 - 2*h2) + Y**3*Math.sin(h1 - 2*h2) - X**2*Y*Math.sin(2*h1 - h2) - Y**3*Math.sin(2*h1 - h2) - dL**2*Y*s2 - 2*dL*L*Y*s2 + X**2*Y*s2 + Y**3*s2 + 2*Math.sqrt(-((dL**2 + 4*dL*L + 4*L**2 - 2*X**2 - 2*Y**2 + 2*(X**2 + Y**2)*Math.cos(h1 - h2))*(dL**2 - 2*(X**2 + Y**2) + 2*(X**2 + Y**2)*Math.cos(h1 - h2))*Math.sin((h1 - h2)/2)**2*(X*Math.cos((h1 + h2)/2) - Y*Math.sin((h1 + h2)/2))**2)))/(8*(X**2 + Y**2)*Math.sin((h1 - h2)/2)**2);

                B = (-2*X*Y*(X**2 + Y**2)*Math.cos((h1 - 5*h2)/2) - 2*X**3*Y*Math.cos((5*h1)/2 - h2/2) - 2*X*Y**3*Math.cos((5*h1)/2 - h2/2) + 2*dL**2*X*Y*Math.cos((3*h1 + h2)/2) + 4*dL*L*X*Y*Math.cos((3*h1 + h2)/2) + 2*X**3*Y*Math.cos((3*h1 + h2)/2) + 2*X*Y**3*Math.cos((3*h1 + h2)/2) - 2*dL**2*X*Y*Math.cos((h1 + 3*h2)/2) - 4*dL*L*X*Y*Math.cos((h1 + 3*h2)/2) + 2*X**3*Y*Math.cos((h1 + 3*h2)/2) + 2*X*Y**3*Math.cos((h1 + 3*h2)/2) + X**4*Math.sin((h1 - 5*h2)/2) - Y**4*Math.sin((h1 - 5*h2)/2) + 2*dL**2*X**2*Math.sin((h1 - h2)/2) + 4*dL*L*X**2*Math.sin((h1 - h2)/2) + 2*dL**2*Y**2*Math.sin((h1 - h2)/2) + 4*dL*L*Y**2*Math.sin((h1 - h2)/2) - X**4*Math.sin((5*h1)/2 - h2/2) + Y**4*Math.sin((5*h1)/2 - h2/2) - 4*Y*Math.cos((h1 + h2)/2)*Math.sqrt(-((dL**2 + 4*dL*L + 4*L**2 - 2*X**2 - 2*Y**2 + 2*(X**2 + Y**2)*Math.cos(h1 - h2))*(dL**2 - 2*(X**2 + Y**2) + 2*(X**2 + Y**2)*Math.cos(h1 - h2))*Math.sin((h1 - h2)/2)**2*(X*Math.cos((h1 + h2)/2) - Y*Math.sin((h1 + h2)/2))**2)) - 4*X*Math.sin((h1 + h2)/2)*Math.sqrt(-((dL**2 + 4*dL*L + 4*L**2 - 2*X**2 - 2*Y**2 + 2*(X**2 + Y**2)*Math.cos(h1 - h2))*(dL**2 - 2*(X**2 + Y**2) + 2*(X**2 + Y**2)*Math.cos(h1 - h2))*Math.sin((h1 - h2)/2)**2*(X*Math.cos((h1 + h2)/2) - Y*Math.sin((h1 + h2)/2))**2)) + dL**2*X**2*Math.sin((3*h1 + h2)/2) + 2*dL*L*X**2*Math.sin((3*h1 + h2)/2) + X**4*Math.sin((3*h1 + h2)/2) - dL**2*Y**2*Math.sin((3*h1 + h2)/2) - 2*dL*L*Y**2*Math.sin((3*h1 + h2)/2) - Y**4*Math.sin((3*h1 + h2)/2) - dL**2*X**2*Math.sin((h1 + 3*h2)/2) - 2*dL*L*X**2*Math.sin((h1 + 3*h2)/2) + X**4*Math.sin((h1 + 3*h2)/2) + dL**2*Y**2*Math.sin((h1 + 3*h2)/2) + 2*dL*L*Y**2*Math.sin((h1 + 3*h2)/2) - Y**4*Math.sin((h1 + 3*h2)/2))/(16*(X**2 + Y**2)*Math.sin((h1 - h2)/2)**2*(X*Math.cos((h1 + h2)/2) - Y*Math.sin((h1 + h2)/2)));

                $("input#mount_x").val(A.toFixed(2));
                $("input#mount_y").val(B.toFixed(2));
                break;
            case "h1h2":
                h1 = link_angle(A, B, L, 0, X, Y);
                h2 = link_angle(A, B, L, dL, X, Y);

                $("input#extended_angle").val((h2 * 180 / Math.PI).toFixed(1));
                $("input#retracted_angle").val((h1 * 180 / Math.PI).toFixed(1));
                $("input#extended_angle").val((h2 * 180 / Math.PI).toFixed(1));
                break;
            case "XY":
                X = (-(A*(A**2 + B**2 + dL**2 + 2*dL*L)*Math.cos(h1)) + A**3*Math.cos(h1 - 2*h2) + A*B**2*Math.cos(h1 - 2*h2) + A**3*Math.cos(2*h1 - h2) + A*B**2*Math.cos(2*h1 - h2) - A**3*Math.cos(h2) - A*B**2*Math.cos(h2) + A*dL**2*Math.cos(h2) + 2*A*dL*L*Math.cos(h2) + A**2*B*Math.sin(h1) + B**3*Math.sin(h1) + B*dL**2*Math.sin(h1) + 2*B*dL*L*Math.sin(h1) + A**2*B*Math.sin(h1 - 2*h2) + B**3*Math.sin(h1 - 2*h2) - A**2*B*Math.sin(2*h1 - h2) - B**3*Math.sin(2*h1 - h2) + A**2*B*Math.sin(h2) + B**3*Math.sin(h2) - B*dL**2*Math.sin(h2) - 2*B*dL*L*Math.sin(h2) + 2*Math.sqrt(-((-2*A**2 - 2*B**2 + dL**2 + 2*(A**2 + B**2)*Math.cos(h1 - h2))*(-2*A**2 - 2*B**2 + dL**2 + 4*dL*L + 4*L**2 + 2*(A**2 + B**2)*Math.cos(h1 - h2))*Math.sin((h1 - h2)/2)**2*(A*Math.cos((h1 + h2)/2) - B*Math.sin((h1 + h2)/2))**2)))/(8*(A**2 + B**2)*Math.sin((h1 - h2)/2)**2);

                Y = (-2*A*B*(A**2 + B**2)*Math.cos((h1 - 5*h2)/2) - 2*A**3*B*Math.cos((5*h1)/2 - h2/2) - 2*A*B**3*Math.cos((5*h1)/2 - h2/2) + 2*A**3*B*Math.cos((3*h1 + h2)/2) + 2*A*B**3*Math.cos((3*h1 + h2)/2) + 2*A*B*dL**2*Math.cos((3*h1 + h2)/2) + 4*A*B*dL*L*Math.cos((3*h1 + h2)/2) + 2*A**3*B*Math.cos((h1 + 3*h2)/2) + 2*A*B**3*Math.cos((h1 + 3*h2)/2) - 2*A*B*dL**2*Math.cos((h1 + 3*h2)/2) - 4*A*B*dL*L*Math.cos((h1 + 3*h2)/2) + A**4*Math.sin((h1 - 5*h2)/2) - B**4*Math.sin((h1 - 5*h2)/2) + 2*A**2*dL**2*Math.sin((h1 - h2)/2) + 2*B**2*dL**2*Math.sin((h1 - h2)/2) + 4*A**2*dL*L*Math.sin((h1 - h2)/2) + 4*B**2*dL*L*Math.sin((h1 - h2)/2) - A**4*Math.sin((5*h1)/2 - h2/2) + B**4*Math.sin((5*h1)/2 - h2/2) + 4*B*Math.cos((h1 + h2)/2)*Math.sqrt(-((-2*A**2 - 2*B**2 + dL**2 + 2*(A**2 + B**2)*Math.cos(h1 - h2))*(-2*A**2 - 2*B**2 + dL**2 + 4*dL*L + 4*L**2 + 2*(A**2 + B**2)*Math.cos(h1 - h2))*Math.sin((h1 - h2)/2)**2*(A*Math.cos((h1 + h2)/2) - B*Math.sin((h1 + h2)/2))**2)) + 4*A*Math.sin((h1 + h2)/2)*Math.sqrt(-((-2*A**2 - 2*B**2 + dL**2 + 2*(A**2 + B**2)*Math.cos(h1 - h2))*(-2*A**2 - 2*B**2 + dL**2 + 4*dL*L + 4*L**2 + 2*(A**2 + B**2)*Math.cos(h1 - h2))*Math.sin((h1 - h2)/2)**2*(A*Math.cos((h1 + h2)/2) - B*Math.sin((h1 + h2)/2))**2)) + A**4*Math.sin((3*h1 + h2)/2) - B**4*Math.sin((3*h1 + h2)/2) + A**2*dL**2*Math.sin((3*h1 + h2)/2) - B**2*dL**2*Math.sin((3*h1 + h2)/2) + 2*A**2*dL*L*Math.sin((3*h1 + h2)/2) - 2*B**2*dL*L*Math.sin((3*h1 + h2)/2) + A**4*Math.sin((h1 + 3*h2)/2) - B**4*Math.sin((h1 + 3*h2)/2) - A**2*dL**2*Math.sin((h1 + 3*h2)/2) + B**2*dL**2*Math.sin((h1 + 3*h2)/2) - 2*A**2*dL*L*Math.sin((h1 + 3*h2)/2) + 2*B**2*dL*L*Math.sin((h1 + 3*h2)/2))/(16*(A**2 + B**2)*Math.sin((h1 - h2)/2)**2*(A*Math.cos((h1 + h2)/2) - B*Math.sin((h1 + h2)/2)));

                $("input#parallel_dist").val(X.toFixed(2));
                $("input#cross_dist").val(Y.toFixed(2));
                break;
        }

        // plot graph
        $("canvas#sketch").remove();
        $("div.sketch").append('<canvas id="sketch"></canvas>');
        const dLtmp = $("input#piston-pos").val() * dL;
        const h = link_angle(A, B, L, dLtmp, X, Y);
        console.log(1.5*X*Math.cos(h));
        var data = [
            {
                data: [{x: 0, y: 0}, {x: 1.5*X*Math.cos(h), y: 1.5*X*Math.sin(h)}],
                borderColor: "black",
                fill: false,
                pointRadius: 0
            }
        ];
        if ($("input#retract").prop("checked")) {
            data.push({
                data: [{x: 0, y: 0}, {x: 1.5*X*Math.cos(h1), y: 1.5*X*Math.sin(h1)}],
                borderColor: "black",
                fill: false,
                pointRadius: 0
            });
        }
        if ($("input#extend").prop("checked")) {
            data.push({
                data: [{x: 0, y: 0}, {x: 1.5*X*Math.cos(h2), y: 1.5*X*Math.sin(h2)}],
                borderColor: "black",
                fill: false,
                pointRadius: 0
            });
        }
        
        console.log(data);
        var graph = new Chart("sketch", {
            type: "line",
            data: {
                datasets: [{
                    data: [{x: 0, y: 0}, {x: 1.5*X*Math.cos(h), y: 1.5*X*Math.sin(h)}],
                    borderColor: "black"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: {
                    duration: 0
                },
                datasets: {
                    line: {
                        fill: false,
                        pointRadius: 0
                    }
                }
            }
        });
    });
    $("input#retracted").change();

});

function link_angle(A, B, L, dL, X, Y){
    return Math.atan2(A**2*B**2*X**2 + B**4*X**2 - B**2*dL**2*X**2 - 2*B**2*dL*L*X**2 - B**2*L**2*X**2 + B**2*X**4 + 2*A**3*B*X*Y + 2*A*B**3*X*Y - 2*A*B*dL**2*X*Y - 4*A*B*dL*L*X*Y - 2*A*B*L**2*X*Y + 2*A*B*X**3*Y + A**4*Y**2 + A**2*B**2*Y**2 - A**2*dL**2*Y**2 - 2*A**2*dL*L*Y**2 - A**2*L**2*Y**2 + A**2*X**2*Y**2 + B**2*X**2*Y**2 + 2*A*B*X*Y**3 + A**2*Y**4 + A*X*Math.sqrt(-((B*X + A*Y)**2*(A**4 + B**4 + 2*A**2*(B**2 - dL**2 - 2*dL*L - L**2 - X**2 - Y**2) + (dL**2 + 2*dL*L + L**2 - X**2 - Y**2)**2 - 2*B**2*(dL**2 + 2*dL*L + L**2 + X**2 + Y**2)))) - B*Y*Math.sqrt(-((B*X + A*Y)**2*(A**4 + B**4 + 2*A**2*(B**2 - dL**2 - 2*dL*L - L**2 - X**2 - Y**2) + (dL**2 + 2*dL*L + L**2 - X**2 - Y**2)**2 - 2*B**2*(dL**2 + 2*dL*L + L**2 + X**2 + Y**2)))), (B*X + A*Y)*(-(A**3*X) - A*B**2*X + A*dL**2*X + 2*A*dL*L*X + A*L**2*X - A*X**3 + A**2*B*Y + B**3*Y - B*dL**2*Y - 2*B*dL*L*Y - B*L**2*Y + B*X**2*Y - A*X*Y**2 + B*Y**3 + Math.sqrt(-((B*X + A*Y)**2*(A**4 + B**4 + 2*A**2*(B**2 - dL**2 - 2*dL*L - L**2 - X**2 - Y**2) + (dL**2 + 2*dL*L + L**2 - X**2 - Y**2)**2 - 2*B**2*(dL**2 + 2*dL*L + L**2 + X**2 + Y**2))))));
}