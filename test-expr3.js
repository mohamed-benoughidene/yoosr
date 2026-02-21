const { Parser } = require("expr-eval");
const parser = new Parser();

try {
  let attributes = { user_intent: "Support" };
  let rawExpression = "{{user_intent}} == 'Support' ? 1 : 0";
  let safeExpression = rawExpression.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, "$1");
  console.log("Safe Expression is:", safeExpression);
  console.log(parser.parse(safeExpression).evaluate(attributes));
} catch(e) {
  console.error("error: " + e.message);
}
