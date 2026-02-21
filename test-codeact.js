const { Parser } = require("expr-eval");
const parser = new Parser();

function test() {
  const attributes = { user_intent: "Support" };
  const actionExpr = "{{user_intent}} == 'Support' ? 1 : 0".replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, "$1");
  const result = parser.parse(actionExpr).evaluate(attributes);
  
  attributes.needs_support = result;
  console.log("needs_support=", result);

  const condExpr = "{{needs_support}} == '1'".replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, "$1");
  console.log("hydrated condExpr=", condExpr);
  console.log("condition evaluated:", parser.parse(condExpr).evaluate(attributes));
}
test();
