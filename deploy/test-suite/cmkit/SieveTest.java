public class SieveTest {
    public static void main(String... args) {
        BenchmarkAtom test;
        test = new SieveAtom();
        test.initialize(1000);
        System.out.println(test.testName());
        System.out.println(test.execute());
        test.cleanUp();

    }
}
