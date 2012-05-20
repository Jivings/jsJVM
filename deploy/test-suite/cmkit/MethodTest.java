public class MethodTest {
    public static void main(String... args) {
        BenchmarkAtom test;
        test = new MethodAtom();
        test.initialize(1000);
        System.out.println(test.execute());
        test.cleanUp();

    }
}
