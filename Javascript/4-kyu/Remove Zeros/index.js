function removeZeros(array) {
   let notZero = [];
   let zero = [];

   for (let i = 0; i < array.length; i++) {
      if (`${array[i]}` !== "0") {
         notZero = [...notZero, array[i]];
         continue;
      }

      zero = [...zero, array[i]];
   }

   return [...notZero, ...zero];
}
