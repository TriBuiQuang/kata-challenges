// not compelete
function findAll(n, k) {
   // your code here
   let count = 0,
      min = 0,
      max = 0;
   let result = [];
   function search(currNum, prevDigit, sumLeft, digitsLeft) {
      if (sumLeft == 0 && digitsLeft == 0) {
         if (count == 0) min = currNum;
         min = min < currNum ? min : currNum;
         max = max > currNum ? max : currNum;
         count++;
      } else if (digitsLeft != 0) {
         for (let i = prevDigit; i < 10; i++) {
            search(10 * currNum + i, i, sumLeft - i, digitsLeft - 1);
         }
      }
   }

   search(0, 1, n, k);

   if (count > 0) {
      result.push(count);
      result.push(min);
      result.push(max);
   }

   return result;
}
