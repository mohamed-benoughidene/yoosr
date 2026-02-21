const { Parser } = require("expr-eval");
const parser = new Parser();

function interpolate(template, attributes) {
    if (!template) return "";
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
        return path.split('.').reduce((obj, key) => obj?.[key], attributes) ?? '';
    });
}

try {
  let attributes = { user_intent: "Support" };
  let rawExpression = "{{user_intent}} == 'Support' ? 1 : 0";
  let hydrated = interpolate(rawExpression, attributes);
  console.log("Hydrated is:", hydrated);
  console.log(parser.parse(hydrated).evaluate(attributes));
} catch(e) {
  console.error("error: " + e.message);
}
