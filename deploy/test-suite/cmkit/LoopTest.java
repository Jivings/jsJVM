public class LoopTest {
    public static void main(String... args) {
        BenchmarkAtom test;
        test = new LoopAtom();
        test.initialize(1000);
        System.out.println(test.execute());
        test.cleanUp();
    }
}
