var planetaries;
var stages;

$(document).ready(function(){

    // Update planetary type
    $("select#type").change(() => {
        const type = $("select#type").val();
        stages = planetaries[type];
        $("textarea.ratio-options").val(stages.join(" : 1\n") + " : 1");
    });

    // Load planetary types
    const request = new XMLHttpRequest();
    request.onload = function() {
        planetaries = JSON.parse(this.responseText);
        const types = Object.keys(planetaries);
        for (let i = types.length-1; i >= 0; i--) {
            $("select#type").prepend("<option value='" + types[i] + "'>" + types[i] + "</option>");
        }
        $("select#type").val(types[0]).change();
    };
    request.open("GET", "ref/planetaries.json", false);
    request.send();

    $("select, input#desired").change(() => {
        $("tbody").html("");
        
        const desired = parseFloat($("input#desired").val());
        if (isNaN(desired))
            return;

        const combinations = recalculate(desired);
        
        combinations.forEach(comb => {
            let row = `<tr>
            <td>${comb[0]} : 1</td>
            <td>${comb[1].reduce((x,a) => x+a, 0)}</td>
            <td>`;
            for (let j = 0; j < comb[1].length; j++)
                if (comb[1][j] > 0)
                    row += `${comb[1][j]}x ${stages[j]}:1,  `;
            row = row.substring(0, row.length-3) + "</td><td>";
            if (comb[0] < desired)
                row += (desired/comb[0]).toFixed(2) + ":1"
            else if (comb[0] > desired)
                row += "1:" + (comb[0]/desired).toFixed(2) + " (OD)";
            else
                row += "none";
            row += "</td></tr>";
            $("tbody").append(row);
        });
    });

});

function recalculate(desired) {
    var tree = {"node": Array(stages.length).fill(0), "start": 0, "ratio": 1, "children": []};
    addLevels(tree, desired);

    var list = [];
    flatten(tree, list);
    list = list.filter(el => 0.66 < el[0]/desired && el[0]/desired < 1.5);
    list.sort( (a,b) =>
        (a[0]/desired > 1 ? a[0]/desired : desired/a[0]) - 
        (b[0]/desired > 1 ? b[0]/desired : desired/b[0]) );
    return list;
}

function addLevels(tree, desired) {
    if (tree.children.length == 0) {
        for (let i = tree.start; i < tree.node.length; i++) {
            let tmp = structuredClone(tree.node);
            tmp[i] += 1;
            tree.children.push({
                node: tmp,
                start: i,
                children: []
            });
        }
    }
    
    for (let i = 0; i < tree.children.length; i++) {
        let ratio = 1;
        for (let j = 0; j < stages.length; j++) {
            ratio *= Math.pow(stages[j], tree.children[i].node[j]);
        }
        tree.children[i].ratio = ratio;
        if (ratio < desired)
            addLevels(tree.children[i], desired);
    }
}

function flatten(tree, list) {
    list.push([tree.ratio, tree.node]);
    for (let i = 0; i < tree.children.length; i++) {
        flatten(tree.children[i], list);
    }
}