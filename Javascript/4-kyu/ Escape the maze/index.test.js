let basicMazes = [];
let yourMazes = []; // Add your own tests in there!

function testMazes(mazes, expectedAnswer = undefined) {
   let pathTester = new PathTester();
   mazes.forEach(function (maze) {
      let your_answer = escape(maze);
      if (expectedAnswer) Test.assertSimilar(your_answer, expectedAnswer);
      else Test.expect(pathTester.testPath(your_answer, maze), pathTester.errorMessage);
   });
}

basicMazes.push(["# #", " > ", "# #"]);
basicMazes.push(["##########", "#>       #", "######## #"]);
basicMazes.push(["# ########", "#       >#", "##########"]);
basicMazes.push(["####### #", "#>#   # #", "#   #   #", "#########"]);
basicMazes.push([
   "##########",
   "#        #",
   "#  ##### #",
   "#  #   # #",
   "#  #^# # #",
   "#  ### # #",
   "#      # #",
   "######## #",
]);
basicMazes.push([
   "#########################################",
   "#<    #       #     #         # #   #   #",
   "##### # ##### # ### # # ##### # # # ### #",
   "# #   #   #   #   #   # #     #   #   # #",
   "# # # ### # ########### # ####### # # # #",
   "#   #   # # #       #   # #   #   # #   #",
   "####### # # # ##### # ### # # # #########",
   "#   #     # #     # #   #   # # #       #",
   "# # ####### ### ### ##### ### # ####### #",
   "# #             #   #     #   #   #   # #",
   "# ############### ### ##### ##### # # # #",
   "#               #     #   #   #   # #   #",
   "##### ####### # ######### # # # ### #####",
   "#   # #   #   # #         # # # #       #",
   "# # # # # # ### # # ####### # # ### ### #",
   "# # #   # # #     #   #     # #     #   #",
   "# # ##### # # ####### # ##### ####### # #",
   "# #     # # # #   # # #     # #       # #",
   "# ##### ### # ### # # ##### # # ### ### #",
   "#     #     #     #   #     #   #   #    ",
   "#########################################",
]);

describe("Fixed tests", function () {
   it("Basic tests", function () {
      testMazes(basicMazes);
   });
});
describe("Your personal tests", function () {
   testMazes(yourMazes);
});
