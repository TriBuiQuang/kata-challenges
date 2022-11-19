const innVal = "imm";
const argVal = "arg";

const operators = ["+", "-", "*", "/"];

const operations = {
   "+": (a, b) => a + b,
   "-": (a, b) => a - b,
   "*": (a, b) => a * b,
   "/": (a, b) => a / b,
};

const isHigherOrSame = (firstOp, secondOp) => {
   const opAdSub = operators.slice(0, 2);
   const opMultiDiv = operators.slice(2, 4);

   const same =
      firstOp === secondOp ||
      (opMultiDiv.includes(firstOp) && opMultiDiv.includes(secondOp)) ||
      (opAdSub.includes(firstOp) && opAdSub.includes(secondOp));

   const higher = opMultiDiv.includes(firstOp) && opAdSub.includes(secondOp);

   return same || higher;
};

class Compiler {
   compile = (program) => this.pass3(this.pass2(this.pass1(program)));

   tokenize = (program) => {
      const regex = /\s*([-+*/\(\)\[\]]|[A-Za-z]+|[0-9]+)\s*/g;

      return program
         .replace(regex, ":$1")
         .substring(1)
         .split(":")
         .map((token) => (isNaN(token) ? token : token | 0));
   };

   tokensToAST = (args, tokens) => {
      const outputStack = [];
      const operatorStack = [];

      const pushOperation = () => {
         const operator = operatorStack.shift();
         const outputB = outputStack.pop();
         const outputA = outputStack.pop();
         outputStack.push({ op: operator, a: outputA, b: outputB });
      };

      for (let i = 0; i < tokens.length; i++) {
         const token = tokens[i];

         if (!operators.includes(token) && token !== "(" && token !== ")") {
            if (!isNaN(token)) {
               outputStack.push({ op: innVal, n: token });
               continue;
            }

            outputStack.push({ op: argVal, n: args[token] });
            continue;
         }

         if (operators.includes(token) || token === "(") {
            while (operatorStack.length && isHigherOrSame(operatorStack[0], token)) {
               pushOperation();
            }

            operatorStack.unshift(token);
            continue;
         }

         if (token === ")") {
            while (operatorStack.length && operatorStack[0] !== "(") {
               pushOperation();
            }

            if (operatorStack[0] === "(") {
               operatorStack.shift();
            }
         }
      }

      while (operatorStack.length) {
         pushOperation();
      }
      return outputStack.pop();
   };

   parseArguments = (tokens) => {
      const errorMessage = "Invalid argument list.";
      const obj = {};
      let argCount = 0;

      if (tokens[0] !== "[") throw new Error(errorMessage);

      for (let i = 1; i < tokens.length; i += 1) {
         const token = tokens[i];

         if (token === "]") {
            return { args: obj, i };
         }

         obj[token] = argCount;
         argCount += 1;
      }

      throw new Error(errorMessage);
   };

   pass1 = (program) => {
      const tokens = this.tokenize(program);
      const { args, i } = this.parseArguments(tokens);
      return this.tokensToAST(args, tokens.slice(i + 1));
   };

   pass2 = (ast) => {
      const performOp = (node) => {
         if (!operators.includes(node.op)) return node;

         if (node.a.op !== innVal) {
            node.a = performOp(node.a);
         }

         if (node.b.op !== innVal) {
            node.b = performOp(node.b);
         }

         if (node.a.op === innVal && node.b.op === innVal) {
            return {
               op: innVal,
               n: operations[node.op](node.a.n, node.b.n),
            };
         }

         return node;
      };
      return performOp(ast);
   };

   pass3 = (ast) => {
      const genCode = (node) => {
         const instructions = [];
         let valRemove = "";
         const operateInstructions = {
            "+": "AD",
            "-": "SU",
            "*": "MU",
            "/": "DI",
         };

         if (operateInstructions[node.op])
            return [...genCode(node.a), "PU", ...genCode(node.b), "SW", "PO", operateInstructions[node.op]];

         switch (node.op) {
            case innVal:
               valRemove = `IM ${node.n}`;
               break;
            case argVal:
               valRemove = `AR ${node.n}`;
               break;
         }

         instructions.unshift(valRemove);
         return instructions;
      };

      return genCode(ast);
   };
}
