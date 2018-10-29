const traverse = require('traverse');
function findParentTypesContainer(node) {
    while (true) {
        if (node.key === 'types') return node;
        node = node.parent;
    }
}
function getPathToThisFromParentTypesContainer(node) {
    let typesContainer = findParentTypesContainer(node);
    let res = [];
    while (node !== typesContainer) {
        res.push(node.key);
        node = node.parent;
    }
    return res.reverse().join('_');
}
module.exports = (proto) => {
    let anonIdx = 0;
    // TODO: Very dirty check, detect when object is no longer changes
    for (let i = 0; i < 10; i++) {
        proto = traverse(proto).forEach(function (f) {
            if (f instanceof Array) {
                if (f[0] === 'switch') {
                    for (let fieldName in f[1].fields) {
                        if (f[1].fields[fieldName] instanceof Array) {
                            let typeName = `extracted_${fieldName}_from_` + getPathToThisFromParentTypesContainer(this);
                            const parent = findParentTypesContainer(this).node;
                            parent[typeName] = f[1].fields[fieldName];
                            f[1].fields[fieldName] = typeName;
                        }
                    }
                } else if (f[0] === 'option') {
                    if (f[1] instanceof Array) {
                        let typeName = 'extracted_from_' + getPathToThisFromParentTypesContainer(this);
                        const parent = findParentTypesContainer(this).node;
                        parent[typeName] = f[1];
                        f[1] = typeName;
                    }
                } else if (f[0] === 'container') {
                    const parent = findParentTypesContainer(this).node;
                    for (let field of f[1]) {
                        if (field.type instanceof Array) {
                            // Mapper and switch can't be extracted from container, because they refer to field in container
                            if (field.type[0] === 'mapper' || field.type[0] === 'switch') return;
                            if (field.type[0] === 'array' && field.type[1].count) return;
                            let typeName = `extracted_${field.name || ('anon_' + (anonIdx++).toString(36))}_from_` + getPathToThisFromParentTypesContainer(this);
                            parent[typeName] = field.type;
                            field.type = typeName;
                        }
                    }
                } else if (f[0] === 'array') {
                    if (f[1].type instanceof Array) {
                        let typeName = 'extracted_from_' + getPathToThisFromParentTypesContainer(this);
                        const parent = findParentTypesContainer(this).node;
                        parent[typeName] = f[1].type;
                        f[1].type = typeName;
                    }
                }
            }
        })
    }
    return proto;
}