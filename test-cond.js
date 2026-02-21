function interpolate(template, attributes) {
    if (!template) return "";
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
        return path.split('.').reduce((obj, key) => obj?.[key], attributes) ?? '';
    });
}

function evaluateCondition(expression, attributes) {
    if (!expression) return false;
    try {
        const hydrated = interpolate(expression, attributes).trim();

        // Logical Operators
        const ops = [
            { op: '==', fn: (l, r) => l === r },
            { op: '!=', fn: (l, r) => l !== r },
            { op: '>=', fn: (l, r) => l >= r },
            { op: '<=', fn: (l, r) => l <= r },
            { op: '>', fn: (l, r) => l > r },
            { op: '<', fn: (l, r) => l < r },
            { op: 'contains', fn: (l, r) => l.includes(r) },
        ];

        for (const { op, fn } of ops) {
            // Match "left [op] right" format
            const regex = new RegExp(`^(.*?)\\s*${op === 'contains' ? 'contains' : '\\' + op.split('').join('\\')}\\s*(.*)$`, 'i');
            const match = hydrated.match(regex);

            if (match) {
                let left = match[1].trim();
                let right = match[2].trim();

                // Strip surrounding quotes if present
                if ((left.startsWith("'") && left.endsWith("'")) || (left.startsWith('"') && left.endsWith('"'))) left = left.slice(1, -1);
                if ((right.startsWith("'") && right.endsWith("'")) || (right.startsWith('"') && right.endsWith('"'))) right = right.slice(1, -1);

                // For math ops, convert to number
                if (['>', '<', '>=', '<='].includes(op)) {
                    return fn(Number(left), Number(right));
                }

                return fn(left, right);
            }
        }

        // If it's just a single boolean output
        return hydrated.toLowerCase() === 'true';
    } catch {
        return false;
    }
}
console.log(evaluateCondition("{{needs_support}} == '1'", { needs_support: 1 }));
