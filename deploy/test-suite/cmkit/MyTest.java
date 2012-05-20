public class MyTest {
    public static void main(String... args) {
        BenchmarkAtom test = new StringAtom();
        test.initialize(1000);
        System.out.println(test.testName());
//        System.out.println(test.execute());
        test.cleanUp();

        test = new LoopAtom();
        test.initialize(1000);
        System.out.println(test.testName());
        System.out.println(test.execute());
        test.cleanUp();

        test = new LogicAtom();
        test.initialize(1000);
        System.out.println(test.testName());
        System.out.println(test.execute());
        test.cleanUp();

        test = new MethodAtom();
        test.initialize(1000);
        System.out.println(test.testName());
        System.out.println(test.execute());
        test.cleanUp();

    }
}
