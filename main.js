const fs = require('fs');

function evaluateCondition(condition, variables) {
    // yes i know most of these are redundant lmfao
    condition = condition.replace(/is/g, '==='); // Replace "is" with "==="
    condition = condition.replace(/>=/g, '>='); // Replace ">=" with ">="
    condition = condition.replace(/<=/g, '<='); // Replace "<=" with "<="
    condition = condition.replace(/>/g, '>');   // Replace ">" with ">"
    condition = condition.replace(/</g, '<');   // Replace "<" with "<"

    for (const [key, value] of Object.entries(variables)) {
        condition = condition.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
    }

    return eval(condition);
}

function executeScript(script) {
    const variables = {};
    const lines = script.split('\n').map(line => line.trim()).filter(line => line);

    let i = 0;
    let executedBlock = false;

    while (i < lines.length) {
        let line = lines[i];

        if (line.includes('is') && !line.startsWith('if') && !line.startsWith('else if') && !line.startsWith('otherwise')) {
            const [varName, value] = line.split('is').map(part => part.trim());
            variables[varName] = parseInt(value, 10) || value;
        }

        else if (line.startsWith('if')) {
            const condition = line.slice(3, line.indexOf('{')).trim();
            if (evaluateCondition(condition, variables)) {
                executedBlock = true;
                i++;
                while (i < lines.length && !lines[i].includes('}')) {
                    if (lines[i].startsWith('say')) {
                        const message = lines[i].slice(4).trim().replace(/"/g, '');
                        console.log(message);
                    }
                    i++;
                }
            } else {
                while (i < lines.length && !lines[i].includes('}')) {
                    i++;
                }
            }
        }

        else if (line.startsWith('else if')) {
            const condition = line.slice(8, line.indexOf('{')).trim();
            if (!executedBlock && evaluateCondition(condition, variables)) {
                executedBlock = true;
                i++;
                while (i < lines.length && !lines[i].includes('}')) {
                    if (lines[i].startsWith('say')) {
                        const message = lines[i].slice(4).trim().replace(/"/g, '');
                        console.log(message);
                    }
                    i++;
                }
            } else {
                while (i < lines.length && !lines[i].includes('}')) {
                    i++;
                }
            }
        }

        else if (line.startsWith('otherwise')) {
            if (!executedBlock) {
                i++;
                while (i < lines.length && !lines[i].includes('}')) {
                    if (lines[i].startsWith('say')) {
                        const message = lines[i].slice(4).trim().replace(/"/g, '');
                        console.log(message);
                    }
                    i++;
                }
            } else {
                while (i < lines.length && !lines[i].includes('}')) {
                    i++;
                }
            }
        }

        if (line.endsWith('}')) {
            const nextLine = lines[i + 1];
            if (nextLine && nextLine.startsWith('else if')) {
                i++;
                continue;
            }
            if (nextLine && nextLine.startsWith('otherwise')) {
                i++;
                continue;
            }
        }

        i++;
    }
}

const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide a file path.');
    process.exit(1);
}

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        process.exit(1);
    }

    executeScript(data);
});