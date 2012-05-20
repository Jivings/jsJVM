public class StringTest {
    public static void main(String... args) {
        BenchmarkAtom test = new StringAtom();
        test.initialize(1000);
        System.out.println(test.execute());
        test.cleanUp();
    }
}
