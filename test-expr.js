const { Parser } = require("expr-eval");
const parser = new Parser();
try {
  let exprStr = "'Support' == 'Support' ? 1 : 0";
  console.log(parser.parse(exprStr).evaluate({}));
} catch(e) {
  console.error("error 1: " + e.message);
}

try {
  let exprStr2 = "User_Intent == 'Support' ? 1 : 0";
  console.log(parser.parse(exprStr2).evaluate({ User_Intent: "Support" }));
} catch(e) {
  console.error("error 2: " + e.message);
}
